import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Text,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
interface ChatInputProps {
    onSendMessage?: (message: string) => void;
    placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage,
    placeholder = 'Nhập tin nhắn...',
}) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim() && onSendMessage) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    return (
        <View style={styles.container}>
            {/* TextInput */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    value={message}
                    onChangeText={setMessage}
                    placeholder={placeholder}
                    placeholderTextColor="#999"
                    multiline
                    maxLength={500}
                />
            </View>

            {/* Nút gửi */}
            <TouchableOpacity
                style={[
                    styles.sendButton,
                    { opacity: message.trim() ? 1 : 0.6 }
                ]}
                onPress={handleSend}
                activeOpacity={0.8}
                disabled={!message.trim()}
            >
                <Ionicons name="paper-plane" style={styles.sendIcon} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'transparent',
        gap: 12,
    },
    inputContainer: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        minHeight: 40,
        maxHeight: 100,
    },
    textInput: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        textAlignVertical: 'center',
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    sendIcon: {
        fontSize: 16,
        color: '#fff',
        transform: [{ rotate: '45deg' }],
    },
});

export default ChatInput;