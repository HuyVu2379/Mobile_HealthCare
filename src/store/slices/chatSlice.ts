import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatConversation, Message } from '../../types/chat';

interface ChatState {
    conversations: ChatConversation[];
    activeConversationId: string | null;
    isDrawerOpen: boolean;
    isWebSocketConnected: boolean;
    webSocketError: string | null;
}

const initialState: ChatState = {
    conversations: [],
    activeConversationId: null,
    isDrawerOpen: false,
    isWebSocketConnected: false,
    webSocketError: null,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        createConversation: (state, action: PayloadAction<{ title?: string }>) => {
            const newId = Date.now().toString();
            const now = Date.now();
            const newConversation: ChatConversation = {
                id: newId,
                title: action.payload.title || `Cuộc trò chuyện ${state.conversations.length + 1}`,
                messages: [],
                createdAt: now,
                updatedAt: now,
            };

            state.conversations.unshift(newConversation); // Thêm vào đầu danh sách
            state.activeConversationId = newId;
        },

        setActiveConversation: (state, action: PayloadAction<string>) => {
            state.activeConversationId = action.payload;
        },

        addMessageToConversation: (state, action: PayloadAction<{ conversationId: string; message: Message }>) => {
            const { conversationId, message } = action.payload;
            const conversation = state.conversations.find(conv => conv.id === conversationId);

            if (conversation) {
                conversation.messages.push(message);
                conversation.updatedAt = Date.now();

                // Cập nhật title dựa trên tin nhắn đầu tiên của user
                if (conversation.messages.length === 1 && message.sender === 'user') {
                    conversation.title = message.text.length > 30
                        ? message.text.substring(0, 30) + '...'
                        : message.text;
                }
            }
        },

        updateConversationMessages: (state, action: PayloadAction<{ conversationId: string; messages: Message[] }>) => {
            const { conversationId, messages } = action.payload;
            const conversation = state.conversations.find(conv => conv.id === conversationId);

            if (conversation) {
                conversation.messages = messages;
                conversation.updatedAt = Date.now();
            }
        },

        deleteConversation: (state, action: PayloadAction<string>) => {
            const conversationId = action.payload;
            state.conversations = state.conversations.filter(conv => conv.id !== conversationId);

            // Nếu conversation đang active bị xóa, chuyển sang conversation khác hoặc null
            if (state.activeConversationId === conversationId) {
                state.activeConversationId = state.conversations.length > 0 ? state.conversations[0].id : null;
            }
        },

        toggleDrawer: (state) => {
            state.isDrawerOpen = !state.isDrawerOpen;
        },

        setDrawerOpen: (state, action: PayloadAction<boolean>) => {
            state.isDrawerOpen = action.payload;
        },

        clearAllConversations: (state) => {
            state.conversations = [];
            state.activeConversationId = null;
        },

        setWebSocketConnected: (state, action: PayloadAction<boolean>) => {
            state.isWebSocketConnected = action.payload;
            if (action.payload) {
                state.webSocketError = null;
            }
        },

        setWebSocketError: (state, action: PayloadAction<string | null>) => {
            state.webSocketError = action.payload;
            if (action.payload) {
                state.isWebSocketConnected = false;
            }
        },
    },
});

export const {
    createConversation,
    setActiveConversation,
    addMessageToConversation,
    updateConversationMessages,
    deleteConversation,
    toggleDrawer,
    setDrawerOpen,
    clearAllConversations,
    setWebSocketConnected,
    setWebSocketError,
} = chatSlice.actions;

export default chatSlice.reducer;