// Socket-related types
export interface SocketMessage {
    id?: string;
    type: string;
    content: any;
    timestamp: string;
    userId?: string;
    targetUserId?: string;
}

export interface ChatMessage extends SocketMessage {
    type: 'CHAT';
    content: string;
    userId: string;
    username?: string;
    avatar?: string;
}

export interface NotificationMessage extends SocketMessage {
    type: 'NOTIFICATION';
    title: string;
    content: string;
    targetUserId?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface SocketStatus {
    isConnected: boolean;
    isConnecting: boolean;
    subscriptionCount: number;
    reconnectAttempts: number;
    socketUrl: string;
}

export interface SocketConfig {
    url: string;
    heartbeatIncoming?: number;
    heartbeatOutgoing?: number;
    reconnectDelay?: number;
    maxReconnectAttempts?: number;
    debug?: boolean;
}