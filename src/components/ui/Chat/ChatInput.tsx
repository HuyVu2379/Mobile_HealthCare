import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

interface ChatInputProps {
    onSendMessage?: (message: string) => void;
    placeholder?: string;
    currentGroupId?: string;
}

const ChatInput: React.FC<ChatInputProps> = React.memo(({ onSendMessage, placeholder = 'Nhập tin nhắn...' }) => {
    const [message, setMessage] = useState('');
    const lockRef = useRef(false);

    // Memoized handle send function
    const handleSend = useCallback(() => {
        const text = message.trim();
        if (!text || !onSendMessage) return;
        if (lockRef.current) return;
        lockRef.current = true;

        onSendMessage(text);
        setMessage('');

        setTimeout(() => { lockRef.current = false; }, 350);
    }, [message, onSendMessage]);

    // Memoized button opacity
    const buttonOpacity = useMemo(() => message.trim() ? 1 : 0.6, [message]);
    const isDisabled = useMemo(() => !message.trim(), [message]);

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

            <TouchableOpacity
                style={[styles.sendButton, { opacity: buttonOpacity }]}
                onPress={handleSend}
                activeOpacity={0.8}
                disabled={isDisabled}
            >
                <Ionicons name="paper-plane" style={styles.sendIcon} />
            </TouchableOpacity>
        </View>
    );
});

const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: 'transparent', gap: 12 },
    inputContainer: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 20, borderWidth: 1, borderColor: '#e0e0e0', minHeight: 40, maxHeight: 100 },
    textInput: { paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#333', textAlignVertical: 'center' },
    sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', elevation: 4 },
    sendIcon: { fontSize: 16, color: '#fff', transform: [{ rotate: '45deg' }] },
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;