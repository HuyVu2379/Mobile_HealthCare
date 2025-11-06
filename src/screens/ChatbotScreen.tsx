import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    StyleSheet,
    Text,
    ImageBackground,
    SafeAreaView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Animated,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Suggestions, ChatInput, ChatSidebar, MessageItem } from '../components';
import { SuggestionItem } from '../types/chat';
import { RootState } from '../store/store';
import { useChatContext } from '../contexts';
import { useWebSocketContext } from '../contexts/WebSocketContext';
// Memoized ChatbotScreen component for better performance
const ChatbotScreen = React.memo(() => {
    const { user } = useSelector((state: RootState) => state.user);
    const { isConnected: connected } = useWebSocketContext();
    const { createAIGroupIfNeeded, currentGroupAIId, currentGroupId, messages, initializeAIGroup, sendMessage, askAIQuestion, error, groups } = useChatContext();

    // States
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [isAIResponding, setIsAIResponding] = useState<boolean>(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Refs
    const slideAnim = useRef(new Animated.Value(-280)).current;
    const lastSendRef = useRef<{ text: string; ts: number } | null>(null);
    const flatListRef = useRef<FlatList>(null);

    // Memoized values
    const currentGroup = useMemo(() =>
        groups.find(group => group.groupId === (currentGroupAIId || currentGroupId)),
        [groups, currentGroupAIId, currentGroupId]
    );

    const currentGroupName = useMemo(() =>
        currentGroup?.groupName || "Trợ lý AI",
        [currentGroup]
    );

    // Memoized messages với performance optimization
    const memoizedMessages = useMemo(() => {
        const validMessages = messages.filter(msg => msg && (msg.messageId || msg.tempMessageId));
        return validMessages.slice().reverse(); // Reverse để sử dụng với FlatList inverted
    }, [messages]);

    // Initialize AI group from storage when component mounts
    useEffect(() => {
        const initializeOnMount = async () => {
            await initializeAIGroup();
            setIsInitialized(true);
        };

        initializeOnMount();
    }, [initializeAIGroup]);

    // Initialize AI group when user is available, WebSocket is connected, and initialization is complete
    useEffect(() => {
        if (user && connected && isInitialized && !currentGroupAIId) {
            createAIGroupIfNeeded(user.userId, user.fullName || user.userId);
        }
    }, [user, connected, isInitialized, currentGroupAIId, createAIGroupIfNeeded]);

    // Messages are now automatically fetched by useChat hook when group is joined

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: isDrawerOpen ? 0 : -280,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isDrawerOpen, slideAnim]);

    const handleSendMessage = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || !user || !currentGroupAIId || isAIResponding) return;

        const now = Date.now();
        if (lastSendRef.current && lastSendRef.current.text === trimmed && (now - lastSendRef.current.ts) < 1000) {
            return; // ⛔ chặn gọi đôi trong ~1s
        }
        lastSendRef.current = { text: trimmed, ts: now };

        // Tạo unique tempMessageId cho user message
        const userTempId = `user_${now}_${Math.random().toString(36).substring(2, 8)}`;

        // 1) Gửi message của user
        sendMessage({
            groupId: currentGroupAIId,
            content: trimmed,
            senderId: user.userId || '',
            messageType: 'TEXT',
            tempMessageId: userTempId,
        });

        // 2) Lấy trả lời AI rồi gửi 1 lần
        setIsAIResponding(true);
        try {
            const response = await askAIQuestion({
                group_id: currentGroupAIId,
                message: trimmed,
                user_id: user?.userId || '',
            });

            // Tạo unique tempMessageId cho AI response
            const aiTempId = `ai_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

            if (response.response) {
                sendMessage({
                    groupId: currentGroupAIId,
                    content: response.response,
                    senderId: 'AI',
                    messageType: 'TEXT',
                    tempMessageId: aiTempId,
                });
            }
        } catch (error) {
            console.error('Error getting AI response:', error);
        } finally {
            setIsAIResponding(false);
        }

        Keyboard.dismiss();
    }, [user, currentGroupAIId, sendMessage, askAIQuestion, isAIResponding]);

    // Optimized render function with React.memo for better performance
    const renderMessage = useCallback(({ item, index }: { item: any, index: number }) => {
        if (!item || (!item.messageId && !item.tempMessageId)) {
            return null;
        }
        return <MessageItem message={item} />;
    }, []);

    // Optimized keyExtractor
    const getItemKey = useCallback((item: any, index: number) => {
        const messageId = item.messageId || item.tempMessageId;
        const timestamp = item.sendAt || item.createdAt || Date.now();
        return messageId ? `msg_${messageId}` : `temp_${timestamp}_${index}`;
    }, []);

    // Optimized getItemLayout for better scroll performance
    const getItemLayout = useCallback((data: any, index: number) => ({
        length: 80, // Estimated item height
        offset: 80 * index,
        index,
    }), []);


    const handleSuggestionPress = useCallback((suggestion: SuggestionItem) => {
        handleSendMessage(suggestion.text);
    }, [handleSendMessage]);

    const toggleDrawer = useCallback(() => {
        setIsDrawerOpen(prev => !prev);
    }, []);

    const closeDrawer = useCallback(() => {
        setIsDrawerOpen(false);
    }, []);

    const dismissKeyboard = useCallback(() => {
        Keyboard.dismiss();
    }, []);

    return (
        <View style={styles.mainContainer}>
            <ImageBackground
                source={require('../assets/chatbotbackground.jpg')}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                <KeyboardAvoidingView
                    style={styles.keyboardAvoid}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={0}
                >
                    <View style={styles.container}>
                        {/* Menu Button - Only show when sidebar is closed */}
                        {!isDrawerOpen && (
                            <TouchableOpacity
                                style={styles.menuButton}
                                onPress={toggleDrawer}
                                activeOpacity={0.7}
                            >
                                <View style={styles.menuIcon}>
                                    <View style={styles.menuLine} />
                                    <View style={styles.menuLine} />
                                    <View style={styles.menuLine} />
                                </View>
                            </TouchableOpacity>
                        )}

                        {/* Header - Only show when there are no messages */}
                        {memoizedMessages.length === 0 && (
                            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                <View style={styles.header}>
                                    {user ? (
                                        <>
                                            <Text style={styles.title}>Trợ lý AI</Text>
                                            <Text style={styles.subtitle}>
                                                Chào mừng bạn đến với trợ lý ảo sức khỏe của bạn
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <Text style={styles.title}>Trợ lý AI</Text>
                                            <Text style={styles.subtitle}>
                                                Vui lòng đăng nhập để sử dụng tính năng này
                                            </Text>
                                        </>
                                    )}
                                </View>
                            </TouchableWithoutFeedback>
                        )}

                        {/* Messages Container */}
                        <View style={[
                            styles.messagesContainer,
                            memoizedMessages.length > 0 && styles.messagesContainerWithMessages
                        ]}>
                            {memoizedMessages.length > 0 ? (
                                <FlatList
                                    ref={flatListRef}
                                    data={memoizedMessages}
                                    keyExtractor={getItemKey}
                                    renderItem={renderMessage}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.messagesList}
                                    style={styles.flatListStyle}
                                    removeClippedSubviews={true}
                                    maxToRenderPerBatch={8}
                                    windowSize={6}
                                    initialNumToRender={10}
                                    updateCellsBatchingPeriod={50}
                                    scrollEventThrottle={16}
                                    keyboardShouldPersistTaps="handled"
                                    onScrollBeginDrag={dismissKeyboard}
                                    getItemLayout={getItemLayout}
                                    disableVirtualization={false}
                                    legacyImplementation={false}
                                />
                            ) : (
                                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                    <View style={styles.welcomeContent}>
                                        <Text style={styles.welcomeText}>
                                            Chào mừng bạn đến với trợ lý AI! Hãy bắt đầu cuộc trò chuyện.
                                        </Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            )}
                        </View>

                        {/* Suggestions */}
                        <View style={styles.suggestionsSection}>
                            <Suggestions
                                onSuggestionPress={handleSuggestionPress}
                                onScrollBegin={dismissKeyboard}
                            />
                        </View>

                        {/* AI Loading Indicator */}
                        {isAIResponding && (
                            <View style={styles.loadingMessageContainer}>
                                <View style={styles.loadingMessageContent}>
                                    <View style={styles.loadingAvatar}>
                                        <Text style={styles.loadingAvatarText}>AI</Text>
                                    </View>
                                    <View style={styles.loadingBubble}>
                                        <ActivityIndicator size="small" color="#007AFF" />
                                        <Text style={styles.loadingText}>Đang suy nghĩ...</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Chat Input */}
                        <View style={styles.inputSection}>
                            <ChatInput
                                onSendMessage={handleSendMessage}
                                placeholder={isAIResponding ? "Đang chờ AI trả lời..." : "Nhập tin nhắn..."}
                                currentGroupId={currentGroupAIId || ''}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </ImageBackground>

            {/* Sidebar Overlay */}
            {isDrawerOpen && (
                <TouchableWithoutFeedback onPress={closeDrawer}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback>
                            <Animated.View
                                style={[
                                    styles.sidebarContainer,
                                    {
                                        transform: [{ translateX: slideAnim }]
                                    }
                                ]}
                            >
                                <SafeAreaView style={styles.sidebarContent}>
                                    <ChatSidebar onClose={closeDrawer} />
                                </SafeAreaView>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    keyboardAvoid: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)', // Overlay tối nhẹ để text dễ đọc
    },
    header: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        opacity: 0.9,
        lineHeight: 22,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    messagesContainer: {
        flex: 1,
        minHeight: 0, // Quan trọng để FlatList có thể scroll
    },
    messagesContainerWithMessages: {
        paddingTop: 60, // Thêm padding top khi có messages để tránh menu button
    },
    welcomeContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    welcomeText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        opacity: 0.8,
        lineHeight: 22,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexGrow: 1,
    },
    flatListStyle: {
        flex: 1,
    },

    suggestionsSection: {
        paddingVertical: 5,
    },
    inputSection: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 8,
    },
    menuButton: {
        position: 'absolute',
        top: 20,
        left: 16,
        zIndex: 1000,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    menuIcon: {
        width: 20,
        height: 16,
        justifyContent: 'space-between',
    },
    menuLine: {
        width: 20,
        height: 2,
        backgroundColor: '#333',
        borderRadius: 1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
    },
    sidebarContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 280,
        backgroundColor: '#2c2c2c',
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: {
            width: 2,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sidebarContent: {
        flex: 1,
    },
    connectionStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
    },
    connectionDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    connectionText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '500',
        opacity: 0.9,
    },
    loadingMessageContainer: {
        flexDirection: 'row',
        marginVertical: 4,
        justifyContent: 'flex-start',
        paddingHorizontal: 16,
    },
    loadingMessageContent: {
        flexDirection: 'row',
        maxWidth: '75%',
    },
    loadingAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        marginTop: 4,
    },
    loadingAvatarText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    loadingBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
        backgroundColor: '#f0f0f0',
        marginTop: 4,
    },
    loadingText: {
        color: '#333333',
        fontSize: 16,
        marginLeft: 8,
        fontStyle: 'italic',
    },

});

export default ChatbotScreen;