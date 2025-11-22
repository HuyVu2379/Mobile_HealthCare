import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Post, PostCategory } from '../../../types/communication';
import { colors } from '../../../theme/colors';

const { width } = Dimensions.get('window');

interface PostItemProps {
    post: Post;
    onPress: (post: Post) => void;
}

const PostItem: React.FC<PostItemProps> = ({ post, onPress }) => {
    // Format ngày đăng
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Lấy ảnh thumbnail (ảnh đầu tiên hoặc placeholder)
    const thumbnailUrl = post.image_urls && post.image_urls.length > 0
        ? post.image_urls[0]
        : 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400';

    // Lấy màu chip theo category
    const getCategoryColor = () => {
        return post.category === 'BLOG'
            ? colors.primary[600]
            : colors.secondary[600];
    };

    // Lấy text category
    const getCategoryText = () => {
        return post.category === 'BLOG' ? 'BLOG' : 'TIN TỨC';
    };

    // Tạo excerpt từ content (lấy 100 ký tự đầu)
    const getExcerpt = () => {
        if (post.content.length > 100) {
            return post.content.substring(0, 100) + '...';
        }
        return post.content;
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress(post)}
            activeOpacity={0.7}
        >
            {/* Thumbnail Image */}
            <Image
                source={{ uri: thumbnailUrl }}
                style={styles.thumbnail}
                resizeMode="cover"
            />

            {/* Content Container */}
            <View style={styles.contentContainer}>
                {/* Header: Category Chip and Date */}
                <View style={styles.header}>
                    <View style={[styles.categoryChip, { backgroundColor: getCategoryColor() }]}>
                        <Text style={styles.categoryText}>{getCategoryText()}</Text>
                    </View>
                    <Text style={styles.dateText}>{formatDate(post.createdAt || new Date().toISOString())}</Text>
                </View>

                {/* Title */}
                <Text style={styles.title} numberOfLines={2}>
                    {post.title}
                </Text>

                {/* Excerpt */}
                <Text style={styles.excerpt} numberOfLines={3}>
                    {getExcerpt()}
                </Text>

                {/* Author Info */}
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
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    thumbnail: {
        width: '100%',
        height: 200,
        backgroundColor: colors.gray[200],
    },
    contentContainer: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
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
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 8,
        lineHeight: 24,
    },
    excerpt: {
        fontSize: 14,
        color: colors.gray[600],
        lineHeight: 20,
        marginBottom: 12,
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    authorAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    authorAvatarPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    authorInitial: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    authorName: {
        fontSize: 12,
        color: colors.gray[600],
    },
});

export default PostItem;
