import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/type';
import { Record } from '../types/healthRecord';

type MedicalRecordDetailRouteProp = RouteProp<RootStackParamList, 'MedicalRecordDetail'>;
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

const MedicalRecordDetailScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<MedicalRecordDetailRouteProp>();
    const record = route.params && 'record' in route.params ? route.params.record : undefined;

    if (!record) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chi tiết hồ sơ</Text>
                    <View style={styles.backButton} />
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Không tìm thấy thông tin hồ sơ</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết hồ sơ khám</Text>
                <View style={styles.backButton} />
            </View>

            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    {/* Thông tin chung */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📋 Thông tin chung</Text>
                        <View style={styles.card}>
                            <InfoRow label="Ngày khám" value={formatDateTime(String(record.createdAt))} />
                            <InfoRow label="Mã hồ sơ" value={String(record.recordId)} />
                            <InfoRow label="Mã cuộc hẹn" value={String(record.appointmentId)} />
                            <InfoRow label="Dịch vụ" value={String(record.serviceName)} highlight />
                        </View>
                    </View>

                    {/* Thông tin bệnh nhân */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>👤 Thông tin bệnh nhân</Text>
                        <View style={styles.card}>
                            <InfoRow label="Họ tên" value={String(record.patient?.fullName || 'N/A')} />
                            <InfoRow label="Email" value={String(record.patient?.email || 'N/A')} />
                            <InfoRow label="Số điện thoại" value={String(record.patient?.phone || 'N/A')} />
                        </View>
                    </View>

                    {/* Thông tin bác sĩ */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>👨‍⚕️ Thông tin bác sĩ</Text>
                        <View style={styles.card}>
                            <InfoRow label="Bác sĩ" value={String(record.doctorName)} />
                            <InfoRow label="Mã bác sĩ" value={String(record.doctorId)} />
                        </View>
                    </View>

                    {/* Chẩn đoán và điều trị */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🏥 Chẩn đoán & Điều trị</Text>
                        <View style={styles.card}>
                            <InfoRow label="Triệu chứng" value={String(record.symptoms || 'Không có')} multiline />
                            <InfoRow label="Chẩn đoán" value={String(record.diagnosis)} multiline highlight />
                            <InfoRow label="Điều trị" value={String(record.treatment)} multiline />
                            <InfoRow label="Ghi chú của bác sĩ" value={String(record.doctorNote || 'Không có')} multiline />
                        </View>
                    </View>

                    {/* Tình trạng sức khỏe */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>💊 Tình trạng</Text>
                        <View style={styles.card}>
                            <InfoRow label="Trạng thái" value={String(record.stage)} />
                            <InfoRow label="Tình trạng sức khỏe" value={String(record.statusHealth)} />
                            {record.followUpDate && (
                                <InfoRow
                                    label="Ngày tái khám"
                                    value={formatDateTime(String(record.followUpDate))}
                                    highlight
                                />
                            )}
                        </View>
                    </View>

                    {/* Đơn thuốc */}
                    {record.prescriptions && record.prescriptions.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>💊 Đơn thuốc</Text>
                            {record.prescriptions.map((prescription: any, index: number) => (
                                <View key={index} style={styles.card}>
                                    <Text style={styles.prescriptionTitle}>Đơn thuốc #{index + 1}</Text>
                                    {/* Hiển thị thông tin đơn thuốc nếu có */}
                                    <Text style={styles.prescriptionText}>{JSON.stringify(prescription, null, 2)}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Hình ảnh đính kèm */}
                    {record.imageAttachments && record.imageAttachments.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>📸 Hình ảnh đính kèm</Text>
                            <View style={styles.imageGrid}>
                                {record.imageAttachments.map((imageUrl: String, index: number) => (
                                    <View key={index} style={styles.imageContainer}>
                                        <Image
                                            source={{ uri: String(imageUrl) }}
                                            style={styles.image}
                                            resizeMode="cover"
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Chữ ký */}
                    {record.signatureUrl && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>✍️ Chữ ký bác sĩ</Text>
                            <View style={styles.card}>
                                <Image
                                    source={{ uri: String(record.signatureUrl) }}
                                    style={styles.signatureImage}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>
                    )}

                    {/* Thông tin cập nhật */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>ℹ️ Thông tin khác</Text>
                        <View style={styles.card}>
                            <InfoRow label="Ngày tạo" value={formatDateTime(String(record.createdAt))} />
                            <InfoRow label="Cập nhật lần cuối" value={formatDateTime(String(record.updatedAt))} />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// Component helper để hiển thị thông tin
const InfoRow = ({
    label,
    value,
    multiline = false,
    highlight = false
}: {
    label: string;
    value: string;
    multiline?: boolean;
    highlight?: boolean;
}) => (
    <View style={[styles.infoRow, multiline && styles.infoRowColumn]}>
        <Text style={styles.infoLabel}>{label}:</Text>
        <Text style={[
            styles.infoValue,
            multiline && styles.infoValueMultiline,
            highlight && styles.infoValueHighlight
        ]}>
            {value}
        </Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#007AFF',
        padding: 16,
        paddingTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 28,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        flex: 1,
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    infoRowColumn: {
        flexDirection: 'column',
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        width: 140,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        color: '#000',
        flex: 1,
        fontWeight: '500',
    },
    infoValueMultiline: {
        lineHeight: 20,
    },
    infoValueHighlight: {
        color: '#007AFF',
        fontWeight: '600',
    },
    prescriptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
        marginBottom: 8,
    },
    prescriptionText: {
        fontSize: 13,
        color: '#333',
        fontFamily: 'monospace',
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    imageContainer: {
        width: '48%',
        aspectRatio: 1,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#E0E0E0',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    signatureImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#F9F9F9',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
    },
});

export default MedicalRecordDetailScreen;
