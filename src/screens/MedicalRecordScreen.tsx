import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useHealthRecord from '../hooks/useHealthRecord';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/type';
import ROUTING from '../constants/routing';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const formatDateTime = (dateString: string) => {
    try {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
        return dateString;
    }
};

const MedicalRecordScreen = () => {
    const { handleGetMedicalRecordByPatient, medicalRecords } = useHealthRecord();
    const user = useSelector((state: RootState) => state.user.user);
    const navigation = useNavigation<NavigationProp>();

    useEffect(() => {
        const fetchMedicalRecords = async () => {
            const patientId = user?.userId || 'patient-123';
            await handleGetMedicalRecordByPatient(patientId);
        };
        fetchMedicalRecords();
    }, [user?.userId]);

    const handleRecordPress = (record: any) => {
        navigation.navigate(ROUTING.MEDICAL_RECORD_DETAIL, { record });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Hồ sơ khám</Text>
            </View>

            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    {medicalRecords.map((record) => (
                        <TouchableOpacity
                            key={String(record.recordId)}
                            style={styles.recordCard}
                            onPress={() => handleRecordPress(record)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.recordHeader}>
                                <Text style={styles.recordDate}>{formatDateTime(String(record.createdAt))}</Text>
                                <Text style={styles.department}>{record.serviceName}</Text>
                            </View>

                            <View style={styles.recordBody}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Bác sĩ:</Text>
                                    <Text style={styles.value}>{record.doctorName}</Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Chẩn đoán:</Text>
                                    <Text style={styles.value}>{record.diagnosis}</Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Điều trị:</Text>
                                    <Text style={styles.value}>{record.treatment}</Text>
                                </View>
                            </View>

                            <View style={styles.viewDetailRow}>
                                <Text style={styles.viewDetailText}>Xem chi tiết →</Text>
                            </View>
                        </TouchableOpacity>
                    ))}

                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>
                            📄 Màn hình Hồ sơ khám
                        </Text>
                        <Text style={styles.placeholderSubtext}>
                            Hiển thị lịch sử khám bệnh và chẩn đoán
                        </Text>
                    </View>
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
    header: {
        backgroundColor: '#007AFF',
        padding: 20,
        paddingTop: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    recordCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    recordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    recordDate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
    },
    department: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
    },
    recordBody: {
        gap: 10,
    },
    infoRow: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 14,
        color: '#666666',
        width: 100,
    },
    value: {
        fontSize: 14,
        color: '#000000',
        flex: 1,
        fontWeight: '500',
    },
    viewDetailRow: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        alignItems: 'flex-end',
    },
    viewDetailText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    placeholder: {
        marginTop: 20,
        padding: 30,
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#007AFF',
        marginBottom: 8,
    },
    placeholderSubtext: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
    },
});

export default MedicalRecordScreen;
