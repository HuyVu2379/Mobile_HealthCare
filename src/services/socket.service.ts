import { useWebSocket, WebSocketCallbacks } from '../hooks/useWebSocket';
import { SOCKET_ACTIONS } from '../constants/eventSocket';
// Service class để sử dụng WebSocket trong các component khác
export class SocketService {
    private static instance: SocketService;
    private wsUrl: string;
    private callbacks: WebSocketCallbacks;

    private constructor(url: string, callbacks: WebSocketCallbacks = {}) {
        this.wsUrl = url;
        this.callbacks = callbacks;
    }

    static getInstance(url?: string, callbacks?: WebSocketCallbacks): SocketService {
        if (!SocketService.instance) {
            if (!url) {
                throw new Error('URL is required for first initialization');
            }
            SocketService.instance = new SocketService(url, callbacks);
        }
        return SocketService.instance;
    }

    getWebSocketHook() {
        return useWebSocket(this.wsUrl, this.callbacks);
    }

    updateCallbacks(newCallbacks: WebSocketCallbacks) {
        this.callbacks = { ...this.callbacks, ...newCallbacks };
    }
}

// // Utility functions for common WebSocket operations
// export const createSocketPayload = (data: any) => ({
//     data
// });

export const isValidSocketMessage = (message: any): boolean => {
    return message && typeof message === 'object' && 'action' in message;
};

// Constants for common actions


export type SocketAction = typeof SOCKET_ACTIONS[keyof typeof SOCKET_ACTIONS];

// Default configuration
export const SOCKET_CONFIG = {
    DEFAULT_URL: 'ws://10.0.2.2:8080/ws/communication',
    RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 3000,
} as const;

export default SocketService;