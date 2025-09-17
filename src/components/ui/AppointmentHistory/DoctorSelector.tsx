import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Image,
} from 'react-native';
import { Doctor } from '../../../types/booking';

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
    const renderDoctorItem = ({ item }: { item: Doctor }) => {
        const isSelected = selectedDoctor?.id === item.id;

        return (
            <TouchableOpacity
                style={[styles.doctorCard, isSelected && styles.selectedCard]}
                onPress={() => onDoctorSelect(item)}
            >
                <View style={styles.doctorInfo}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {item.name ? item.name.split(' ').slice(-2).map(part => part.charAt(0)).join('') : 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.doctorDetails}>
                        <Text style={[styles.doctorName, isSelected && styles.selectedText]}>
                            {item.name}
                        </Text>
                        <Text style={[styles.doctorSpecialty, isSelected && styles.selectedSpecialtyText]}>
                            {item.specialty}
                        </Text>
                        <View style={styles.ratingContainer}>
                            <Text style={styles.starIcon}>⭐</Text>
                            <Text style={[styles.rating, isSelected && styles.selectedText]}>
                                {item.rating}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Chọn bác sĩ</Text>
            <FlatList
                data={doctors}
                renderItem={renderDoctorItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />
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
    },
    avatarText: {
        color: '#fff',
        fontSize: 16,
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
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    rating: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
});

export default DoctorSelector;