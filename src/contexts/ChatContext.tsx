import React, { createContext, useContext, ReactNode } from 'react';
import { useChat } from '../hooks/useChat';
import { useAuthContext } from './AuthContext';

// Lấy kiểu trả về của useChat hook
type UseChatReturnType = ReturnType<typeof useChat>;

// Tạo context
const ChatContext = createContext<UseChatReturnType | null>(null);

// Tạo Provider component
interface ChatProviderProps {
    children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    const { user } = useAuthContext();
    const chat = useChat(user?.userId || '');

    return (
        <ChatContext.Provider value={chat}>
            {children}
        </ChatContext.Provider>
    );
};

// Tạo custom hook để sử dụng context
export const useChatContext = (): UseChatReturnType => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};
