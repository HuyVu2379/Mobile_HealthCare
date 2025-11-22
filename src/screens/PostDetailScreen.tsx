import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Post, Comment, CreateCommentRequest, CommentTargetType } from '../types/communication';
import { getCommentByPostId, postComment } from '../services/comment.service';
import CommentItem from '../components/ui/Forum/CommentItem';
import { colors } from '../theme/colors';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useComments } from '../contexts/CommentContext';
import Toast from 'react-native-toast-message';

type PostDetailRouteProp = RouteProp<{ PostDetail: { post: Post } }, 'PostDetail'>;

const PostDetailScreen: React.FC = () => {
    const route = useRoute<PostDetailRouteProp>();
    const navigation = useNavigation();
    const { post } = route.params;

    // Get user info from Redux
    const user = useSelector((state: RootState) => state.user.user);

    // Get comment context
    const { getCommentsForTarget, setCommentsForTarget, addComment } = useComments();

    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);

    // Comment form state
    const [commentText, setCommentText] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);

    // Format ngày đăng
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Fetch comments
    const fetchComments = async (pageNum: number = 0) => {
        try {
            if (pageNum === 0) {
                setLoading(true);
                setError('');
            }

            const response = await getCommentByPostId(post.post_id, pageNum, 20);

            if (response.success && response.data && Array.isArray(response.data)) {
                if (pageNum === 0) {
                    setComments(response.data);
                    // Update context with fetched comments
                    setCommentsForTarget(post.post_id, response.data);
                } else {
                    setComments(prev => [...prev, ...response.data]);
                }
                setHasMore(response.data.length === 20);
            } else {
                setError('Không thể tải bình luận');
            }
        } catch (err: any) {
            console.error('Error fetching comments:', err);
            setError(err.message || 'Đã xảy ra lỗi khi tải bình luận');
        } finally {
            setLoading(false);
        }
    };

    // Load comments from context on mount or sync from context
    useEffect(() => {
        const cachedComments = getCommentsForTarget(post.post_id);
        if (cachedComments.length > 0) {
            // Use cached comments from context
            setComments(cachedComments);
            setLoading(false);
        } else {
            // Fetch from API if not in context
            fetchComments(0);
        }
    }, [post.post_id]);

    // Handle load more comments
    const handleLoadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchComments(nextPage);
        }
    };

    // Handle submit comment
    const handleSubmitComment = async () => {
        if (!commentText.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Thông báo',
                text2: 'Vui lòng nhập nội dung bình luận',
            });
            return;
        }

        if (!user) {
            Toast.show({
                type: 'error',
                text1: 'Thông báo',
                text2: 'Vui lòng đăng nhập để bình luận',
            });
            return;
        }

        try {
            setSubmitting(true);

            const newComment: CreateCommentRequest = {
                target_id: post.post_id,
                target_type: CommentTargetType.POST,
                author_id: user.userId || '',
                author_name: user.fullName || user.email,
                author_avatar: user.avatarUrl || '',
                content: commentText.trim(),
                rating: 0,
                imageUrls: [],
            };

            const response = await postComment(newComment);
            console.log('Post comment response:', response);

            if (response && response.success && response.data) {
                // Use comment data from API response
                const createdComment: Comment = {
                    comment_id: response.data.comment_id,
                    target_id: response.data.target_id,
                    target_type: response.data.target_type,
                    author_id: response.data.author_id,
                    author_name: response.data.author_name,
                    author_avatar: response.data.author_avatar,
                    content: response.data.content,
                    rating: response.data.rating || 0,
                    imageUrls: response.data.imageUrls || [],
                    createdAt: response.data.createdAt,
                    updatedAt: response.data.updatedAt,
                };

                // Update local state
                setComments(prev => {
                    const newComments = [createdComment, ...prev];
                    console.log('Updated comments count:', newComments.length);
                    return newComments;
                });

                // Update context so other screens can see the new comment
                addComment(post.post_id, createdComment);

                // Clear input field
                setCommentText('');

                Toast.show({
                    type: 'success',
                    text1: 'Thành công',
                    text2: 'Đã thêm bình luận',
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Lỗi',
                    text2: 'Không thể thêm bình luận. Vui lòng thử lại.',
                });
            }
        } catch (err: any) {
            console.error('Error posting comment:', err);
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: err.message || 'Không thể thêm bình luận',
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Render category chip
    const renderCategoryChip = () => {
        const chipColor = post.category === 'BLOG' ? colors.primary[600] : colors.secondary[600];
        const chipText = post.category === 'BLOG' ? 'BLOG' : 'TIN TỨC';

        return (
            <View style={[styles.categoryChip, { backgroundColor: chipColor }]}>
                <Text style={styles.categoryText}>{chipText}</Text>
            </View>
        );
    };

    // Render header
    const renderHeader = () => (
        <View style={styles.postContainer}>
            {/* Category and Date */}
            <View style={styles.postHeader}>
                {renderCategoryChip()}
                <Text style={styles.dateText}>{formatDate(post.createdAt)}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{post.title}</Text>

            {/* Author */}
            <View style={styles.authorContainer}>
                {post.author_avatar ? (
                    <Image
                        source={{ uri: post.author_avatar }}
                        style={styles.authorAvatar}
                    />
                ) : (
                    <View style={styles.authorAvatarPlaceholder}>
                        <Text style={styles.authorInitial}>
                            {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'A'}
                        </Text>
                    </View>
                )}
                <Text style={styles.authorName}>{post.author_name || 'Anonymous'}</Text>
            </View>

            {/* Images */}
            {post.image_urls && post.image_urls.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.imagesScroll}
                >
                    {post.image_urls.map((imageUrl, index) => (
                        <Image
                            key={index}
                            source={{ uri: imageUrl }}
                            style={styles.postImage}
                            resizeMode="cover"
                        />
                    ))}
                </ScrollView>
            )}

            {/* Content */}
            <Text style={styles.content}>{post.content}</Text>

            {/* Comments Header */}
            <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>
                    Bình luận ({comments.length})
                </Text>
            </View>
        </View>
    );

    // Render footer (load more indicator)
    const renderFooter = () => {
        if (!loading || page === 0) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary[600]} />
            </View>
        );
    };

    // Render empty comments
    const renderEmptyComments = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>💬</Text>
                <Text style={styles.emptyTitle}>Chưa có bình luận nào</Text>
                <Text style={styles.emptySubtitle}>Hãy là người đầu tiên bình luận về bài viết này</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.primary[600]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết bài viết</Text>
                <View style={styles.headerRight} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {loading && page === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary[600]} />
                        <Text style={styles.loadingText}>Đang tải...</Text>
                    </View>
                ) : (
                    <>
                        <FlatList
                            data={comments}
                            renderItem={({ item }) => <CommentItem comment={item} />}
                            keyExtractor={(item) => item.comment_id}
                            ListHeaderComponent={renderHeader}
                            ListEmptyComponent={renderEmptyComments}
                            ListFooterComponent={renderFooter}
                            contentContainerStyle={styles.listContainer}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.5}
                            showsVerticalScrollIndicator={false}
                        />

                        {/* Comment Input Form */}
                        <View style={styles.commentInputContainer}>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Viết bình luận..."
                                placeholderTextColor={colors.gray[400]}
                                value={commentText}
                                onChangeText={setCommentText}
                                multiline
                                maxLength={500}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    (!commentText.trim() || submitting) && styles.submitButtonDisabled
                                ]}
                                onPress={handleSubmitComment}
                                disabled={!commentText.trim() || submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator size="small" color={colors.white} />
                                ) : (
                                    <Text style={styles.submitButtonText}>Gửi</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text.primary,
    },
    headerRight: {
        width: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: colors.gray[600],
    },
    listContainer: {
        paddingBottom: 16,
    },
    postContainer: {
        backgroundColor: colors.white,
        padding: 16,
        marginBottom: 16,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    dateText: {
        color: colors.gray[500],
        fontSize: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 12,
        lineHeight: 30,
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    authorAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    authorAvatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    authorInitial: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    authorName: {
        fontSize: 14,
        color: colors.gray[700],
        fontWeight: '500',
    },
    imagesScroll: {
        marginBottom: 16,
    },
    postImage: {
        width: 300,
        height: 200,
        borderRadius: 12,
        marginRight: 12,
    },
    content: {
        fontSize: 16,
        color: colors.text.primary,
        lineHeight: 24,
        marginBottom: 24,
    },
    commentsHeader: {
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    commentsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text.primary,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.gray[600],
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: colors.gray[200],
        gap: 12,
    },
    commentInput: {
        flex: 1,
        backgroundColor: colors.gray[100],
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 14,
        color: colors.text.primary,
        maxHeight: 100,
    },
    submitButton: {
        backgroundColor: colors.primary[600],
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        minWidth: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: colors.gray[400],
    },
    submitButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default PostDetailScreen;
