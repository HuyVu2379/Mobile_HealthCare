import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { getOutstandingDoctors } from '../../../services/doctor.service';
import { DoctorResponse } from '../../../types/IUser';
import { theme } from '../../../theme';
import { RootStackParamList } from '../../../navigations/type';
import ROUTING from '../../../constants/routing';

const OutstandingDoctors: React.FC = () => {
    const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    useEffect(() => {
        fetchOutstandingDoctors();
    }, []);

    const fetchOutstandingDoctors = async () => {
        try {
            setLoading(true);
            const data = await getOutstandingDoctors();
            setDoctors(data);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách bác sĩ');
            console.error('Error fetching outstanding doctors:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDoctorPress = (doctor: DoctorResponse) => {
        navigation.navigate(ROUTING.DOCTOR_DETAIL, { doctor });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (doctors.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bác sĩ nổi bật</Text>
            <Text style={styles.subtitle}>Đội ngũ bác sĩ giàu kinh nghiệm và tận tâm</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {doctors.map((doctor) => (
                    <TouchableOpacity
                        key={doctor.userId}
                        style={styles.card}
                        onPress={() => handleDoctorPress(doctor)}
                        activeOpacity={0.7}
                    >
                        <Image
                            source={{ uri: doctor.avatarUrl || 'https://static.vecteezy.com/system/resources/previews/015/412/022/non_2x/doctor-round-avatar-medicine-flat-avatar-with-male-doctor-medical-clinic-team-round-icon-medical-collection-illustration-vector.jpg' }}
                            style={styles.avatar}
                        />
                        <View style={styles.cardContent}>
                            <Text style={styles.doctorName} numberOfLines={1}>
                                {doctor.fullName}
                            </Text>
                            <Text style={styles.specialty} numberOfLines={1}>
                                {doctor.specialty}
                            </Text>
                            <View style={styles.ratingContainer}>
                                <Text style={styles.rating}>⭐ {doctor.rating?.toFixed(1) || 'N/A'}</Text>
                                <Text style={styles.experience}>
                                    {doctor.experienceYears || 0} năm kinh nghiệm
                                </Text>
                            </View>
                            <Text style={styles.fee}>
                                Phí khám: {doctor.examinationFee ? doctor.examinationFee.toLocaleString('vi-VN') : '0'}đ
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold' as const,
        color: '#212121',
        textAlign: 'center' as const,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
    },
    scrollContent: {
        paddingHorizontal: 10,
    },
    loadingContainer: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 14,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 8,
        width: 200,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%' as const,
        height: 150,
        backgroundColor: '#f0f0f0',
    },
    cardContent: {
        padding: 12,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: 'bold' as const,
        color: '#212121',
        marginBottom: 4,
    },
    specialty: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    rating: {
        fontSize: 14,
        color: '#FFA500',
        fontWeight: '600',
    },
    experience: {
        fontSize: 12,
        color: '#999',
    },
    fee: {
        fontSize: 14,
        color: '#2196F3',
        fontWeight: '600' as const,
    },
});

export default OutstandingDoctors;
