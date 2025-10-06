import React, { memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { MessageResponse } from '../../../types/chat';

interface MessageItemProps {
    message: MessageResponse;
}

const MessageItem: React.FC<MessageItemProps> = memo(({ message }) => {
    // Early return for invalid messages
    if (!message || (!message.messageId && !message.tempMessageId)) {
        return null;
    }

    // Memoized values for better performance
    const isUser = React.useMemo(() => String(message.senderId) !== 'AI', [message.senderId]);

    // Memoized time formatting
    const formattedTime = React.useMemo(() => {
        const time = message.sendAt || message.createdAt;
        if (!time) return '';

        try {
            const dateObj = typeof time === 'string' ? new Date(time) : time;
            return dateObj.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return '';
        }
    }, [message.sendAt, message.createdAt]);

    // Memoized message content
    const messageContent = React.useMemo(() => String(message.content || ''), [message.content]);

    // Memoized markdown detection
    const containsMarkdown = React.useMemo(() => {
        const markdownPatterns = [
            /\*\*.*?\*\*/g, // Bold
            /\*.*?\*/g, // Italic
            /`.*?`/g, // Inline code
            /```[\s\S]*?```/g, // Code blocks
            /#{1,6}\s/g, // Headers
            /^\s*[-*+]\s/gm, // Lists
            /^\s*\d+\.\s/gm, // Numbered lists
            /\[.*?\]\(.*?\)/g, // Links
        ];

        return markdownPatterns.some(pattern => pattern.test(messageContent));
    }, [messageContent]);

    // Memoized markdown styles
    const markdownStyles = React.useMemo(() => ({
        body: {
            fontSize: 16,
            lineHeight: 20,
            color: isUserMessage ? '#ffffff' : '#333333',
            margin: 0,
        },
        paragraph: {
            marginTop: 0,
            marginBottom: 8,
            fontSize: 16,
            lineHeight: 20,
            color: isUserMessage ? '#ffffff' : '#333333',
        },
        strong: {
            fontWeight: 'bold' as const,
            color: isUserMessage ? '#ffffff' : '#333333',
        },
        em: {
            fontStyle: 'italic' as const,
            color: isUserMessage ? '#ffffff' : '#333333',
        },
        code_inline: {
            backgroundColor: isUserMessage ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            color: isUserMessage ? '#ffffff' : '#333333',
            paddingHorizontal: 4,
            paddingVertical: 2,
            borderRadius: 3,
            fontSize: 14,
            fontFamily: 'monospace',
        },
        code_block: {
            backgroundColor: isUserMessage ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
            color: isUserMessage ? '#ffffff' : '#333333',
            padding: 12,
            borderRadius: 6,
            fontSize: 14,
            fontFamily: 'monospace',
            marginVertical: 4,
        },
        fence: {
            backgroundColor: isUserMessage ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
            color: isUserMessage ? '#ffffff' : '#333333',
            padding: 12,
            borderRadius: 6,
            fontSize: 14,
            fontFamily: 'monospace',
            marginVertical: 4,
        },
        heading1: {
            fontSize: 20,
            fontWeight: 'bold' as const,
            color: isUserMessage ? '#ffffff' : '#333333',
            marginTop: 4,
            marginBottom: 8,
        },
        heading2: {
            fontSize: 18,
            fontWeight: 'bold' as const,
            color: isUserMessage ? '#ffffff' : '#333333',
            marginTop: 4,
            marginBottom: 6,
        },
        heading3: {
            fontSize: 16,
            fontWeight: 'bold' as const,
            color: isUserMessage ? '#ffffff' : '#333333',
            marginTop: 4,
            marginBottom: 4,
        },
        list: {
            marginVertical: 4,
        },
        list_item: {
            flexDirection: 'row' as const,
            marginVertical: 2,
        },
        bullet_list_icon: {
            marginRight: 8,
            color: isUserMessage ? '#ffffff' : '#333333',
        },
        ordered_list_icon: {
            marginRight: 8,
            color: isUserMessage ? '#ffffff' : '#333333',
        },
        link: {
            color: isUserMessage ? '#ADD8E6' : '#007AFF',
            textDecorationLine: 'underline' as const,
        },
        blockquote: {
            backgroundColor: isUserMessage ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            borderLeftWidth: 4,
            borderLeftColor: isUserMessage ? '#ffffff' : '#cccccc',
            paddingLeft: 12,
            paddingVertical: 8,
            marginVertical: 4,
        },
    });

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
                    {containsMarkdown && !isUser ? (
                        <Markdown
                            style={markdownStyles(isUser)}
                        >
                            {messageContent}
                        </Markdown>
                    ) : (
                        <Text style={[
                            styles.messageText,
                            isUser ? styles.userText : styles.botText
                        ]}>
                            {messageContent}
                        </Text>
                    )}
                </View>

                <Text style={[
                    styles.timestamp,
                    isUser ? styles.userTimestamp : styles.botTimestamp
                ]}>
                    {formatTime(messageTime)}
                </Text>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginVertical: 4,
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

// Custom comparison function for memo
const areEqual = (prevProps: MessageItemProps, nextProps: MessageItemProps) => {
    if (!prevProps.message || !nextProps.message) return false;

    return (
        prevProps.message.messageId === nextProps.message.messageId &&
        prevProps.message.content === nextProps.message.content &&
        prevProps.message.senderId === nextProps.message.senderId &&
        prevProps.message.sendAt === nextProps.message.sendAt &&
        prevProps.message.createdAt === nextProps.message.createdAt
    );
};

MessageItem.displayName = 'MessageItem';

export default memo(MessageItem, areEqual);