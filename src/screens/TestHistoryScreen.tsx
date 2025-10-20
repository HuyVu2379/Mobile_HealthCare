import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TestHistoryScreen = () => {
    // Mock data for test history
    const testHistory = [
        {
            id: 1,
            testName: 'Xét nghiệm máu tổng quát',
            date: '15/10/2025',
            status: 'Đã hoàn thành',
            result: 'Bình thường',
        },
        {
            id: 2,
            testName: 'Xét nghiệm nước tiểu',
            date: '10/10/2025',
            status: 'Đã hoàn thành',
            result: 'Bình thường',
        },
        {
            id: 3,
            testName: 'Xét nghiệm đường huyết',
            date: '05/10/2025',
            status: 'Đã hoàn thành',
            result: 'Bình thường',
        },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Lịch sử xét nghiệm</Text>
            </View>

            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    {testHistory.map((test) => (
                        <View key={test.id} style={styles.testCard}>
                            <View style={styles.testHeader}>
                                <Text style={styles.testName}>{test.testName}</Text>
                                <Text style={styles.testDate}>{test.date}</Text>
                            </View>
                            <View style={styles.testDetails}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Trạng thái:</Text>
                                    <Text style={[styles.detailValue, styles.statusCompleted]}>
                                        {test.status}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Kết quả:</Text>
                                    <Text style={styles.detailValue}>{test.result}</Text>
                                </View>
                            </View>
                        </View>
                    ))}

                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>
                            🔬 Màn hình Lịch sử xét nghiệm
                        </Text>
                        <Text style={styles.placeholderSubtext}>
                            Hiển thị danh sách các xét nghiệm đã thực hiện
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
    testCard: {
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
    testHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    testName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        flex: 1,
    },
    testDate: {
        fontSize: 14,
        color: '#666666',
    },
    testDetails: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        color: '#666666',
    },
    detailValue: {
        fontSize: 14,
        color: '#000000',
        fontWeight: '500',
    },
    statusCompleted: {
        color: '#4CAF50',
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

export default TestHistoryScreen;
