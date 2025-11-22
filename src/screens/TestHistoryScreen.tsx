import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import useHealthRecord from '../hooks/useHealthRecord';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const screenWidth = Dimensions.get('window').width;

const TestHistoryScreen = () => {
    const { handleGetHealthMetricByPatient, healthMetrics, loading, error } = useHealthRecord();
    const user = useSelector((state: RootState) => state.user.user);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
    const [showChart, setShowChart] = useState<boolean>(true);

    // Lấy danh sách tất cả các chỉ số có trong dữ liệu
    const availableMetrics = useMemo(() => {
        const metricsSet = new Set<string>();
        healthMetrics.forEach(record => {
            record.metrics.forEach(metric => {
                metricsSet.add(metric.name);
            });
        });
        return Array.from(metricsSet);
    }, [healthMetrics]);

    // Tự động chọn chỉ số đầu tiên khi có dữ liệu
    useEffect(() => {
        if (availableMetrics.length > 0 && !selectedMetric) {
            setSelectedMetric(availableMetrics[0]);
        }
    }, [availableMetrics]);

    // Chuẩn bị dữ liệu cho biểu đồ
    const chartData = useMemo(() => {
        if (!selectedMetric || healthMetrics.length === 0) return null;

        // Sắp xếp dữ liệu theo thời gian
        const sortedRecords = [...healthMetrics].sort((a, b) =>
            new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
        );

        const labels: string[] = [];
        const values: number[] = [];
        let unit = '';

        sortedRecords.forEach(record => {
            const metric = record.metrics.find(m => m.name === selectedMetric);
            if (metric) {
                const date = new Date(record.measuredAt);
                const label = `${date.getDate()}/${date.getMonth() + 1}`;
                labels.push(label);

                const value = typeof metric.value === 'number'
                    ? metric.value
                    : parseFloat(metric.value as string);
                values.push(isNaN(value) ? 0 : value);

                if (!unit && metric.unit) {
                    unit = metric.unit;
                }
            }
        });

        if (values.length === 0) return null;

        return { labels, values, unit };
    }, [selectedMetric, healthMetrics]);

    // Tính toán thay đổi theo tháng
    const monthlyChanges = useMemo(() => {
        if (!selectedMetric || healthMetrics.length === 0) return [];

        const monthlyData: { [key: string]: { values: number[], count: number } } = {};

        healthMetrics.forEach(record => {
            const metric = record.metrics.find(m => m.name === selectedMetric);
            if (metric) {
                const date = new Date(record.measuredAt);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                const value = typeof metric.value === 'number'
                    ? metric.value
                    : parseFloat(metric.value as string);

                if (!isNaN(value)) {
                    if (!monthlyData[monthKey]) {
                        monthlyData[monthKey] = { values: [], count: 0 };
                    }
                    monthlyData[monthKey].values.push(value);
                    monthlyData[monthKey].count++;
                }
            }
        });

        // Tính trung bình và so sánh
        const months = Object.keys(monthlyData).sort();
        const changes = months.map((month, index) => {
            const avg = monthlyData[month].values.reduce((a, b) => a + b, 0) / monthlyData[month].count;
            const monthDate = new Date(month + '-01');
            const monthName = monthDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

            let change = 0;
            let changePercent = 0;

            if (index > 0) {
                const prevMonth = months[index - 1];
                const prevAvg = monthlyData[prevMonth].values.reduce((a, b) => a + b, 0) / monthlyData[prevMonth].count;
                change = avg - prevAvg;
                changePercent = prevAvg !== 0 ? (change / prevAvg) * 100 : 0;
            }

            return {
                month: monthName,
                average: avg,
                change,
                changePercent,
                count: monthlyData[month].count
            };
        });

        return changes;
    }, [selectedMetric, healthMetrics]);

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
                            {/* Toggle hiển thị biểu đồ */}
                            <TouchableOpacity
                                style={styles.toggleButton}
                                onPress={() => setShowChart(!showChart)}
                            >
                                <Text style={styles.toggleButtonText}>
                                    {showChart ? '📊 Ẩn biểu đồ' : '📊 Hiện biểu đồ'}
                                </Text>
                            </TouchableOpacity>

                            {/* Biểu đồ và phân tích */}
                            {showChart && (
                                <>
                                    {/* Chọn chỉ số để hiển thị */}
                                    <View style={styles.chartCard}>
                                        <Text style={styles.chartTitle}>Biểu đồ theo dõi</Text>

                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            style={styles.metricSelector}
                                        >
                                            {availableMetrics.map((metric) => (
                                                <TouchableOpacity
                                                    key={metric}
                                                    style={[
                                                        styles.metricButton,
                                                        selectedMetric === metric && styles.metricButtonActive
                                                    ]}
                                                    onPress={() => setSelectedMetric(metric)}
                                                >
                                                    <Text style={[
                                                        styles.metricButtonText,
                                                        selectedMetric === metric && styles.metricButtonTextActive
                                                    ]}>
                                                        {metric}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>

                                        {/* Biểu đồ đường */}
                                        {chartData && chartData.values.length > 0 && (
                                            <ScrollView
                                                horizontal
                                                showsHorizontalScrollIndicator={true}
                                                style={styles.chartScrollView}
                                            >
                                                <LineChart
                                                    data={{
                                                        labels: chartData.labels,
                                                        datasets: [{
                                                            data: chartData.values,
                                                            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                                                            strokeWidth: 3
                                                        }],
                                                        legend: [selectedMetric || '']
                                                    }}
                                                    width={Math.max(screenWidth - 60, chartData.labels.length * 60)}
                                                    height={240}
                                                    chartConfig={{
                                                        backgroundColor: '#ffffff',
                                                        backgroundGradientFrom: '#ffffff',
                                                        backgroundGradientTo: '#f8f9fa',
                                                        decimalPlaces: 1,
                                                        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                                                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                                        style: {
                                                            borderRadius: 16
                                                        },
                                                        propsForDots: {
                                                            r: '6',
                                                            strokeWidth: '2',
                                                            stroke: '#007AFF'
                                                        },
                                                        propsForBackgroundLines: {
                                                            strokeDasharray: '',
                                                            stroke: '#e3e3e3',
                                                            strokeWidth: 1
                                                        }
                                                    }}
                                                    bezier
                                                    style={styles.chart}
                                                    withInnerLines={true}
                                                    withOuterLines={true}
                                                    withVerticalLabels={true}
                                                    withHorizontalLabels={true}
                                                    withDots={true}
                                                    withShadow={false}
                                                    fromZero={false}
                                                />
                                            </ScrollView>
                                        )}

                                        {chartData && chartData.unit && (
                                            <Text style={styles.chartUnit}>Đơn vị: {chartData.unit}</Text>
                                        )}

                                        {(!chartData || chartData.values.length === 0) && (
                                            <View style={styles.noChartData}>
                                                <Text style={styles.noChartDataText}>
                                                    Không có dữ liệu cho chỉ số này
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Phân tích thay đổi theo tháng */}
                                    {monthlyChanges.length > 0 && (
                                        <View style={styles.analysisCard}>
                                            <Text style={styles.analysisTitle}>📈 Phân tích theo tháng</Text>
                                            {monthlyChanges.map((monthData, index) => (
                                                <View key={index} style={styles.monthItem}>
                                                    <View style={styles.monthHeader}>
                                                        <Text style={styles.monthName}>{monthData.month}</Text>
                                                        <Text style={styles.monthCount}>
                                                            ({monthData.count} lần đo)
                                                        </Text>
                                                    </View>

                                                    <View style={styles.monthStats}>
                                                        <View style={styles.statItem}>
                                                            <Text style={styles.statLabel}>Trung bình:</Text>
                                                            <Text style={styles.statValue}>
                                                                {monthData.average.toFixed(1)} {chartData?.unit}
                                                            </Text>
                                                        </View>

                                                        {index > 0 && (
                                                            <View style={styles.statItem}>
                                                                <Text style={styles.statLabel}>Thay đổi:</Text>
                                                                <View style={styles.changeContainer}>
                                                                    <Text style={[
                                                                        styles.changeValue,
                                                                        monthData.change > 0 ? styles.changePositive :
                                                                            monthData.change < 0 ? styles.changeNegative :
                                                                                styles.changeNeutral
                                                                    ]}>
                                                                        {monthData.change > 0 ? '+' : ''}
                                                                        {monthData.change.toFixed(1)} {chartData?.unit}
                                                                    </Text>
                                                                    <Text style={[
                                                                        styles.changePercent,
                                                                        monthData.changePercent > 0 ? styles.changePositive :
                                                                            monthData.changePercent < 0 ? styles.changeNegative :
                                                                                styles.changeNeutral
                                                                    ]}>
                                                                        ({monthData.changePercent > 0 ? '+' : ''}
                                                                        {monthData.changePercent.toFixed(1)}%)
                                                                        {monthData.change > 0 ? ' ↑' : monthData.change < 0 ? ' ↓' : ' →'}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                        )}
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </>
                            )}

                            {/* Danh sách chi tiết các lần đo */}
                            <View style={styles.historyHeader}>
                                <Text style={styles.historyTitle}>📋 Lịch sử đo</Text>
                            </View>

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
    // Toggle Button
    toggleButton: {
        backgroundColor: '#007AFF',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    toggleButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    // Chart Card
    chartCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 16,
    },
    // Metric Selector
    metricSelector: {
        marginBottom: 16,
    },
    metricButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#E9ECEF',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#DEE2E6',
    },
    metricButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    metricButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#495057',
    },
    metricButtonTextActive: {
        color: '#FFFFFF',
    },
    // Chart
    chartScrollView: {
        marginVertical: 8,
    },
    chart: {
        borderRadius: 16,
        marginVertical: 8,
    },
    chartUnit: {
        fontSize: 12,
        color: '#6C757D',
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
    noChartData: {
        padding: 30,
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        marginTop: 8,
    },
    noChartDataText: {
        fontSize: 14,
        color: '#6C757D',
    },
    // Analysis Card
    analysisCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    analysisTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 16,
    },
    monthItem: {
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    monthName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
    },
    monthCount: {
        fontSize: 12,
        color: '#6C757D',
    },
    monthStats: {
        gap: 8,
    },
    statItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    statLabel: {
        fontSize: 14,
        color: '#495057',
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#212529',
    },
    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    changeValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    changePercent: {
        fontSize: 12,
        fontWeight: '600',
    },
    changePositive: {
        color: '#28A745',
    },
    changeNegative: {
        color: '#DC3545',
    },
    changeNeutral: {
        color: '#6C757D',
    },
    // History Header
    historyHeader: {
        marginTop: 8,
        marginBottom: 16,
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
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
