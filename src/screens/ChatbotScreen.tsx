import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Text,
    ImageBackground,
    SafeAreaView,
    StatusBar,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import { Suggestions, ChatInput, MessageItem } from '../components';
import { Message, SuggestionItem } from '../types/chat';

const ChatbotScreen = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Danh sách câu trả lời mẫu của bot
    const botResponses = [
        "Cảm ơn bạn đã đặt câu hỏi! Tôi sẽ giúp bạn tìm hiểu về vấn đề sức khỏe này.",
        "Để có lời khuyên chính xác nhất, bạn nên tham khảo ý kiến bác sĩ chuyên khoa.",
        "Theo nghiên cứu y khoa, việc duy trì chế độ ăn uống cân bằng rất quan trọng.",
        "Tôi khuyên bạn nên tập thể dục đều đặn và uống đủ nước mỗi ngày.",
        "Có vẻ như bạn quan tâm đến sức khỏe. Điều đó thật tuyệt vời!",
        "Bạn có thể chia sẻ thêm chi tiết để tôi hỗ trợ bạn tốt hơn không?",
    ];

    // Tự động cuộn xuống tin nhắn mới nhất - với check an toàn
    const scrollToBottom = () => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    };

    const handleSuggestionPress = (suggestion: SuggestionItem) => {
        sendUserMessage(suggestion.text);
    };

    const sendUserMessage = (text: string) => {
        // Tắt keyboard khi gửi tin nhắn
        Keyboard.dismiss();

        const userMessage: Message = {
            id: Date.now().toString(),
            text,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        scrollToBottom();

        // Giả lập bot typing và trả lời sau 1-2 giây
        setIsTyping(true);
        setTimeout(() => {
            const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: randomResponse,
                sender: 'bot',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
            scrollToBottom();
        }, Math.random() * 1000 + 1000); // 1-2 giây
    };

    const handleSendMessage = (message: string) => {
        sendUserMessage(message);
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <MessageItem message={item} />
    );

    const renderTypingIndicator = () => {
        if (!isTyping) return null;

        return (
            <View style={styles.typingContainer}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>🤖</Text>
                </View>
                <View style={styles.typingBubble}>
                    <Text style={styles.typingText}>Đang nhập...</Text>
                </View>
            </View>
        );
    };

    const showWelcome = messages.length === 0;

    return (
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
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={styles.container}>
                        {/* Header - chỉ hiển thị khi chưa có tin nhắn */}
                        {showWelcome && (
                            <View style={styles.header}>
                                <Text style={styles.title}>Trợ lý AI</Text>
                                <Text style={styles.subtitle}>
                                    Chào mừng bạn đến với trợ lý ảo sức khỏe của bạn
                                </Text>
                            </View>
                        )}

                        {/* Danh sách tin nhắn */}
                        <View style={styles.messagesContainer}>
                            {showWelcome ? (
                                // Hiển thị welcome content khi chưa có tin nhắn
                                <View style={styles.welcomeContent}>
                                    {/* Phần này để trống hoặc hiển thị nội dung khác */}
                                </View>
                            ) : (
                                // Hiển thị danh sách tin nhắn
                                <>
                                    <FlatList
                                        ref={flatListRef}
                                        data={messages}
                                        renderItem={renderMessage}
                                        keyExtractor={item => item.id}
                                        style={styles.messagesList}
                                        contentContainerStyle={styles.messagesContent}
                                        showsVerticalScrollIndicator={false}
                                        onScrollBeginDrag={dismissKeyboard}
                                    />
                                    {renderTypingIndicator()}
                                </>
                            )}
                        </View>

                        {/* Phần gợi ý - luôn hiển thị gần input */}
                        <View style={styles.suggestionsSection}>
                            <Suggestions
                                onSuggestionPress={handleSuggestionPress}
                                onScrollBegin={dismissKeyboard}
                            />
                        </View>

                        {/* Thanh nhập tin nhắn */}
                        <View style={styles.inputSection}>
                            <ChatInput
                                onSendMessage={handleSendMessage}
                                placeholder="Nhập tin nhắn..."
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
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
    },
    welcomeContent: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingTop: 20,
    },
    messagesList: {
        flex: 1,
    },
    messagesContent: {
        paddingVertical: 8,
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    avatarText: {
        fontSize: 16,
    },
    typingBubble: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
    },
    typingText: {
        color: '#666',
        fontSize: 14,
        fontStyle: 'italic',
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
});

export default ChatbotScreen;