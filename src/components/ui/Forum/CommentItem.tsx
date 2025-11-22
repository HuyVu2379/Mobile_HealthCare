import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Comment } from '../../../types/communication';
import { colors } from '../../../theme/colors';

interface CommentItemProps {
    comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
    // Format ngày
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    return (
        <View style={styles.container}>
            {/* Author Info */}
            <View style={styles.header}>
                {comment.author_avatar ? (
                    <Image
                        source={{ uri: comment.author_avatar }}
                        style={styles.avatar}
                    />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarInitial}>
                            {comment.author_name ? comment.author_name.charAt(0).toUpperCase() : 'A'}
                        </Text>
                    </View>
                )}

                <View style={styles.authorInfo}>
                    <Text style={styles.authorName}>{comment.author_name || 'Anonymous'}</Text>
                    <Text style={styles.date}>{formatDate(comment.createdAt)}</Text>
                </View>
            </View>

            {/* Content */}
            <Text style={styles.content}>{comment.content}</Text>

            {/* Images */}
            {comment.imageUrls && comment.imageUrls.length > 0 && (
                <View style={styles.imagesContainer}>
                    {comment.imageUrls.map((imageUrl, index) => (
                        <Image
                            key={index}
                            source={{ uri: imageUrl }}
                            style={styles.commentImage}
                            resizeMode="cover"
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarInitial: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    authorInfo: {
        flex: 1,
    },
    authorName: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
        color: colors.gray[500],
    },
    ratingContainer: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    star: {
        fontSize: 16,
        marginRight: 2,
    },
    content: {
        fontSize: 14,
        color: colors.text.primary,
        lineHeight: 20,
    },
    imagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12,
        gap: 8,
    },
    commentImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
});

export default CommentItem;
