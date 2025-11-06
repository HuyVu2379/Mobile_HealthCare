import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useHealthRecord from '../hooks/useHealthRecord';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const TestHistoryScreen = () => {
    const { handleGetHealthMetricByPatient, healthMetrics, loading, error } = useHealthRecord();
    const user = useSelector((state: RootState) => state.user.user);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    useEffect(() => {
        if (user?.userId) {
            handleGetHealthMetricByPatient(user.userId);
        }
    }, [user?.userId]);

    const onRefresh = () => {
        if (user?.userId) {
            handleGetHealthMetricByPatient(user.userId);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Chỉ số sức khỏe</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
            >
                <View style={styles.content}>
                    {loading && healthMetrics.length === 0 ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorIcon}>⚠️</Text>
                            <Text style={styles.errorText}>{error}</Text>
                            <Text style={styles.errorSubtext}>Vui lòng thử lại sau</Text>
                        </View>
                    ) : healthMetrics.length > 0 ? (
                        <>
                            {healthMetrics.map((record, recordIndex) => {
                                const isExpanded = expandedIndex === recordIndex;
                                return (
                                    <View key={recordIndex} style={styles.recordCard}>
                                        {/* Header của từng lần đo - Clickable */}
                                        <TouchableOpacity
                                            style={styles.recordHeader}
                                            onPress={() => toggleExpand(recordIndex)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.recordHeaderLeft}>
                                                <Text style={styles.recordDate}>
                                                    📅 {formatDate(record.measuredAt)}
                                                </Text>
                                                <View style={styles.recordBadge}>
                                                    <Text style={styles.recordBadgeText}>
                                                        {record.metrics.length} chỉ số
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={styles.expandIcon}>
                                                {isExpanded ? '▼' : '▶'}
                                            </Text>
                                        </TouchableOpacity>

                                        {/* Danh sách các chỉ số - Chỉ hiện khi expanded */}
                                        {isExpanded && (
                                            <View style={styles.metricsContainer}>
                                                {record.metrics.map((metric, metricIndex) => (
                                                    <View key={metricIndex} style={styles.metricItem}>
                                                        <Text style={styles.metricName}>{metric.name}</Text>
                                                        <View style={styles.metricValueRow}>
                                                            <Text style={styles.metricValue}>
                                                                {typeof metric.value === 'number'
                                                                    ? (metric.value as number).toFixed(1)
                                                                    : String(metric.value)}
                                                            </Text>
                                                            {metric.unit && (
                                                                <Text style={styles.metricUnit}> {metric.unit}</Text>
                                                            )}
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </>
                    ) : (
                        <View style={styles.placeholder}>
                            <Text style={styles.placeholderIcon}>🔬</Text>
                            <Text style={styles.placeholderText}>Chưa có dữ liệu</Text>
                            <Text style={styles.placeholderSubtext}>Kéo xuống để tải lại</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
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
    // Loading & Error States
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666666',
    },
    errorContainer: {
        backgroundColor: '#FFEBEE',
        padding: 30,
        borderRadius: 12,
        alignItems: 'center',
        marginVertical: 20,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    errorText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#D32F2F',
        marginBottom: 8,
        textAlign: 'center',
    },
    errorSubtext: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
    },
    // Record Card (Mỗi lần đo)
    recordCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    recordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8F9FA',
    },
    recordHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    recordDate: {
        fontSize: 16,
        fontWeight: '700',
        color: '#212529',
        marginRight: 12,
    },
    recordBadge: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    recordBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    expandIcon: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    // Metrics Container
    metricsContainer: {
        padding: 16,
    },
    metricItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F5',
    },
    metricName: {
        fontSize: 14,
        color: '#495057',
        flex: 1,
        marginRight: 12,
    },
    metricValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    metricValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#212529',
    },
    metricUnit: {
        fontSize: 12,
        color: '#6C757D',
        marginLeft: 4,
    },
    // Placeholder
    placeholder: {
        marginTop: 40,
        padding: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#E0E0E0',
    },
    placeholderIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    placeholderText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#007AFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    placeholderSubtext: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
    },
});

export default TestHistoryScreen;
