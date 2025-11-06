import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { useChat } from '../../../hooks/useChat';

interface ChatSidebarProps {
    onClose?: () => void;
}

// Memoized ChatSidebar component for better performance
const ChatSidebar: React.FC<ChatSidebarProps> = React.memo(({ onClose }) => {
    const user = useSelector((state: RootState) => state.user.user);

    // States for component
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    // Use chat hook
    const {
        groups,
        loading,
        error,
        getGroups,
        deleteGroup,
        connected,
        currentGroupAIId,
        createAIGroupIfNeeded,
        switchToGroup,
    } = useChat(user?.userId || '');

    // Load groups when component mounts
    useEffect(() => {
        if (connected && user?.userId) {
            getGroups({
                userId: user.userId,
                page: 0,
                size: 50
            });
        }
    }, [connected, user?.userId, getGroups]);



    // Memoized date formatting function
    const formatDate = useCallback((timestamp: string | number) => {
        const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
        const now = Date.now();
        const diffTime = now - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Hôm nay';
        } else if (diffDays === 1) {
            return 'Hôm qua';
        } else if (diffDays < 7) {
            return `${diffDays} ngày trước`;
        } else {
            return date.toLocaleDateString('vi-VN');
        }
    }, []);

    // Memoized handle group selection
    const handleSelectGroup = useCallback((groupId: string) => {
        setSelectedGroupId(groupId);
        switchToGroup(groupId);
        if (onClose) onClose();
    }, [switchToGroup, onClose]);

    // Memoized handle group deletion
    const handleDeleteGroup = useCallback((groupId: string) => {
        if (!user?.userId) {
            Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
            return;
        }

        Alert.alert(
            'Xóa nhóm',
            'Bạn có chắc chắn muốn xóa nhóm này không?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: () => deleteGroup({ groupId, userId: user.userId! })
                }
            ]
        );
    }, [user?.userId, deleteGroup]);

    // Memoized handle new AI conversation
    const handleNewAIConversation = useCallback(() => {
        if (!user) {
            Alert.alert('Lỗi', 'Vui lòng đăng nhập để tạo cuộc trò chuyện mới');
            return;
        }

        console.log('🤖 Forcing new AI conversation for user:', user.userId);
        createAIGroupIfNeeded(user.userId, user.fullName || user.userId, true); // force = true
        if (onClose) onClose();
    }, [user, createAIGroupIfNeeded, onClose]);



    // Memoized render function for better FlatList performance
    const renderGroupItem = useCallback(({ item }: { item: any }) => (
        <TouchableOpacity
            style={[
                styles.conversationItem,
                item.groupId === selectedGroupId && styles.activeItem,
            ]}
            onPress={() => handleSelectGroup(item.groupId)}
        >
            <View style={styles.conversationContent}>
                <Text
                    style={[
                        styles.conversationTitle,
                        item.groupId === selectedGroupId && styles.activeTitle,
                    ]}
                    numberOfLines={2}
                >
                    {item.groupName || 'Nhóm không tên'}
                </Text>
                <Text style={styles.conversationDate}>
                    {formatDate(item.updatedAt || item.createdAt)}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteGroup(item.groupId)}
            >
                <Text style={styles.deleteText}>×</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    ), [selectedGroupId, handleSelectGroup, handleDeleteGroup, formatDate]);

    // Memoized keyExtractor for FlatList
    const getItemKey = useCallback((item: any) =>
        item.groupId?.toString() || Math.random().toString(),
        []
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.newChatButton, styles.aiChatButton]}
                    onPress={handleNewAIConversation}
                    disabled={!user}
                >
                    <Text style={styles.newChatButtonText}>Cuộc trò chuyện mới</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.conversationsList}>
                {loading ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                            Đang tải nhóm chat...
                        </Text>
                    </View>
                ) : groups.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                            Chưa có nhóm chat nào
                        </Text>
                        <Text style={styles.emptySubtext}>
                            Nhấn "Cuộc trò chuyện mới" để tạo nhóm
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={groups.filter(g => g.groupId.includes('-AI') && g.groupName?.includes("AI"))}
                        renderItem={renderGroupItem}
                        keyExtractor={getItemKey}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={10}
                        windowSize={10}
                        initialNumToRender={10}
                        updateCellsBatchingPeriod={50}
                    />
                )}
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Trợ lý AI sức khỏe</Text>
                {error && (
                    <Text style={styles.errorText}>
                        {error}
                    </Text>
                )}
            </View>


        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2c2c2c',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#404040',
        gap: 8,
    },
    newChatButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    aiChatButton: {
        backgroundColor: '#28a745',
    },
    newChatButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    conversationsList: {
        flex: 1,
        paddingTop: 8,
    },
    listContent: {
        paddingHorizontal: 8,
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginVertical: 2,
        marginHorizontal: 8,
        borderRadius: 8,
        backgroundColor: 'transparent',
    },
    activeItem: {
        backgroundColor: '#404040',
    },
    conversationContent: {
        flex: 1,
        marginRight: 8,
    },
    conversationTitle: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 4,
        lineHeight: 18,
    },
    activeTitle: {
        fontWeight: '600',
    },
    conversationDate: {
        color: '#888',
        fontSize: 12,
    },
    deleteButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtext: {
        color: '#888',
        fontSize: 14,
        textAlign: 'center',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#404040',
        alignItems: 'center',
    },
    footerText: {
        color: '#888',
        fontSize: 12,
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
    },
});

ChatSidebar.displayName = 'ChatSidebar';

export default ChatSidebar;