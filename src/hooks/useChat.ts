import { SOCKET_ACTIONS } from "../constants/eventSocket"
import { useState, useEffect, useCallback, useRef } from "react";
import { CreateGroupRequest, SendMessageRequest, GetGroupsRequest, GetMessageRequest, MemberDTO, MessageResponse } from "../types";
import { StorageService } from "../services/storage.service";
import { useWebSocketContext } from "../contexts/WebSocketContext";
import { askAI } from "../services/AI.service";
import { ChatRequest, ChatResponse } from "../types/IAI";
export const useChat = (userId: String) => {
    const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
    const [currentGroupAIId, setCurrentGroupAIId] = useState<string | null>(null);
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [groups, setGroups] = useState<any[]>([]);
    const [isCreatingAIGroup, setIsCreatingAIGroup] = useState<boolean>(false);
    const [groupExistsInfo, setGroupExistsInfo] = useState<string | null>(null);

    // Use ref to track processed message IDs to prevent duplicates across re-renders
    const processedMessageIds = useRef<Set<string>>(new Set());

    // Use shared WebSocket context
    const { isConnected: connected, send, subscribe } = useWebSocketContext();

    // Initialize currentGroupAIId from AsyncStorage
    const initializeAIGroup = useCallback(async (): Promise<void> => {
        try {
            const savedGroupId = await StorageService.getCurrentGroupAIId();
            if (savedGroupId) {
                setCurrentGroupAIId(savedGroupId);
            }
        } catch (error) {
            console.error('Error initializing AI group:', error);
        }
    }, []);

    // Initialize AI group from storage when hook is created
    useEffect(() => {
        initializeAIGroup();
    }, [initializeAIGroup]);

    // Send authentication when connected and userId is available
    useEffect(() => {
        if (connected && userId) {
            send(SOCKET_ACTIONS.AUTHENTICATION, { userId });
        }
    }, [connected, userId, send]);

    // Send join_group when currentGroupAIId or currentGroupId is ready
    useEffect(() => {
        const activeGroupId = currentGroupAIId || currentGroupId;
        if (connected && activeGroupId) {
            send(SOCKET_ACTIONS.JOIN_GROUP, { groupId: activeGroupId });
        }
    }, [connected, currentGroupAIId, currentGroupId, send]);

    // Subscribe to WebSocket messages
    useEffect(() => {
        const handleMessage = (data: any) => {
            // Handle different message formats - check if data has action or if it's the action itself
            const action = data.action || data;
            const messageData = data.data || data;

            switch (action) {
                case SOCKET_ACTIONS.ERROR:
                    const errorMessage = messageData.message || messageData || "Unknown error";

                    // Check if this is a "group already exists" notification
                    if (typeof errorMessage === 'string' &&
                        errorMessage.toLowerCase().includes('group with these members already exists')) {
                        setGroupExistsInfo(errorMessage);
                        setError(null); // Clear any error
                        setIsCreatingAIGroup(false);

                        // Auto-clear the info message after 5 seconds
                        setTimeout(() => setGroupExistsInfo(null), 5000);
                    } else {
                        // This is a real error
                        setError(errorMessage);
                        setIsCreatingAIGroup(false);
                    }
                    break;
                case SOCKET_ACTIONS.GROUP.GET_GROUPS_RESPONSE:
                    setGroups(messageData || []);
                    setLoading(false);
                    break;
                case SOCKET_ACTIONS.GROUP.GET_MESSAGES_RESPONSE:
                    // Clear processed IDs when loading new messages history
                    processedMessageIds.current.clear();
                    // Add all message IDs from history to processed set
                    if (Array.isArray(messageData)) {
                        messageData.forEach((msg: MessageResponse) => {
                            const msgId = msg.messageId || msg.tempMessageId;
                            if (msgId) {
                                processedMessageIds.current.add(msgId.toString());
                            }
                        });
                    }
                    setMessages(messageData || []);
                    setLoading(false);
                    break;
                case SOCKET_ACTIONS.GROUP.MESSAGE_RECEIVED:
                    // Get unique identifier for this message
                    const messageId = messageData.messageId || messageData.tempMessageId;
                    const messageIdStr = messageId?.toString();

                    // Check if we've already processed this message
                    if (messageIdStr && processedMessageIds.current.has(messageIdStr)) {
                        return;
                    }

                    // Add to processed set
                    if (messageIdStr) {
                        processedMessageIds.current.add(messageIdStr);
                    }

                    // Check for duplicate messages in current state (as backup)
                    setMessages(prev => {
                        const isDuplicate = prev.some(msg =>
                            (msg.messageId && msg.messageId === messageId) ||
                            (msg.tempMessageId && msg.tempMessageId === messageId)
                        );

                        if (isDuplicate) {
                            return prev;
                        }

                        // Insert at beginning of array since FlatList is inverted
                        return [messageData, ...prev];
                    });
                    break;
                case SOCKET_ACTIONS.GROUP.GROUP_CREATED:
                    // Check if this is an AI group (memberIds includes "AI")
                    const memberIds = messageData.members?.map((member: MemberDTO) => member.userId) || messageData.memberIds || [];
                    if (memberIds.includes("AI")) {
                        const groupId = messageData.groupId?.toString() || messageData.id?.toString();
                        setCurrentGroupAIId(groupId);
                        setIsCreatingAIGroup(false); // Reset creating flag
                        // Persist to AsyncStorage
                        StorageService.saveCurrentGroupAIId(groupId);
                    }
                    setGroups(prev => [...prev, messageData]);
                    setLoading(false);
                    break;
                case SOCKET_ACTIONS.GROUP.GROUP_DELETED:
                    const deletedGroupId = messageData.groupId?.toString() || messageData.id?.toString();
                    // Filter out deleted group from groups list
                    setGroups(prev => prev.filter(group =>
                        (group.groupId?.toString() || group.id?.toString()) !== deletedGroupId
                    ));
                    // If deleted group is current AI group, clear and recreate
                    if (deletedGroupId === currentGroupAIId) {
                        StorageService.clearCurrentGroupAIId();
                        setCurrentGroupAIId(null);
                        setIsCreatingAIGroup(false);
                        // Auto recreate AI group after a short delay if connected and userId exists
                        if (connected && userId) {
                            setTimeout(() => {
                                createAIGroupIfNeeded(userId.toString(), undefined, false); // Don't force, just create if needed
                            }, 150);
                        }
                    }
                    break;
                default:
                    break;
            }
        };

        const unsubscribe = subscribe(handleMessage);
        return unsubscribe;
    }, [subscribe]);

    // Create AI group if it doesn't exist or force create new one
    const createAIGroupIfNeeded = useCallback((userId: string | null, userFullName?: string | null, force: boolean = false) => {
        // Check if we really need to create a group
        const shouldCreate = force || (!currentGroupAIId && !isCreatingAIGroup);

        if (shouldCreate && connected && userId) {
            // If forcing and there's an existing AI group, clear it first
            if (force && currentGroupAIId) {
                StorageService.clearCurrentGroupAIId();
                setCurrentGroupAIId(null);
            }

            setIsCreatingAIGroup(true);
            send(SOCKET_ACTIONS.GROUP.CREATE_GROUP, {
                groupName: "AI Chat - " + Date.now().toString(),
                appointmentId: "",
                members: [
                    {
                        userId: userId,
                        fullName: userFullName || "User",
                        avatarUrl: ""
                    },
                    {
                        userId: "AI",
                        fullName: "Trợ lý AI" + Date.now().toString(),
                        avatarUrl: ""
                    }
                ]
            });
            setLoading(true);
        }
    }, [currentGroupAIId, isCreatingAIGroup, connected, send]);

    // Check if AI group exists in groups list
    const findAIGroupInList = useCallback((userId: string) => {
        return groups.find((group: any) =>
            group.memberIds.includes('AI') && group.memberIds.includes(userId)
        );
    }, [groups]);

    // Clear AI group storage if group no longer exists
    const clearAIGroupStorage = useCallback(async () => {
        try {
            await StorageService.clearCurrentGroupAIId();
            setCurrentGroupAIId(null);
        } catch (error) {
            console.error('Error clearing AI group storage:', error);
        }
    }, []);

    const createGroup = useCallback((group: CreateGroupRequest) => {
        send(SOCKET_ACTIONS.GROUP.CREATE_GROUP, group);
        setLoading(true);
    }, [send]);

    const sendMessage = useCallback((content: SendMessageRequest) => {
        send(SOCKET_ACTIONS.GROUP.SEND_MESSAGE, content);
    }, [send]);

    const getGroups = useCallback((data: GetGroupsRequest) => {
        send(SOCKET_ACTIONS.GROUP.GET_GROUPS, data);
        setLoading(true);
    }, [send]);

    const getMessages = useCallback((data: GetMessageRequest) => {
        send(SOCKET_ACTIONS.GROUP.GET_MESSAGES, data);
        setLoading(true);
    }, [send]);

    const askAIQuestion = useCallback(async (question: ChatRequest): Promise<ChatResponse> => {
        if (!userId) throw new Error("User ID is required to ask AI");
        const response = await askAI({
            message: question.message,
            user_id: question.user_id,
            group_id: question.group_id
        });
        return response;
    }, [userId]);

    const joinGroup = useCallback((groupId: string) => {
        if (connected && groupId) {
            send(SOCKET_ACTIONS.JOIN_GROUP, { groupId });
        }
    }, [connected, send]);

    // Switch to a specific group and load its messages
    const switchToGroup = useCallback((groupId: string) => {
        if (!connected || !groupId) {
            return;
        }

        // Clear current messages and processed IDs
        setMessages([]);
        processedMessageIds.current.clear();
        setLoading(true);

        // Set the new current group (check if it's AI group)
        const targetGroup = groups.find(group => group.groupId?.toString() === groupId);
        const isAIGroup = targetGroup?.members?.some((member: MemberDTO) => member.userId === 'AI') ||
            targetGroup?.memberIds?.includes('AI');

        if (isAIGroup) {
            setCurrentGroupAIId(groupId);
            StorageService.saveCurrentGroupAIId(groupId);
            setCurrentGroupId(null);
        } else {
            setCurrentGroupId(groupId);
            setCurrentGroupAIId(null);
            StorageService.clearCurrentGroupAIId();
        }

        // Join the group
        send(SOCKET_ACTIONS.JOIN_GROUP, { groupId });

        // Fetch messages for the group
        getMessages({ groupId, page: 0, size: 50 });
    }, [connected, groups, send, getMessages]);

    const deleteGroup = useCallback(({ groupId, userId }: { groupId: string, userId: string }) => {
        if (connected && groupId && userId) {
            send(SOCKET_ACTIONS.GROUP.DELETE_GROUP, { groupId, userId });
        }
    }, [connected, send]);


    // Auto fetch messages when group is joined and connected
    useEffect(() => {
        const activeGroupId = currentGroupAIId || currentGroupId;
        if (activeGroupId && connected) {
            getMessages({ groupId: activeGroupId, page: 0, size: 50 });
        }
    }, [currentGroupId, currentGroupAIId, connected, getMessages]);

    return {
        messages,
        loading,
        error,
        groups,
        createGroup,
        sendMessage,
        getGroups,
        getMessages,
        connected,
        currentGroupId,
        setCurrentGroupId,
        currentGroupAIId,
        setCurrentGroupAIId,
        initializeAIGroup,
        createAIGroupIfNeeded,
        findAIGroupInList,
        clearAIGroupStorage,
        isCreatingAIGroup,
        askAIQuestion,
        setMessages,
        joinGroup,
        deleteGroup,
        switchToGroup,
        groupExistsInfo,
        setGroupExistsInfo
    }
}