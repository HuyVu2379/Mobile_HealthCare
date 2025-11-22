import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { Post, PostCategory } from '../types/communication';
import { getPosts } from '../services/post.service';
import PostItem from '../components/ui/Forum/PostItem';
import CategoryFilterChips from '../components/ui/Forum/CategoryFilterChips';
import { colors } from '../theme/colors';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import ROUTING from '../constants/routing';

type FilterType = 'ALL' | 'BLOG' | 'NEW';

const ForumScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp<ParamListBase>>();

    const [posts, setPosts] = useState<Post[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);

    // Fetch posts from API
    const fetchPosts = async (pageNum: number = 0, isRefresh: boolean = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
                setError('');
            } else if (pageNum === 0) {
                setLoading(true);
                setError('');
            }

            const response = await getPosts(pageNum, 10);
            console.log('check result get post:', response);

            if (response.success && response.data && Array.isArray(response.data)) {
                if (isRefresh || pageNum === 0) {
                    setPosts(response.data);
                    setFilteredPosts(response.data);
                } else {
                    setPosts(prev => [...prev, ...response.data]);
                    setFilteredPosts(prev => [...prev, ...response.data]);
                }

                // Check if there are more posts
                setHasMore(response.data.length === 10);
            } else {
                setError('Không thể tải danh sách bài viết');
            }
        } catch (err: any) {
            console.error('Error fetching posts:', err);
            setError(err.message || 'Đã xảy ra lỗi khi tải bài viết');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchPosts(0);
    }, []);

    // Filter posts based on selected category
    useEffect(() => {
        if (selectedFilter === 'ALL') {
            setFilteredPosts(posts);
        } else {
            const filtered = posts.filter(post => post.category === selectedFilter);
            setFilteredPosts(filtered);
        }
    }, [selectedFilter, posts]);

    // Handle filter change
    const handleFilterChange = (filter: FilterType) => {
        setSelectedFilter(filter);
    };

    // Handle refresh
    const handleRefresh = () => {
        setPage(0);
        fetchPosts(0, true);
    };

    // Handle load more
    const handleLoadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPosts(nextPage);
        }
    };

    // Handle post press - navigate to detail
    const handlePostPress = (post: Post) => {
        navigation.navigate(ROUTING.POST_DETAIL, { post });
    };

    // Handle retry
    const handleRetry = () => {
        setPage(0);
        fetchPosts(0);
    };

    // Render empty state
    const renderEmpty = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>📝</Text>
                <Text style={styles.emptyTitle}>Chưa có bài viết nào</Text>
                <Text style={styles.emptySubtitle}>
                    {selectedFilter === 'ALL'
                        ? 'Hãy quay lại sau để xem các bài viết mới nhất'
                        : `Chưa có bài viết thuộc danh mục ${selectedFilter === 'BLOG' ? 'BLOG' : 'TIN TỨC'}`
                    }
                </Text>
            </View>
        );
    };

    // Render error state
    const renderError = () => (
        <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️</Text>
            <Text style={styles.errorTitle}>Đã xảy ra lỗi</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
        </View>
    );

    // Render loading state
    const renderLoading = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
            <Text style={styles.loadingText}>Đang tải bài viết...</Text>
        </View>
    );

    // Render footer (load more indicator)
    const renderFooter = () => {
        if (!loading || refreshing) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary[600]} />
            </View>
        );
    };

    // Render post item
    const renderPost = ({ item }: { item: Post }) => (
        <PostItem post={item} onPress={handlePostPress} />
    );

    // Main render
    if (loading && !refreshing && page === 0) {
        return renderLoading();
    }

    if (error && !refreshing && posts.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Diễn đàn</Text>
                </View>
                {renderError()}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Diễn đàn</Text>
            </View>

            {/* Category Filter Chips */}
            <CategoryFilterChips
                selectedFilter={selectedFilter}
                onFilterChange={handleFilterChange}
            />

            {/* Posts List */}
            <FlatList
                data={filteredPosts}
                renderItem={renderPost}
                keyExtractor={(item) => item.post_id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary[600]]}
                        tintColor={colors.primary[600]}
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    header: {
        backgroundColor: colors.white,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    listContainer: {
        paddingVertical: 8,
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.gray[50],
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: colors.gray[600],
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 8,
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
        paddingHorizontal: 40,
    },
    errorText: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.error,
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 14,
        color: colors.gray[600],
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    retryButton: {
        backgroundColor: colors.primary[600],
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});

export default ForumScreen;
