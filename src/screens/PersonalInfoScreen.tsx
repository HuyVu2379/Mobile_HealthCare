import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/type';
import ROUTING from '../constants/routing';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PersonalInfoScreen = () => {
    // Lấy dữ liệu user từ Redux store
    const user = useSelector((state: RootState) => state.user.user);
    const navigation = useNavigation<NavigationProp>();
    console.log("check user redux: ", user);

    // Tính BMI nếu có chiều cao và cân nặng
    const calculateBMI = () => {
        if (user?.patient?.height && user?.patient?.weight) {
            const heightInMeters = user.patient.height / 100;
            const bmi = user.patient.weight / (heightInMeters * heightInMeters);
            return bmi.toFixed(1);
        }
        return user?.patient?.bmi ? user.patient.bmi.toFixed(1) : '--';
    };

    // Format ngày sinh
    const formatDate = (date: Date | string | undefined) => {
        if (!date) return '--';
        const dateStr = String(date);
        // Nếu định dạng là YYYY/MM/DD
        if (dateStr.includes('/')) {
            const [year, month, day] = dateStr.split('/');
            return `${day}/${month}/${year}`;
        }
        const d = new Date(date);
        if (isNaN(d.getTime())) return '--';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Format giới tính
    const formatGender = (gender: string | undefined) => {
        if (!gender) return '--';
        switch (gender.toUpperCase()) {
            case 'MALE':
                return 'Nam';
            case 'FEMALE':
                return 'Nữ';
            case 'OTHER':
                return 'Khác';
            default:
                return gender;
        }
    };

    // Format role
    const formatRole = (role: string | undefined) => {
        if (!role) return '--';
        switch (role.toUpperCase()) {
            case 'PATIENT':
                return 'Bệnh nhân';
            case 'DOCTOR':
                return 'Bác sĩ';
            case 'ADMIN':
                return 'Quản trị viên';
            default:
                return role;
        }
    };

    // Format status
    const formatStatus = (status: string | undefined) => {
        if (!status) return '--';
        switch (status.toUpperCase()) {
            case 'ACTIVE':
                return 'Hoạt động';
            case 'INACTIVE':
                return 'Không hoạt động';
            case 'PENDING':
                return 'Chờ xác nhận';
            default:
                return status;
        }
    };

    // Lấy tên hiển thị (chỉ tên, không họ)
    const getDisplayName = () => {
        if (!user?.fullName) return 'Người dùng';
        return user.fullName
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header Card với Avatar và Thông tin Y tế */}
                <View style={styles.headerCard}>
                    {/* Nút Quay lại trang chủ */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.navigate(ROUTING.HOME)}
                    >
                        <Text style={styles.backButtonText}>Trang chính</Text>
                    </TouchableOpacity>

                    {/* Nút Chỉnh sửa */}
                    <TouchableOpacity style={styles.editButton}>
                        <Text style={styles.editButtonText}>Chỉnh sửa</Text>
                    </TouchableOpacity>

                    {/* Avatar và Tên */}
                    <View style={styles.avatarSection}>
                        <Image
                            source={{
                                uri: user?.avatarUrl || 'https://i.pravatar.cc/150?img=12'
                            }}
                            style={styles.avatar}
                        />
                        <Text style={styles.userName}>
                            {getDisplayName()}
                        </Text>
                    </View>

                    {/* Grid Thông tin Y tế */}
                    <View style={styles.healthGrid}>
                        <View style={styles.healthItem}>
                            <Text style={styles.healthLabel}>Chiều cao:</Text>
                            <Text style={styles.healthValue}>
                                {user?.patient?.height ? `${user.patient.height} cm` : '--'}
                            </Text>
                        </View>

                        <View style={[styles.healthItem, styles.healthItemBorder]}>
                            <Text style={styles.healthLabel}>Cân nặng:</Text>
                            <Text style={styles.healthValue}>
                                {user?.patient?.weight ? `${user.patient.weight} kg` : '--'}
                            </Text>
                        </View>

                        <View style={[styles.healthItem, styles.healthItemBorder]}>
                            <Text style={styles.healthLabel}>Nhóm máu:</Text>
                            <Text style={styles.healthValue}>
                                {user?.patient?.bloodType || '--'}
                            </Text>
                        </View>

                        <View style={[styles.healthItem, styles.healthItemBorder]}>
                            <Text style={styles.healthLabel}>BMI:</Text>
                            <Text style={styles.healthValue}>
                                {calculateBMI()}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Thông tin chi tiết */}
                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

                    <View style={styles.infoCard}>
                        <Text style={styles.label}>Họ và tên</Text>
                        <Text style={styles.value}>{user?.fullName || '--'}</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.label}>Ngày sinh</Text>
                        <Text style={styles.value}>{formatDate(user?.dob)}</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.label}>Giới tính</Text>
                        <Text style={styles.value}>{formatGender(user?.gender)}</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.label}>Số điện thoại</Text>
                        <Text style={styles.value}>{user?.phone || 'Chưa cập nhật'}</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{user?.email || '--'}</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.label}>Địa chỉ</Text>
                        <Text style={styles.value}>{user?.address || 'Chưa cập nhật'}</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.label}>Vai trò</Text>
                        <Text style={styles.value}>{formatRole(user?.role)}</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.label}>Trạng thái</Text>
                        <Text style={[styles.value, {
                            color: user?.status === 'ACTIVE' ? '#4CAF50' : '#FF9800'
                        }]}>
                            {formatStatus(user?.status)}
                        </Text>
                    </View>

                    {/* Thông tin dị ứng (chỉ hiển thị nếu có) */}
                    {user?.patient?.allergies && user.patient.allergies.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
                                Thông tin dị ứng
                            </Text>
                            {user.patient.allergies.map((allergy, index) => (
                                <View key={allergy.allergyId || index} style={styles.infoCard}>
                                    <View style={styles.allergyHeader}>
                                        <Text style={styles.allergyName}>{allergy.name}</Text>
                                        <Text style={[
                                            styles.allergyLevel,
                                            {
                                                color: allergy.level === 'Cao' ? '#F44336' :
                                                    allergy.level === 'Trung bình' ? '#FF9800' : '#4CAF50'
                                            }
                                        ]}>
                                            {allergy.level}
                                        </Text>
                                    </View>
                                    {allergy.description && (
                                        <Text style={styles.allergyDescription}>
                                            {allergy.description}
                                        </Text>
                                    )}
                                </View>
                            ))}
                        </>
                    )}

                    {/* Thông tin bảo hiểm (chỉ hiển thị nếu có) */}
                    {user?.patient?.insurances && user.patient.insurances.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
                                Bảo hiểm y tế
                            </Text>
                            {user.patient.insurances.map((insurance, index) => (
                                <View key={insurance.insuranceId || index} style={styles.infoCard}>
                                    <Text style={styles.label}>Tên bảo hiểm</Text>
                                    <Text style={styles.value}>{insurance.insuranceName}</Text>
                                    <Text style={[styles.label, { marginTop: 8 }]}>
                                        Ngày hết hạn
                                    </Text>
                                    <Text style={styles.value}>
                                        {formatDate(insurance.insuranceEndDate)}
                                    </Text>
                                </View>
                            ))}
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollView: {
        flex: 1,
    },
    // Header Card Styles
    headerCard: {
        backgroundColor: '#007AFF',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        zIndex: 10,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    editButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        zIndex: 10,
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        marginBottom: 12,
    },
    userName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    healthGrid: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        padding: 16,
    },
    healthItem: {
        flex: 1,
        alignItems: 'center',
    },
    healthItemBorder: {
        borderLeftWidth: 1,
        borderLeftColor: '#E0E0E0',
    },
    healthLabel: {
        fontSize: 13,
        color: '#666666',
        marginBottom: 6,
    },
    healthValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
    },
    // Content Styles
    content: {
        padding: 16,
        paddingTop: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 6,
    },
    value: {
        fontSize: 16,
        color: '#000000',
        fontWeight: '600',
    },
    // Allergy Styles
    allergyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    allergyName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        flex: 1,
    },
    allergyLevel: {
        fontSize: 14,
        fontWeight: '600',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
    },
    allergyDescription: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
    },
});

export default PersonalInfoScreen;
