import React, { useState } from 'react';
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { InputField, DropdownSelect, Section, Button } from '../components/ui/HealthForm';
import { HealthFormData, initialHealthFormData, convertFormDataToApiData, PredictHealthResponse } from '../types/healthForm';
import {
    PHYSICAL_ACTIVITY_OPTIONS,
    DIET_OPTIONS,
    YES_NO_OPTIONS,
    ALCOHOL_OPTIONS,
    WEIGHT_CHANGES_OPTIONS,
    STRESS_LEVEL_OPTIONS,
    ANA_OPTIONS,
    HEMATURIA_OPTIONS,
} from '../constants/healthFormOptions';
import { colors } from '../theme/colors';
import { spacing, borderRadius } from '../theme/spacing';
import { fontSize, fontFamily } from '../theme/typography';
import useAI from '../hooks/useAI';
import { useAuthContext } from '../contexts/AuthContext';
import { CreatePredictRequest, HealthMetric } from '../types/healthForm';
const HealthFormScreen: React.FC = () => {
    const [formData, setFormData] = useState<HealthFormData>(initialHealthFormData);
    const [errors, setErrors] = useState<Partial<HealthFormData>>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [predictionResult, setPredictionResult] = useState<PredictHealthResponse | null>(null);
    const { handlePredictCKD, handleCreatePredict } = useAI();
    const { user } = useAuthContext();

    // Helper functions for styling based on prediction results
    const getStageStyle = (stage: String) => {
        const stageStr = String(stage).toLowerCase();
        if (stageStr.includes('stage 1') || stageStr.includes('normal')) {
            return { color: colors.success };
        } else if (stageStr.includes('stage 2')) {
            return { color: colors.warning };
        } else if (stageStr.includes('stage 3')) {
            return { color: colors.warning };
        } else if (stageStr.includes('stage 4') || stageStr.includes('stage 5')) {
            return { color: colors.error };
        }
        return { color: colors.gray[700] };
    };

    const getRiskStyle = (riskLevel: String) => {
        const risk = String(riskLevel).toLowerCase();
        if (risk.includes('low') || risk.includes('thấp')) {
            return { color: colors.success };
        } else if (risk.includes('moderate') || risk.includes('trung bình')) {
            return { color: colors.warning };
        } else if (risk.includes('high') || risk.includes('cao')) {
            return { color: colors.error };
        }
        return { color: colors.gray[700] };
    };

    const getRiskText = (riskLevel: String) => {
        const risk = String(riskLevel).toLowerCase();
        if (risk.includes('low')) return 'Thấp';
        if (risk.includes('moderate')) return 'Trung Bình';
        if (risk.includes('high')) return 'Cao';
        return String(riskLevel);
    };

    // Helper function to create health metrics from form data
    const createHealthMetrics = (apiData: any, userId: string): HealthMetric[] => {
        const metrics: HealthMetric[] = [];
        const currentDate = new Date();

        // Mapping of field names to display names and units
        const fieldMapping: { [key: string]: { name: string; unit: string } } = {
            serum_creatinine: { name: 'Serum Creatinine', unit: 'mg/dL' },
            gfr: { name: 'GFR (Glomerular Filtration Rate)', unit: 'mL/min/1.73m²' },
            bun: { name: 'BUN (Blood Urea Nitrogen)', unit: 'mg/dL' },
            serum_calcium: { name: 'Serum Calcium', unit: 'mg/dL' },
            c3_c4: { name: 'C3/C4 Complement', unit: 'mg/dL' },
            oxalate_levels: { name: 'Oxalate Levels', unit: 'mg/24h' },
            urine_ph: { name: 'Urine pH', unit: '' },
            blood_pressure: { name: 'Huyết Áp Tâm Trương', unit: 'mmHg' },
            water_intake: { name: 'Lượng Nước Uống Hàng Ngày', unit: 'lít/ngày' },
            hematuria: { name: 'Hematuria (Máu trong nước tiểu)', unit: '' },
            ana: { name: 'ANA (Antinuclear Antibody)', unit: '' }
        };

        // Mapping for categorical fields
        const categoricalMapping: { [key: string]: { name: string; unit: string } } = {
            physical_activity: { name: 'Hoạt Động Thể Chất', unit: '' },
            diet: { name: 'Chế Độ Ăn', unit: '' },
            smoking: { name: 'Hút Thuốc', unit: '' },
            alcohol: { name: 'Sử Dụng Rượu Bia', unit: '' },
            painkiller_usage: { name: 'Sử Dụng Thuốc Giảm Đau', unit: '' },
            family_history: { name: 'Tiền Sử Gia Đình', unit: '' },
            weight_changes: { name: 'Thay Đổi Cân Nặng', unit: '' },
            stress_level: { name: 'Mức Độ Căng Thẳng', unit: '' }
        };

        // Add numeric metrics
        Object.keys(fieldMapping).forEach(field => {
            if (apiData[field] !== undefined && apiData[field] !== null) {
                const mapping = fieldMapping[field];
                metrics.push({
                    patientId: userId,
                    metricName: mapping.name,
                    metricValue: Number(apiData[field]),
                    unit: mapping.unit,
                    recordId: null,
                    measuredAt: currentDate
                });
            }
        });

        // Add categorical metrics (as text values, using 0 as placeholder for metricValue)
        Object.keys(categoricalMapping).forEach(field => {
            if (apiData[field] !== undefined && apiData[field] !== null && apiData[field] !== '') {
                const mapping = categoricalMapping[field];
                metrics.push({
                    patientId: userId,
                    metricName: mapping.name,
                    metricValue: 0, // Placeholder since API expects number, actual value will be in unit field
                    unit: String(apiData[field]), // Store categorical value in unit field
                    recordId: null,
                    measuredAt: currentDate
                });
            }
        });

        return metrics;
    };

    const updateField = (field: keyof HealthFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };
    const validateForm = (): boolean => {
        const newErrors: Partial<HealthFormData> = {};

        // Validate required fields
        const requiredFields: (keyof HealthFormData)[] = [
            'serum_creatinine',
            'gfr',
            'physical_activity',
        ];

        requiredFields.forEach(field => {
            if (!formData[field].trim()) {
                newErrors[field] = 'Trường này là bắt buộc';
            }
        });

        // Validate numeric fields
        const numericFields = ['serum_creatinine', 'gfr', 'bun', 'serum_calcium', 'c3_c4', 'oxalate_levels', 'urine_ph', 'blood_pressure', 'water_intake'];

        numericFields.forEach(field => {
            const value = formData[field as keyof HealthFormData];
            if (value && isNaN(Number(value))) {
                newErrors[field as keyof HealthFormData] = 'Vui lòng nhập số hợp lệ';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            setIsLoading(true);
            setPredictionResult(null);

            try {
                const apiData = convertFormDataToApiData(formData);

                const result = await handlePredictCKD(apiData);
                if (result) {
                    setPredictionResult(result);
                    Alert.alert(
                        'Thành công',
                        'Dữ liệu đã được phân tích thành công! Kết quả được hiển thị bên dưới.',
                        [{ text: 'OK' }]
                    );

                    // Save the prediction to history
                    if (user && user.userId) {
                        try {
                            const healthMetrics = createHealthMetrics(apiData, user.userId);

                            // Extract stage number from predicted_stage string
                            const stageMatch = String(result.predicted_stage).match(/\d+/);
                            const stageNumber = stageMatch ? parseInt(stageMatch[0]) : 0;

                            const createPredictData: CreatePredictRequest = {
                                patientId: user.userId,
                                stage: stageNumber,
                                recommendations: result.recommendations || [],
                                confidence: Number(result.confidence) * 100, // Convert to percentage
                                healthMetrics: healthMetrics
                            };

                            await handleCreatePredict(createPredictData);
                        } catch (saveError) {
                            console.error('Error saving prediction to history:', saveError);
                            // Don't show error to user since the main prediction worked
                        }
                    }
                } else {
                    Alert.alert(
                        'Lỗi',
                        'Không thể phân tích dữ liệu. Vui lòng thử lại.',
                        [{ text: 'OK' }]
                    );
                }
            } catch (error) {
                console.error('Prediction error:', error);
                Alert.alert(
                    'Lỗi',
                    'Đã xảy ra lỗi khi phân tích dữ liệu. Vui lòng thử lại.',
                    [{ text: 'OK' }]
                );
            } finally {
                setIsLoading(false);
            }
        } else {
            Alert.alert(
                'Lỗi',
                'Vui lòng kiểm tra và điền đầy đủ thông tin bắt buộc.',
                [{ text: 'OK' }]
            );
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>Đánh Giá Sức Khỏe Thận</Text>
                <Text style={styles.subtitle}>
                    Vui lòng điền đầy đủ thông tin để AI có thể chẩn đoán chính xác
                </Text>
            </View>

            <Section title="Xét Nghiệm Máu" icon="🩸">
                <InputField
                    label="Nồng độ Serum Creatinine"
                    value={formData.serum_creatinine}
                    onChangeText={value => updateField('serum_creatinine', value)}
                    placeholder="Nhập giá trị"
                    unit="mg/dL"
                    keyboardType="decimal-pad"
                    required
                    error={errors.serum_creatinine}
                />

                <InputField
                    label="GFR (Glomerular Filtration Rate)"
                    value={formData.gfr}
                    onChangeText={value => updateField('gfr', value)}
                    placeholder="Nhập giá trị"
                    unit="mL/min/1.73m²"
                    keyboardType="decimal-pad"
                    required
                    error={errors.gfr}
                />

                <InputField
                    label="BUN (Blood Urea Nitrogen)"
                    value={formData.bun}
                    onChangeText={value => updateField('bun', value)}
                    placeholder="Nhập giá trị"
                    unit="mg/dL"
                    keyboardType="decimal-pad"
                    error={errors.bun}
                />

                <InputField
                    label="Serum Calcium"
                    value={formData.serum_calcium}
                    onChangeText={value => updateField('serum_calcium', value)}
                    placeholder="Nhập giá trị"
                    unit="mg/dL"
                    keyboardType="decimal-pad"
                    error={errors.serum_calcium}
                />

                <DropdownSelect
                    label="ANA (Antinuclear Antibody)"
                    value={formData.ana}
                    onSelect={value => updateField('ana', value)}
                    options={ANA_OPTIONS}
                    placeholder="Chọn kết quả"
                    error={errors.ana}
                />

                <InputField
                    label="C3/C4 Complement"
                    value={formData.c3_c4}
                    onChangeText={value => updateField('c3_c4', value)}
                    placeholder="Nhập giá trị"
                    unit="mg/dL"
                    keyboardType="decimal-pad"
                    error={errors.c3_c4}
                />
            </Section>

            <Section title="Xét Nghiệm Nước Tiểu" icon="🔬">
                <DropdownSelect
                    label="Hematuria (Máu trong nước tiểu)"
                    value={formData.hematuria}
                    onSelect={value => updateField('hematuria', value)}
                    options={HEMATURIA_OPTIONS}
                    placeholder="Chọn"
                    error={errors.hematuria}
                />

                <InputField
                    label="Oxalate Levels"
                    value={formData.oxalate_levels}
                    onChangeText={value => updateField('oxalate_levels', value)}
                    placeholder="Nhập giá trị"
                    unit="mg/24h"
                    keyboardType="decimal-pad"
                    error={errors.oxalate_levels}
                />

                <InputField
                    label="Urine pH"
                    value={formData.urine_ph}
                    onChangeText={value => updateField('urine_ph', value)}
                    placeholder="Nhập giá trị"
                    keyboardType="decimal-pad"
                    error={errors.urine_ph}
                />
            </Section>

            <Section title="Chỉ Số Sinh Hiệu" icon="❤️">
                <InputField
                    label="Huyết Áp Tâm Trương"
                    value={formData.blood_pressure}
                    onChangeText={value => updateField('blood_pressure', value)}
                    placeholder="80"
                    unit="mmHg"
                    keyboardType="number-pad"
                    error={errors.blood_pressure}
                />

                <InputField
                    label="Lượng Nước Uống Hàng Ngày"
                    value={formData.water_intake}
                    onChangeText={value => updateField('water_intake', value)}
                    placeholder="Nhập số lít"
                    unit="lít/ngày"
                    keyboardType="decimal-pad"
                    error={errors.water_intake}
                />
            </Section>

            <Section title="Thói Quen Sống" icon="🏃">
                <DropdownSelect
                    label="Hoạt Động Thể Chất"
                    value={formData.physical_activity}
                    onSelect={value => updateField('physical_activity', value)}
                    options={PHYSICAL_ACTIVITY_OPTIONS}
                    placeholder="Chọn tần suất"
                    required
                    error={errors.physical_activity}
                />

                <DropdownSelect
                    label="Chế Độ Ăn"
                    value={formData.diet}
                    onSelect={value => updateField('diet', value)}
                    options={DIET_OPTIONS}
                    placeholder="Chọn loại chế độ ăn"
                    error={errors.diet}
                />

                <DropdownSelect
                    label="Hút Thuốc"
                    value={formData.smoking}
                    onSelect={value => updateField('smoking', value)}
                    options={YES_NO_OPTIONS}
                    placeholder="Chọn"
                    error={errors.smoking}
                />

                <DropdownSelect
                    label="Sử Dụng Rượu Bia"
                    value={formData.alcohol}
                    onSelect={value => updateField('alcohol', value)}
                    options={ALCOHOL_OPTIONS}
                    placeholder="Chọn tần suất"
                    error={errors.alcohol}
                />

                <DropdownSelect
                    label="Sử Dụng Thuốc Giảm Đau"
                    value={formData.painkiller_usage}
                    onSelect={value => updateField('painkiller_usage', value)}
                    options={YES_NO_OPTIONS}
                    placeholder="Chọn"
                    error={errors.painkiller_usage}
                />
            </Section>

            <Section title="Tiền Sử & Tình Trạng" icon="📋">
                <DropdownSelect
                    label="Tiền Sử Gia Đình"
                    value={formData.family_history}
                    onSelect={value => updateField('family_history', value)}
                    options={YES_NO_OPTIONS}
                    placeholder="Có tiền sử bệnh thận trong gia đình?"
                    error={errors.family_history}
                />

                <DropdownSelect
                    label="Thay Đổi Cân Nặng"
                    value={formData.weight_changes}
                    onSelect={value => updateField('weight_changes', value)}
                    options={WEIGHT_CHANGES_OPTIONS}
                    placeholder="Chọn tình trạng"
                    error={errors.weight_changes}
                />

                <DropdownSelect
                    label="Mức Độ Căng Thẳng"
                    value={formData.stress_level}
                    onSelect={value => updateField('stress_level', value)}
                    options={STRESS_LEVEL_OPTIONS}
                    placeholder="Chọn mức độ"
                    error={errors.stress_level}
                />
            </Section>

            <View style={styles.buttonContainer}>
                <Button
                    title={isLoading ? "Đang Phân Tích..." : "Gửi Dữ Liệu Chẩn Đoán"}
                    onPress={handleSubmit}
                    size="large"
                    fullWidth
                    disabled={isLoading}
                />
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary[500]} />
                        <Text style={styles.loadingText}>Đang phân tích dữ liệu...</Text>
                    </View>
                )}
            </View>

            {predictionResult && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>Kết Quả Chẩn Đoán</Text>

                    <View style={styles.resultCard}>
                        <View style={styles.stageContainer}>
                            <Text style={styles.stageLabel}>Giai Đoạn Bệnh:</Text>
                            <Text style={[styles.stageValue, getStageStyle(predictionResult.predicted_stage)]}>
                                {predictionResult.predicted_stage}
                            </Text>
                        </View>

                        <View style={styles.confidenceContainer}>
                            <Text style={styles.confidenceLabel}>Độ Tin Cậy:</Text>
                            <Text style={styles.confidenceValue}>
                                {(Number(predictionResult.confidence) * 100).toFixed(1)}%
                            </Text>
                        </View>

                        <View style={styles.riskContainer}>
                            <Text style={styles.riskLabel}>Mức Độ Rủi Ro:</Text>
                            <Text style={[styles.riskValue, getRiskStyle(predictionResult.risk_level)]}>
                                {getRiskText(predictionResult.risk_level)}
                            </Text>
                        </View>

                        <View style={styles.descriptionContainer}>
                            <Text style={styles.descriptionLabel}>Mô Tả:</Text>
                            <Text style={styles.descriptionText}>{predictionResult.stage_description}</Text>
                        </View>

                        {predictionResult.recommendations && predictionResult.recommendations.length > 0 && (
                            <View style={styles.recommendationsContainer}>
                                <Text style={styles.recommendationsLabel}>Khuyến Nghị:</Text>
                                {predictionResult.recommendations.map((recommendation, index) => (
                                    <View key={index} style={styles.recommendationItem}>
                                        <Text style={styles.recommendationBullet}>•</Text>
                                        <Text style={styles.recommendationText}>{recommendation}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            )}

            <View style={styles.bottomSpacing} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    header: {
        backgroundColor: colors.primary[500],
        paddingHorizontal: spacing[6],
        paddingTop: spacing[12],
        paddingBottom: spacing[8],
        borderBottomLeftRadius: borderRadius['3xl'],
        borderBottomRightRadius: borderRadius['3xl'],
        marginBottom: spacing[6],
    },
    title: {
        fontSize: fontSize['3xl'],
        fontFamily: fontFamily.montserrat.bold,
        color: colors.white,
        textAlign: 'center',
        marginBottom: spacing[2],
    },
    subtitle: {
        fontSize: fontSize.base,
        fontFamily: fontFamily.montserrat.regular,
        color: colors.primary[100],
        textAlign: 'center',
        lineHeight: 24,
    },

    buttonContainer: {
        marginHorizontal: spacing[6],
        marginTop: spacing[6],
    },
    loadingContainer: {
        marginTop: spacing[4],
        alignItems: 'center',
    },
    loadingText: {
        fontSize: fontSize.sm,
        fontFamily: fontFamily.montserrat.medium,
        color: colors.primary[600],
        marginTop: spacing[2],
    },
    resultContainer: {
        marginHorizontal: spacing[6],
        marginTop: spacing[6],
    },
    resultTitle: {
        fontSize: fontSize['2xl'],
        fontFamily: fontFamily.montserrat.bold,
        color: colors.primary[700],
        textAlign: 'center',
        marginBottom: spacing[4],
    },
    resultCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing[6],
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    stageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[4],
        paddingBottom: spacing[4],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    stageLabel: {
        fontSize: fontSize.base,
        fontFamily: fontFamily.montserrat.medium,
        color: colors.text.primary,
    },
    stageValue: {
        fontSize: fontSize.lg,
        fontFamily: fontFamily.montserrat.bold,
    },
    confidenceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[4],
        paddingBottom: spacing[4],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    confidenceLabel: {
        fontSize: fontSize.base,
        fontFamily: fontFamily.montserrat.medium,
        color: colors.text.primary,
    },
    confidenceValue: {
        fontSize: fontSize.lg,
        fontFamily: fontFamily.montserrat.bold,
        color: colors.primary[600],
    },
    riskContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[4],
        paddingBottom: spacing[4],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    riskLabel: {
        fontSize: fontSize.base,
        fontFamily: fontFamily.montserrat.medium,
        color: colors.text.primary,
    },
    riskValue: {
        fontSize: fontSize.lg,
        fontFamily: fontFamily.montserrat.bold,
    },
    descriptionContainer: {
        marginBottom: spacing[4],
    },
    descriptionLabel: {
        fontSize: fontSize.base,
        fontFamily: fontFamily.montserrat.medium,
        color: colors.text.primary,
        marginBottom: spacing[2],
    },
    descriptionText: {
        fontSize: fontSize.sm,
        fontFamily: fontFamily.montserrat.regular,
        color: colors.text.secondary,
        lineHeight: 20,
    },
    recommendationsContainer: {
        marginTop: spacing[2],
    },
    recommendationsLabel: {
        fontSize: fontSize.base,
        fontFamily: fontFamily.montserrat.medium,
        color: colors.text.primary,
        marginBottom: spacing[3],
    },
    recommendationItem: {
        flexDirection: 'row',
        marginBottom: spacing[2],
        paddingRight: spacing[2],
    },
    recommendationBullet: {
        fontSize: fontSize.base,
        fontFamily: fontFamily.montserrat.medium,
        color: colors.primary[500],
        marginRight: spacing[2],
        marginTop: 1,
    },
    recommendationText: {
        flex: 1,
        fontSize: fontSize.sm,
        fontFamily: fontFamily.montserrat.regular,
        color: colors.text.secondary,
        lineHeight: 18,
    },
    bottomSpacing: {
        height: spacing[8],
    },
});

export default HealthFormScreen;
