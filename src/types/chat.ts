export interface Message {
    id?: string;
    messageId?: string;
    text?: string;
    content?: string;
    sender?: string;
    senderId?: string;
    timestamp?: number; // Changed from Date to timestamp number
    createdAt?: string;
}

export interface SuggestionItem {
    id: string;
    text: string;
}

export interface ChatConversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number; // Changed from Date to timestamp number
    updatedAt: number; // Changed from Date to timestamp number
}

export interface MemberDTO {
    userId: String | null;
    fullName: String | null;
    avatarUrl: String | null;
}
export interface CreateGroupRequest {
    groupName: String;
    appointmentId: String;
    members: MemberDTO[];
}

export interface GroupResponse {
    groupId: String;
    groupName: String;
    appointmentId: String;
    lastMessageContent: String;
    timeLastMessage: String;
    members: MemberDTO[];
    createdAt: Date;
    updatedAt: Date;
}

export interface MessageResponse {
    messageId: String;
    groupId: String;
    senderId: String;
    receiverId: String;
    content: String;
    sendAt: Date;
    createdAt: Date;
    tempMessageId: String | null; // Temporary ID for client-side tracking
}

export interface GetMessageRequest {
    groupId: String;
    page: number;
    size: number;
}

export interface GetGroupsRequest {
    userId: String;
    page: number;
    size: number;
}

export interface SendMessageRequest {
    groupId: String;
    senderId: String;
    content: String;
    messageType: String; // "TEXT", "IMAGE", "FILE", ...
    tempMessageId: String | null; // Temporary ID for client-side tracking
}

export interface DeleteGroupRequest {
    groupId: String;
    userId: String; // ID của người yêu cầu xóa group (để kiểm tra quyền)
}