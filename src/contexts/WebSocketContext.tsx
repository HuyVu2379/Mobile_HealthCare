import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { SOCKET_ACTIONS } from '../constants/eventSocket';
import { SOCKET_CONFIG } from '../services/socket.service';

export interface WebSocketMessage {
    action: string;
    data: any;
}

interface WebSocketContextType {
    isConnected: boolean;
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
    send: (action: string, data: any) => void;
    connect: () => void;
    disconnect: () => void;
    lastMessage: any;
    subscribe: (callback: (message: any) => void) => () => void;
    authenticate: (userId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
    children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
    const [lastMessage, setLastMessage] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const ws = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<number | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;
    const subscribers = useRef<Set<(message: any) => void>>(new Set());
    const pendingUserId = useRef<string | null>(null);

    const connect = useCallback(() => {
        if (ws.current?.readyState === WebSocket.CONNECTING || ws.current?.readyState === WebSocket.OPEN) {
            return;
        }

        try {
            setConnectionStatus('connecting');
            ws.current = new WebSocket(SOCKET_CONFIG.DEFAULT_URL);

            ws.current.onopen = () => {
                console.log('✅ WebSocket connected');
                setIsConnected(true);
                setConnectionStatus('connected');
                reconnectAttempts.current = 0;

                // Auto-authenticate if userId is pending
                if (pendingUserId.current) {
                    send(SOCKET_ACTIONS.AUTHENTICATION, { userId: pendingUserId.current });
                }
            };

            ws.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    setLastMessage(message);

                    // Notify all subscribers
                    subscribers.current.forEach(callback => {
                        try {
                            callback(message);
                        } catch (error) {
                            console.error('Error in message subscriber:', error);
                        }
                    });
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                    setLastMessage(event.data);
                }
            };

            ws.current.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                setConnectionStatus('error');
            };

            ws.current.onclose = (event) => {
                setIsConnected(false);
                setConnectionStatus('disconnected');

                // Auto reconnect if not manually closed
                if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
                    reconnectAttempts.current++;
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, 3000 * reconnectAttempts.current);
                }
            };
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
            setConnectionStatus('error');
        }
    }, []);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        reconnectAttempts.current = maxReconnectAttempts; // Prevent auto reconnect

        if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
            ws.current.close(1000, 'Manual disconnect'); // 1000 = normal closure
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
                ws.current.send(JSON.stringify(payload));
            } catch (error) {
                console.error('Failed to send WebSocket message:', error);
            }
        }
    }, []);

    const subscribe = useCallback((callback: (message: any) => void) => {
        subscribers.current.add(callback);

        // Return unsubscribe function
        return () => {
            subscribers.current.delete(callback);
        };
    }, []);

    const authenticate = useCallback((userId: string) => {
        pendingUserId.current = userId;

        if (isConnected) {
            send(SOCKET_ACTIONS.AUTHENTICATION, { userId });
            setIsAuthenticated(true);
        }
    }, [isConnected, send]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    const value: WebSocketContextType = {
        isConnected,
        connectionStatus,
        send,
        connect,
        disconnect,
        lastMessage,
        subscribe,
        authenticate
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocketContext = (): WebSocketContextType => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocketContext must be used within a WebSocketProvider');
    }
    return context;
};