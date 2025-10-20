import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MedicalRecordScreen = () => {
    // Mock data for medical records
    const medicalRecords = [
        {
            id: 1,
            date: '18/10/2025',
            doctor: 'BS. Nguyễn Thị B',
            diagnosis: 'Viêm họng cấp',
            treatment: 'Kê đơn thuốc kháng sinh',
            department: 'Tai Mũi Họng',
        },
        {
            id: 2,
            date: '12/10/2025',
            doctor: 'BS. Trần Văn C',
            diagnosis: 'Đau đầu mãn tính',
            treatment: 'Thuốc giảm đau, nghỉ ngơi',
            department: 'Thần kinh',
        },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Hồ sơ khám</Text>
            </View>

            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    {medicalRecords.map((record) => (
                        <View key={record.id} style={styles.recordCard}>
                            <View style={styles.recordHeader}>
                                <Text style={styles.recordDate}>{record.date}</Text>
                                <Text style={styles.department}>{record.department}</Text>
                            </View>

                            <View style={styles.recordBody}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Bác sĩ:</Text>
                                    <Text style={styles.value}>{record.doctor}</Text>
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
                        </View>
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
