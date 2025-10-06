import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketMessage {
    action: string;
    data: any;
}

export interface WebSocketCallbacks {
    onOpen?: () => void;
    onMessage?: (message: any) => void;
    onError?: (error: Event) => void;
    onClose?: () => void;
}

export interface WebSocketHookReturn {
    isConnected: boolean;
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
    send: (action: string, data: any) => void;
    connect: () => void;
    disconnect: () => void;
    lastMessage: any;
}

export const useWebSocket = (
    url: string,
    callbacks?: WebSocketCallbacks
): WebSocketHookReturn => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
    const [lastMessage, setLastMessage] = useState<any>(null);

    const ws = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<number | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    const connect = useCallback(() => {
        if (ws.current?.readyState === WebSocket.CONNECTING || ws.current?.readyState === WebSocket.OPEN) {
            return;
        }

        try {
            setConnectionStatus('connecting');
            ws.current = new WebSocket(url);

            ws.current.onopen = () => {
                console.log('WebSocket connected to:', url);
                setIsConnected(true);
                setConnectionStatus('connected');
                reconnectAttempts.current = 0;
                callbacks?.onOpen?.();
            };

            ws.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('WebSocket message received:', message);
                    setLastMessage(message);
                    callbacks?.onMessage?.(message);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                    setLastMessage(event.data);
                    callbacks?.onMessage?.(event.data);
                }
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                setConnectionStatus('error');
                callbacks?.onError?.(error);
            };

            ws.current.onclose = () => {
                console.log('WebSocket connection closed');
                setIsConnected(false);
                setConnectionStatus('disconnected');
                callbacks?.onClose?.();

                // Auto reconnect
                if (reconnectAttempts.current < maxReconnectAttempts) {
                    reconnectAttempts.current++;
                    console.log(`Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, 3000 * reconnectAttempts.current); // Exponential backoff
                }
            };
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
            setConnectionStatus('error');
        }
    }, [url, callbacks]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        reconnectAttempts.current = maxReconnectAttempts; // Prevent auto reconnect

        if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
            ws.current.close();
        }

        setIsConnected(false);
        setConnectionStatus('disconnected');
    }, []);

    const send = useCallback((action: string, data: any) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const payload: WebSocketMessage = {
                action,
                data
            };

            try {
                const jsonPayload = JSON.stringify(payload);
                console.log('Sending WebSocket message:', jsonPayload);
                ws.current.send(jsonPayload);
            } catch (error) {
                console.error('Failed to send WebSocket message:', error);
            }
        } else {
            console.warn('WebSocket is not connected. Cannot send message.');
        }
    }, []);

    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        isConnected,
        connectionStatus,
        send,
        connect,
        disconnect,
        lastMessage
    };
};

export default useWebSocket;