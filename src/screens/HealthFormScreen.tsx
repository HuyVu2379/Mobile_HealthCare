import React, { useState } from 'react';
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    Alert,
} from 'react-native';
import { InputField, DropdownSelect, Section, Button } from '../components/ui/HealthForm';
import { HealthFormData, initialHealthFormData } from '../types/healthForm';
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

const HealthFormScreen: React.FC = () => {
    const [formData, setFormData] = useState<HealthFormData>(initialHealthFormData);
    const [errors, setErrors] = useState<Partial<HealthFormData>>({});

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
            'creatinine',
            'egfr',
            'bun',
            'bloodPressureSystolic',
            'bloodPressureDiastolic',
        ];

        requiredFields.forEach(field => {
            if (!formData[field].trim()) {
                newErrors[field] = 'Trường này là bắt buộc';
            }
        });

        // Validate numeric fields
        const numericFields = ['creatinine', 'egfr', 'bun', 'serumCalcium', 'c3', 'c4', 'oxalateLevels', 'urinePH', 'bloodPressureSystolic', 'bloodPressureDiastolic', 'waterIntake'];

        numericFields.forEach(field => {
            const value = formData[field as keyof HealthFormData];
            if (value && isNaN(Number(value))) {
                newErrors[field as keyof HealthFormData] = 'Vui lòng nhập số hợp lệ';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            console.log('Form Data:', formData);
            Alert.alert(
                'Thành công',
                'Dữ liệu đã được gửi thành công! Kiểm tra console để xem chi tiết.',
                [{ text: 'OK' }]
            );
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
                    label="Nồng độ Creatinine"
                    value={formData.creatinine}
                    onChangeText={value => updateField('creatinine', value)}
                    placeholder="Nhập giá trị"
                    unit="mg/dL"
                    keyboardType="decimal-pad"
                    required
                    error={errors.creatinine}
                />

                <InputField
                    label="eGFR"
                    value={formData.egfr}
                    onChangeText={value => updateField('egfr', value)}
                    placeholder="Nhập giá trị"
                    unit="mL/min/1.73m²"
                    keyboardType="decimal-pad"
                    required
                    error={errors.egfr}
                />

                <InputField
                    label="BUN"
                    value={formData.bun}
                    onChangeText={value => updateField('bun', value)}
                    placeholder="Nhập giá trị"
                    unit="mg/dL"
                    keyboardType="decimal-pad"
                    required
                    error={errors.bun}
                />

                <InputField
                    label="Serum Calcium"
                    value={formData.serumCalcium}
                    onChangeText={value => updateField('serumCalcium', value)}
                    placeholder="Nhập giá trị"
                    unit="mg/dL"
                    keyboardType="decimal-pad"
                    error={errors.serumCalcium}
                />

                <DropdownSelect
                    label="ANA"
                    value={formData.ana}
                    onSelect={value => updateField('ana', value)}
                    options={ANA_OPTIONS}
                    placeholder="Chọn kết quả"
                    error={errors.ana}
                />

                <InputField
                    label="C3"
                    value={formData.c3}
                    onChangeText={value => updateField('c3', value)}
                    placeholder="Nhập giá trị"
                    unit="mg/dL"
                    keyboardType="decimal-pad"
                    error={errors.c3}
                />

                <InputField
                    label="C4"
                    value={formData.c4}
                    onChangeText={value => updateField('c4', value)}
                    placeholder="Nhập giá trị"
                    unit="mg/dL"
                    keyboardType="decimal-pad"
                    error={errors.c4}
                />
            </Section>

            <Section title="Xét Nghiệm Nước Tiểu" icon="🔬">
                <DropdownSelect
                    label="Hematuria"
                    value={formData.hematuria}
                    onSelect={value => updateField('hematuria', value)}
                    options={HEMATURIA_OPTIONS}
                    placeholder="Chọn mức độ"
                    error={errors.hematuria}
                />

                <InputField
                    label="Oxalate Levels"
                    value={formData.oxalateLevels}
                    onChangeText={value => updateField('oxalateLevels', value)}
                    placeholder="Nhập giá trị"
                    unit="mg/24h"
                    keyboardType="decimal-pad"
                    error={errors.oxalateLevels}
                />

                <InputField
                    label="Urine pH"
                    value={formData.urinePH}
                    onChangeText={value => updateField('urinePH', value)}
                    placeholder="Nhập giá trị"
                    keyboardType="decimal-pad"
                    error={errors.urinePH}
                />
            </Section>

            <Section title="Chỉ Số Sinh Hiệu" icon="❤️">
                <View style={styles.row}>
                    <View style={styles.halfWidth}>
                        <InputField
                            label="Huyết Áp Tâm Thu"
                            value={formData.bloodPressureSystolic}
                            onChangeText={value => updateField('bloodPressureSystolic', value)}
                            placeholder="120"
                            unit="mmHg"
                            keyboardType="number-pad"
                            required
                            error={errors.bloodPressureSystolic}
                        />
                    </View>
                    <View style={styles.halfWidth}>
                        <InputField
                            label="Huyết Áp Tâm Trương"
                            value={formData.bloodPressureDiastolic}
                            onChangeText={value => updateField('bloodPressureDiastolic', value)}
                            placeholder="80"
                            unit="mmHg"
                            keyboardType="number-pad"
                            required
                            error={errors.bloodPressureDiastolic}
                        />
                    </View>
                </View>

                <InputField
                    label="Lượng Nước Uống Hàng Ngày"
                    value={formData.waterIntake}
                    onChangeText={value => updateField('waterIntake', value)}
                    placeholder="Nhập số lít"
                    unit="lít/ngày"
                    keyboardType="decimal-pad"
                    error={errors.waterIntake}
                />
            </Section>

            <Section title="Thói Quen Sống" icon="🏃">
                <DropdownSelect
                    label="Hoạt Động Thể Chất"
                    value={formData.physicalActivity}
                    onSelect={value => updateField('physicalActivity', value)}
                    options={PHYSICAL_ACTIVITY_OPTIONS}
                    placeholder="Chọn tần suất"
                    error={errors.physicalActivity}
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
                    value={formData.painkillerUsage}
                    onSelect={value => updateField('painkillerUsage', value)}
                    options={YES_NO_OPTIONS}
                    placeholder="Chọn"
                    error={errors.painkillerUsage}
                />
            </Section>

            <Section title="Tiền Sử & Tình Trạng" icon="📋">
                <DropdownSelect
                    label="Tiền Sử Gia Đình"
                    value={formData.familyHistory}
                    onSelect={value => updateField('familyHistory', value)}
                    options={YES_NO_OPTIONS}
                    placeholder="Có tiền sử bệnh thận trong gia đình?"
                    error={errors.familyHistory}
                />

                <DropdownSelect
                    label="Thay Đổi Cân Nặng"
                    value={formData.weightChanges}
                    onSelect={value => updateField('weightChanges', value)}
                    options={WEIGHT_CHANGES_OPTIONS}
                    placeholder="Chọn tình trạng"
                    error={errors.weightChanges}
                />

                <DropdownSelect
                    label="Mức Độ Căng Thẳng"
                    value={formData.stressLevel}
                    onSelect={value => updateField('stressLevel', value)}
                    options={STRESS_LEVEL_OPTIONS}
                    placeholder="Chọn mức độ"
                    error={errors.stressLevel}
                />
            </Section>

            <View style={styles.buttonContainer}>
                <Button
                    title="Gửi Dữ Liệu Chẩn Đoán"
                    onPress={handleSubmit}
                    size="large"
                    fullWidth
                />
            </View>

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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        flex: 0.48,
    },
    buttonContainer: {
        marginHorizontal: spacing[6],
        marginTop: spacing[6],
    },
    bottomSpacing: {
        height: spacing[8],
    },
});

export default HealthFormScreen;
