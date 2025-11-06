import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
} from 'react-native';
import { Doctor } from '../../../types/appointment';

interface DoctorSelectorProps {
    doctors: Doctor[];
    selectedDoctor: Doctor | null;
    onDoctorSelect: (doctor: Doctor) => void;
}

const DoctorSelector: React.FC<DoctorSelectorProps> = ({
    doctors,
    selectedDoctor,
    onDoctorSelect,
}) => {
    const renderDoctorItem = (item: Doctor) => {
        const isSelected = selectedDoctor?.doctorId === item.doctorId;

        return (
            <TouchableOpacity
                key={item.doctorId}
                style={[styles.doctorCard, isSelected && styles.selectedCard]}
                onPress={() => onDoctorSelect(item)}
            >
                <View style={styles.doctorInfo}>
                    <View style={styles.avatarContainer}>
                        {item.avatarUrl ? (
                            <Image source={{ uri: item.avatarUrl }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>
                                {item.fullName.charAt(0).toUpperCase()}
                            </Text>
                        )}
                    </View>
                    <View style={styles.doctorDetails}>
                        <Text style={[styles.doctorName, isSelected && styles.selectedText]}>
                            {String(item.fullName)}
                        </Text>
                        <Text style={[styles.doctorSpecialty, isSelected && styles.selectedSpecialtyText]}>
                            {String(item.specialty) || 'Chưa cập nhật'}
                        </Text>
                        {item.clinicAddress && (
                            <Text style={styles.clinicAddress} numberOfLines={1}>
                                Địa chỉ: {String(item.clinicAddress)}
                            </Text>
                        )}
                        <View style={styles.extraInfo}>
                            {item.examinationFee && (
                                <Text style={styles.fee}>
                                    Giá khám: {Number(item.examinationFee).toLocaleString('vi-VN')} VNĐ
                                </Text>
                            )}
                            {item.rating && (
                                <Text style={styles.rating}>
                                    ⭐ {Number(item.rating)}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Chọn bác sĩ</Text>
            <View style={styles.listContainer}>
                {doctors.map((doctor) => renderDoctorItem(doctor))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    listContainer: {
        gap: 12,
    },
    doctorCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    selectedCard: {
        borderColor: '#4285F4',
        backgroundColor: '#f0f7ff',
        borderWidth: 2,
    },
    doctorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#4285F4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    avatarImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },
    doctorDetails: {
        flex: 1,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    selectedText: {
        color: '#4285F4',
    },
    doctorSpecialty: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
    },
    selectedSpecialtyText: {
        color: '#555',
    },
    clinicAddress: {
        fontSize: 13,
        color: '#666',
        marginBottom: 6,
    },
    extraInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 4,
    },
    fee: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4CAF50',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    rating: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FF9800',
    },
});

export default DoctorSelector;