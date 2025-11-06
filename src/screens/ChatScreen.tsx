import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useChatContext, useAuthContext } from '../contexts';
import { MessageResponse, SendMessageRequest } from '../types';
import { colors, spacing } from '../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ChatScreen: React.FC = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { groupId, groupName } = route.params as { groupId: string, groupName: string };
    const { user } = useAuthContext();
    const {
        messages,
        loading,
        error,
        sendMessage,
        switchToGroup,
        currentGroupId,
        currentGroupAIId,
        groupExistsInfo,
        setGroupExistsInfo
    } = useChatContext();
    const [newMessage, setNewMessage] = useState('');
    const flatListRef = useRef<FlatList>(null);

    // Memoized messages - reverse để hiển thị đúng thứ tự (giống ChatbotScreen)
    const displayMessages = useMemo(() => {
        const validMessages = messages.filter(msg => msg && (msg.messageId || msg.tempMessageId));
        return validMessages.slice().reverse();
    }, [messages]);

    // Switch to group when component mounts or groupId changes
    useEffect(() => {
        if (groupId) {
            console.log('📱 ChatScreen: Switching to group:', groupId);
            switchToGroup(groupId);
        }
    }, [groupId, switchToGroup]);

    // Auto scroll to end when messages change
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    // Handle group exists info message
    useEffect(() => {
        if (groupExistsInfo) {
            console.log('ℹ️ ChatScreen: Group exists info:', groupExistsInfo);
            Alert.alert(
                'Thông báo',
                'Cuộc trò chuyện với bác sĩ này đã tồn tại. Bạn có thể tiếp tục trò chuyện trong nhóm chat hiện có.',
                [
                    {
                        text: 'Đã hiểu',
                        onPress: () => setGroupExistsInfo(null),
                    }
                ]
            );
        }
    }, [groupExistsInfo, setGroupExistsInfo]);

    const handleSend = () => {
        if (newMessage.trim() && user?.userId && groupId) {
            const message: SendMessageRequest = {
                groupId,
                senderId: user.userId.toString(),
                content: newMessage.trim(),
                messageType: 'TEXT',
                tempMessageId: Date.now().toString(),
            };
            sendMessage(message);
            setNewMessage('');
        }
    };

    const renderMessage = ({ item }: { item: MessageResponse }) => {
        const isMyMessage = item.senderId?.toString() === user?.userId?.toString();
        return (
            <View style={[styles.messageContainer, isMyMessage ? styles.myMessage : styles.otherMessage]}>
                <Text style={[styles.messageText, isMyMessage && styles.myMessageText]}>
                    {item.content?.toString()}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary[500]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{groupName}</Text>
                <View style={{ width: 24 }} />
            </View>
            {loading && messages.length === 0 ? (
                <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary[500]} />
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={displayMessages}
                    renderItem={renderMessage}
                    keyExtractor={(item, index) =>
                        item.messageId?.toString() || item.tempMessageId?.toString() || `message-${index}`
                    }
                    style={styles.messageList}
                    contentContainerStyle={styles.messageListContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />
            )}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Nhập tin nhắn..."
                    placeholderTextColor={colors.gray[500]}
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                    <Ionicons name="send" size={24} color={colors.white} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.gray[900],
    },
    messageList: {
        flex: 1,
        paddingHorizontal: spacing[4],
    },
    messageListContent: {
        paddingVertical: spacing[2],
    },
    messageContainer: {
        padding: spacing[3],
        borderRadius: 12,
        marginVertical: spacing[1],
        maxWidth: '80%',
    },
    myMessage: {
        backgroundColor: colors.primary[500],
        alignSelf: 'flex-end',
    },
    otherMessage: {
        backgroundColor: colors.gray[200],
        alignSelf: 'flex-start',
    },
    messageText: {
        fontSize: 16,
        color: colors.gray[900],
    },
    myMessageText: {
        color: colors.white,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: spacing[2],
        borderTopWidth: 1,
        borderTopColor: colors.gray[200],
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 40,
        backgroundColor: colors.gray[100],
        borderRadius: 20,
        paddingHorizontal: spacing[4],
        marginRight: spacing[2],
        fontSize: 16,
        color: colors.gray[900],
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ChatScreen;
