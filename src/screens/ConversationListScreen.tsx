import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    RefreshControl,
    Image,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius } from '../theme';
import { GroupResponse } from '../types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthContext, useChatContext } from '../contexts';
import ROUTING from '../constants/routing';
import { RootStackParamList } from '../navigations/type';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ConversationItemProps {
    group: GroupResponse;
    onPress: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ group, onPress }) => {
    const { user } = useAuthContext();
    const formatDate = (date: Date) => {
        const now = new Date();
        const messageDate = new Date(date);
        const diffInMs = now.getTime() - messageDate.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);
        const diffInDays = diffInHours / 24;
        if (diffInHours < 1) {
            const minutes = Math.floor(diffInMs / (1000 * 60));
            return `${minutes} phút trước`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} giờ trước`;
        } else if (diffInDays < 7) {
            return `${Math.floor(diffInDays)} ngày trước`;
        } else {
            return messageDate.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        }
    };
    const members = group.members || [];
    const opponent = members.filter(member => member.userId !== user?.userId);
    const opponentName = opponent[0]?.fullName?.toString() || group.groupName?.toString() || 'Cuộc trò chuyện';
    // Get avatar for group (using first letter of group name)
    const getAvatarLetter = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    const memberCount = group.members?.length || 0;

    return (
        <TouchableOpacity style={styles.conversationItem} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                    {opponent[0]?.avatarUrl ? (
                        <Image source={{ uri: opponent[0]?.avatarUrl?.toString() }} style={styles.avatarImage} />
                    ) : (
                        <Text style={styles.avatarText}>{getAvatarLetter(opponentName)}</Text>
                    )}
                </View>
            </View>

            <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                    <Text style={styles.conversationName} numberOfLines={1}>
                        {opponentName}
                    </Text>
                    <Text style={styles.conversationTime}>
                        {formatDate(group.updatedAt || group.createdAt)}
                    </Text>
                </View>
                <View style={styles.conversationFooter}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {group.lastMessageContent ? group.lastMessageContent : 'Hãy bắt đầu cuộc trò chuyện'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const ConversationListScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { user } = useAuthContext();
    const { groups, loading, error, getGroups, groupExistsInfo, setGroupExistsInfo } = useChatContext();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (user?.userId) {
            loadConversations();
        }
    }, [user?.userId]);

    // Handle group exists info message
    useEffect(() => {
        if (groupExistsInfo) {
            Alert.alert(
                'Thông báo',
                'Cuộc trò chuyện với bác sĩ này đã tồn tại. Vui lòng kiểm tra danh sách tin nhắn để tiếp tục cuộc trò chuyện.',
                [
                    {
                        text: 'Đã hiểu',
                        onPress: () => {
                            setGroupExistsInfo(null);
                            // Refresh the conversation list
                            loadConversations();
                        },
                    }
                ]
            );
        }
    }, [groupExistsInfo, setGroupExistsInfo]);

    const loadConversations = useCallback(() => {
        if (user?.userId) {
            getGroups({
                userId: user.userId.toString(),
                page: 0,
                size: 20
            });
        }
    }, [user?.userId, getGroups]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadConversations();
        setRefreshing(false);
    }, [loadConversations]);

    const handleConversationPress = (group: GroupResponse) => {
        const members = group.members || [];
        const opponent = members.find(member => member.userId !== user?.userId);
        const opponentName = opponent?.fullName?.toString() || group.groupName?.toString() || 'Cuộc trò chuyện';

        navigation.navigate(ROUTING.CHAT, {
            groupId: group.groupId.toString(),
            groupName: opponentName,
        });
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={80} color={colors.gray[400]} />
            <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện</Text>
            <Text style={styles.emptySubtitle}>
                Các cuộc trò chuyện của bạn sẽ hiển thị ở đây
            </Text>
        </View>
    );

    const renderError = () => (
        <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={60} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadConversations}>
                <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading && !refreshing && groups.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Tin nhắn</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary[500]} />
                    <Text style={styles.loadingText}>Đang tải cuộc trò chuyện...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tin nhắn</Text>
                <TouchableOpacity style={styles.newChatButton} onPress={() => console.log('Create new chat')}>
                    <Ionicons name="create-outline" size={24} color={colors.primary[500]} />
                </TouchableOpacity>
            </View>

            {error ? (
                renderError()
            ) : (
                <FlatList
                    data={groups.filter(g => !g.groupId.includes('-AI') && !g.groupName?.includes("AI"))}
                    renderItem={({ item }) => (
                        <ConversationItem
                            group={item}
                            onPress={() => handleConversationPress(item)}
                        />
                    )}
                    keyExtractor={(item) => item.groupId?.toString() || Math.random().toString()}
                    contentContainerStyle={groups.length === 0 ? styles.emptyList : styles.list}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary[500]]}
                            tintColor={colors.primary[500]}
                        />
                    }
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
        backgroundColor: colors.white,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.gray[900],
    },
    newChatButton: {
        padding: spacing[2],
    },
    list: {
        paddingVertical: spacing[2],
    },
    emptyList: {
        flex: 1,
    },
    conversationItem: {
        flexDirection: 'row',
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        backgroundColor: colors.white,
    },
    avatarContainer: {
        marginRight: spacing[3],
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '600',
        color: colors.primary[700],
    },
    conversationContent: {
        flex: 1,
        justifyContent: 'center',
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[1],
    },
    conversationName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: colors.gray[900],
        marginRight: spacing[2],
    },
    conversationTime: {
        fontSize: 12,
        color: colors.gray[600],
    },
    conversationFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 14,
        color: colors.gray[600],
        flex: 1,
    },
    memberCount: {
        fontSize: 14,
        color: colors.gray[600],
        flex: 1,
    },
    unreadBadge: {
        backgroundColor: colors.primary[500],
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        paddingHorizontal: spacing[1.5],
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    separator: {
        height: 1,
        backgroundColor: colors.gray[200],
        marginLeft: spacing[4] + 56 + spacing[3], // Align with text
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing[3],
        fontSize: 16,
        color: colors.gray[600],
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing[6],
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.gray[900],
        marginTop: spacing[4],
        marginBottom: spacing[2],
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.gray[600],
        textAlign: 'center',
        lineHeight: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing[6],
    },
    errorText: {
        fontSize: 16,
        color: colors.error,
        textAlign: 'center',
        marginTop: spacing[3],
        marginBottom: spacing[4],
    },
    retryButton: {
        backgroundColor: colors.primary[500],
        paddingHorizontal: spacing[6],
        paddingVertical: spacing[3],
        borderRadius: borderRadius.lg,
    },
    retryButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ConversationListScreen;
