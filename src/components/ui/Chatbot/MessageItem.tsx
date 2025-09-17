import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { Message } from '../../../types';

interface MessageItemProps {
    message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
    const isUser = message.sender === 'user';
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <View style={[styles.container, isUser ? styles.userContainer : styles.botContainer]}>
            {!isUser && (
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>🤖</Text>
                </View>
            )}

            <View style={[
                styles.messageWrapper,
                isUser ? styles.userMessageWrapper : styles.botMessageWrapper
            ]}>
                <View style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.botBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        isUser ? styles.userText : styles.botText
                    ]}>
                        {message.text}
                    </Text>
                </View>

                <Text style={[
                    styles.timestamp,
                    isUser ? styles.userTimestamp : styles.botTimestamp
                ]}>
                    {formatTime(message.timestamp)}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginVertical: 4,
        paddingHorizontal: 16,
    },
    userContainer: {
        justifyContent: 'flex-end',
    },
    botContainer: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        marginTop: 4,
    },
    avatarText: {
        fontSize: 16,
    },
    messageWrapper: {
        maxWidth: '75%',
    },
    userMessageWrapper: {
        alignItems: 'flex-end',
    },
    botMessageWrapper: {
        alignItems: 'flex-start',
    },
    messageBubble: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        marginBottom: 4,
    },
    userBubble: {
        backgroundColor: '#007AFF',
        borderBottomRightRadius: 4,
    },
    botBubble: {
        backgroundColor: '#f0f0f0',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    userText: {
        color: '#ffffff',
    },
    botText: {
        color: '#333333',
    },
    timestamp: {
        fontSize: 12,
        opacity: 0.6,
    },
    userTimestamp: {
        color: '#333333',
    },
    botTimestamp: {
        color: '#666666',
    },
});

export default MessageItem;