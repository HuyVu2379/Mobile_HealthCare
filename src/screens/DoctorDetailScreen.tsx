import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    PermissionsAndroid,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigations/type';
import { NavigationProp } from '@react-navigation/native';
import { DoctorResponse } from '../types/IUser';
import { theme } from '../theme';
import ROUTING from '../constants/routing';
import { getCommentsByDoctorId, postComment } from '../services/comment.service';
import { Comment, CreateCommentRequest, CommentTargetType } from '../types/communication';
import { useAuthContext } from '../contexts/AuthContext';
import { uploadMutiFiles } from '../services/upload.service';
import { launchImageLibrary, Asset } from 'react-native-image-picker';

type DoctorDetailRouteProp = RouteProp<RootStackParamList, 'DoctorDetail'>;

const DoctorDetailScreen: React.FC = () => {
    const route = useRoute<DoctorDetailRouteProp>();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { doctor } = route.params as { doctor: DoctorResponse };
    const { user } = useAuthContext();

    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [rating, setRating] = useState(5);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const size = 10;

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async (pageNum: number = 0) => {
        if (loading) return;

        try {
            setLoading(true);
            const data = await getCommentsByDoctorId(doctor.userId, pageNum, size);

            // data đã là mảng Comment[] trực tiếp, lọc bỏ item undefined/null
            const validComments = data.filter((item): item is Comment =>
                item != null && item.comment_id != null
            );

            if (pageNum === 0) {
                setComments(validComments);
            } else {
                setComments(prev => [...prev, ...validComments]);
            }

            // Chỉ hiện nút "Xem thêm" khi số bình luận trả về đủ 10
            setHasMore(validComments.length >= size);
            setPage(pageNum);
        } catch (error) {
            console.error('Error fetching comments:', error);
            Alert.alert('Lỗi', 'Không thể tải bình luận');
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            fetchComments(page + 1);
        }
    };

    const handlePickImages = async () => {
        try {
            // Request permission for Android
            if (Platform.OS === 'android') {
                const apiLevel = Platform.Version;
                let permission;

                // Android 13+ (API 33+) uses READ_MEDIA_IMAGES
                if (apiLevel >= 33) {
                    permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
                } else {
                    permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
                }

                const granted = await PermissionsAndroid.request(
                    permission,
                    {
                        title: 'Quyền truy cập thư viện ảnh',
                        message: 'Ứng dụng cần quyền để chọn ảnh',
                        buttonNeutral: 'Hỏi lại sau',
                        buttonNegative: 'Hủy',
                        buttonPositive: 'Đồng ý',
                    },
                );

                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert('Thông báo', 'Cần cấp quyền truy cập thư viện ảnh');
                    return;
                }
            }

            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
                selectionLimit: 5 - selectedImages.length,
            });

            if (result.didCancel) {
                return;
            }

            if (result.errorCode) {
                Alert.alert('Lỗi', result.errorMessage || 'Không thể chọn ảnh');
                return;
            }

            if (result.assets) {
                const uris = result.assets.map((asset: Asset) => asset.uri || '').filter(uri => uri);
                setSelectedImages(prev => [...prev, ...uris].slice(0, 5));
            }
        } catch (error) {
            console.error('Error picking images:', error);
            Alert.alert('Lỗi', 'Không thể chọn ảnh');
        }
    };

    const handleRemoveImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmitComment = async () => {
        if (!commentText.trim()) {
            Alert.alert('Thông báo', 'Vui lòng nhập nội dung bình luận');
            return;
        }

        if (!user) {
            Alert.alert('Thông báo', 'Vui lòng đăng nhập để bình luận');
            return;
        }

        try {
            setSubmitting(true);
            let uploadedImageUrls: string[] = [];

            // Upload images if selected
            if (selectedImages.length > 0) {
                setUploading(true);
                const formData = new FormData();

                selectedImages.forEach((uri, index) => {
                    const filename = uri.split('/').pop() || `image_${index}.jpg`;
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `image/${match[1]}` : 'image/jpeg';

                    formData.append('files', {
                        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                        name: filename,
                        type: type,
                    } as any);
                });

                const uploadResult = await uploadMutiFiles(formData);
                uploadedImageUrls = uploadResult?.imageUrls || [];
                setUploading(false);
            }

            const newComment: CreateCommentRequest = {
                target_id: doctor.userId,
                target_type: CommentTargetType.DOCTOR,
                author_id: user.userId,
                author_name: user.fullName,
                author_avatar: user.avatarUrl || '',
                content: commentText,
                rating: rating,
                imageUrls: uploadedImageUrls
            };

            await postComment(newComment);
            setCommentText('');
            setRating(5);
            setSelectedImages([]);
            // Refresh comments
            fetchComments(0);
            Alert.alert('Thành công', 'Đã đăng bình luận');
        } catch (error) {
            console.error('Error posting comment:', error);
            Alert.alert('Lỗi', 'Không thể đăng bình luận');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBookAppointment = () => {
        navigation.navigate(ROUTING.APPOINTMENT);
    };

    const renderStarRating = (currentRating: number, onPress?: (rating: number) => void) => (
        <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                    key={star}
                    onPress={() => onPress && onPress(star)}
                    disabled={!onPress}
                >
                    <Text style={styles.star}>
                        {star <= currentRating ? '⭐' : '☆'}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderComment = ({ item }: { item: Comment }) => (
        <View style={styles.commentCard}>
            <View style={styles.commentHeader}>
                <Image
                    source={{ uri: item.author_avatar || 'https://via.placeholder.com/40' }}
                    style={styles.commentAvatar}
                />
                <View style={styles.commentHeaderText}>
                    <Text style={styles.commentAuthor}>{item.author_name}</Text>
                    <View style={styles.commentRatingRow}>
                        {renderStarRating(item.rating)}
                        <Text style={styles.commentDate}>
                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </Text>
                    </View>
                </View>
            </View>
            <Text style={styles.commentContent}>{item.content}</Text>

            {/* Comment Images */}
            {item.imageUrls && item.imageUrls.length > 0 && (
                <ScrollView horizontal style={styles.commentImagesContainer}>
                    {item.imageUrls.map((url, index) => (
                        <Image
                            key={index}
                            source={{ uri: url }}
                            style={styles.commentImage}
                        />
                    ))}
                </ScrollView>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header with avatar */}
                <View style={styles.header}>
                    <Image
                        source={{ uri: doctor.avatarUrl || 'https://via.placeholder.com/200' }}
                        style={styles.avatar}
                    />
                    <Text style={styles.name}>{doctor.fullName}</Text>
                    <Text style={styles.specialty}>{doctor.specialty}</Text>
                    <View style={styles.ratingRow}>
                        <Text style={styles.rating}>⭐ {doctor.rating?.toFixed(1) || 'N/A'}</Text>
                        <Text style={styles.experience}>
                            {doctor.experienceYears || 0} năm kinh nghiệm
                        </Text>
                    </View>
                </View>

                {/* Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email:</Text>
                        <Text style={styles.infoValue}>{doctor.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Điện thoại:</Text>
                        <Text style={styles.infoValue}>{doctor.phone}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Địa chỉ:</Text>
                        <Text style={styles.infoValue}>{doctor.address}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Địa chỉ phòng khám:</Text>
                        <Text style={styles.infoValue}>{doctor.clinicAddress}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Phí khám:</Text>
                        <Text style={styles.feeValue}>
                            {doctor.examinationFee ? doctor.examinationFee.toLocaleString('vi-VN') : '0'}đ
                        </Text>
                    </View>
                </View>

                {/* Bio Section */}
                {doctor.bio && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Giới thiệu</Text>
                        <Text style={styles.bioText}>{doctor.bio}</Text>
                    </View>
                )}

                {/* Certifications Section */}
                {doctor.certifications && doctor.certifications.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Chứng chỉ</Text>
                        {doctor.certifications.map((cert: any, index: number) => (
                            <View key={cert.id || index} style={styles.certCard}>
                                <Text style={styles.certName}>{cert.name}</Text>
                                <Text style={styles.certOrg}>{cert.issuingOrganization}</Text>
                                <Text style={styles.certYear}>Năm cấp: {cert.yearIssued}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Comments Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Đánh giá ({comments.length})
                    </Text>

                    {/* Comment Form */}
                    <View style={styles.commentForm}>
                        <Text style={styles.formLabel}>Đánh giá của bạn:</Text>
                        {renderStarRating(rating, setRating)}
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Viết đánh giá của bạn..."
                            multiline
                            numberOfLines={4}
                            value={commentText}
                            onChangeText={setCommentText}
                            textAlignVertical="top"
                        />

                        {/* Image Picker */}
                        <TouchableOpacity
                            style={styles.imagePickerButton}
                            onPress={handlePickImages}
                            disabled={selectedImages.length >= 5}
                        >
                            <Text style={styles.imagePickerText}>
                                📷 Thêm ảnh ({selectedImages.length}/5)
                            </Text>
                        </TouchableOpacity>

                        {/* Selected Images Preview */}
                        {selectedImages.length > 0 && (
                            <ScrollView horizontal style={styles.imagePreviewContainer}>
                                {selectedImages.map((uri, index) => (
                                    <View key={index} style={styles.imagePreviewWrapper}>
                                        <Image source={{ uri }} style={styles.imagePreview} />
                                        <TouchableOpacity
                                            style={styles.removeImageButton}
                                            onPress={() => handleRemoveImage(index)}
                                        >
                                            <Text style={styles.removeImageText}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        )}

                        {uploading && (
                            <View style={styles.uploadingContainer}>
                                <ActivityIndicator color="#2196F3" />
                                <Text style={styles.uploadingText}>Đang tải ảnh...</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.submitButton, (submitting || uploading) && styles.submitButtonDisabled]}
                            onPress={handleSubmitComment}
                            disabled={submitting || uploading}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Đăng đánh giá</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Comments List */}
                    {loading && page === 0 ? (
                        <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 20 }} />
                    ) : (
                        <>
                            <FlatList
                                data={comments}
                                renderItem={renderComment}
                                keyExtractor={(item, index) => item?.comment_id || `comment-${index}`}
                                scrollEnabled={false}
                                ListEmptyComponent={
                                    <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
                                }
                            />
                            {/* Load More Button - Chỉ hiện khi có >= 10 comments trong lần fetch */}
                            {hasMore && comments.length > 0 && (
                                <TouchableOpacity
                                    style={styles.loadMoreButton}
                                    onPress={handleLoadMore}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#2196F3" />
                                    ) : (
                                        <Text style={styles.loadMoreText}>Tải thêm bình luận</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>

                {/* Spacer for floating button */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Book Appointment Button */}
            <TouchableOpacity
                style={styles.bookButton}
                onPress={handleBookAppointment}
                activeOpacity={0.8}
            >
                <Text style={styles.bookButtonText}>Đặt lịch khám</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 15,
        backgroundColor: '#f0f0f0',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold' as const,
        color: '#212121',
        marginBottom: 5,
    },
    specialty: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    ratingRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: 15,
    },
    rating: {
        fontSize: 16,
        color: '#FFA500',
        fontWeight: '600' as const,
    },
    experience: {
        fontSize: 14,
        color: '#999',
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 15,
        padding: 20,
        borderRadius: 12,
        marginHorizontal: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold' as const,
        color: '#212121',
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row' as const,
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        width: 140,
        fontWeight: '500' as const,
    },
    infoValue: {
        fontSize: 14,
        color: '#212121',
        flex: 1,
    },
    feeValue: {
        fontSize: 14,
        color: '#2196F3',
        fontWeight: '600' as const,
        flex: 1,
    },
    bioText: {
        fontSize: 14,
        color: '#212121',
        lineHeight: 22,
    },
    certCard: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#2196F3',
    },
    certName: {
        fontSize: 15,
        fontWeight: '600' as const,
        color: '#212121',
        marginBottom: 5,
    },
    certOrg: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    certYear: {
        fontSize: 12,
        color: '#999',
    },
    bookButton: {
        position: 'absolute' as const,
        bottom: 20,
        right: 20,
        backgroundColor: '#2196F3',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold' as const,
    },
    commentForm: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: '#212121',
        marginBottom: 8,
    },
    starContainer: {
        flexDirection: 'row' as const,
        marginBottom: 12,
    },
    star: {
        fontSize: 24,
        marginRight: 5,
    },
    commentInput: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        padding: 12,
        fontSize: 14,
        marginBottom: 12,
        minHeight: 100,
    },
    submitButton: {
        backgroundColor: '#2196F3',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center' as const,
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600' as const,
    },
    commentCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    commentHeader: {
        flexDirection: 'row' as const,
        marginBottom: 10,
    },
    commentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#f0f0f0',
    },
    commentHeaderText: {
        flex: 1,
    },
    commentAuthor: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: '#212121',
        marginBottom: 4,
    },
    commentRatingRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
    },
    commentDate: {
        fontSize: 12,
        color: '#999',
    },
    commentContent: {
        fontSize: 14,
        color: '#212121',
        lineHeight: 20,
    },
    imagePickerButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        alignItems: 'center' as const,
    },
    imagePickerText: {
        fontSize: 14,
        color: '#2196F3',
        fontWeight: '600' as const,
    },
    imagePreviewContainer: {
        marginBottom: 12,
    },
    imagePreviewWrapper: {
        position: 'relative' as const,
        marginRight: 10,
    },
    imagePreview: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    removeImageButton: {
        position: 'absolute' as const,
        top: -5,
        right: -5,
        backgroundColor: '#f44336',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
    removeImageText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold' as const,
        lineHeight: 16,
    },
    uploadingContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        padding: 10,
        marginBottom: 12,
    },
    uploadingText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#2196F3',
    },
    commentImagesContainer: {
        marginTop: 10,
    },
    commentImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 8,
        backgroundColor: '#f0f0f0',
    },
    emptyText: {
        textAlign: 'center' as const,
        color: '#999',
        fontSize: 14,
        marginTop: 20,
    },
    loadMoreButton: {
        padding: 12,
        alignItems: 'center' as const,
        marginTop: 10,
    },
    loadMoreText: {
        color: '#2196F3',
        fontSize: 14,
        fontWeight: '600' as const,
    },
});

export default DoctorDetailScreen;
