import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TextInputProps,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { fontSize, fontFamily } from '../../theme/typography';

interface InputFieldProps extends Omit<TextInputProps, 'style'> {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    unit?: string;
    keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'number-pad';
}

export const InputField: React.FC<InputFieldProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    required = false,
    error,
    unit,
    keyboardType = 'default',
    ...textInputProps
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.labelContainer}>
                <Text style={styles.label}>
                    {label}
                    {required && <Text style={styles.required}> *</Text>}
                </Text>
                {unit && <Text style={styles.unit}>({unit})</Text>}
            </View>

            <TextInput
                style={[
                    styles.input,
                    error && styles.inputError,
                    value && styles.inputFilled,
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.text.disabled}
                keyboardType={keyboardType}
                {...textInputProps}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing[4],
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing[2],
    },
    label: {
        fontSize: fontSize.sm,
        fontFamily: fontFamily.montserrat.medium,
        color: colors.text.primary,
    },
    required: {
        color: colors.error,
        fontSize: fontSize.sm,
    },
    unit: {
        fontSize: fontSize.xs,
        fontFamily: fontFamily.montserrat.regular,
        color: colors.text.secondary,
        marginLeft: spacing[1],
    },
    input: {
        borderWidth: 1,
        borderColor: colors.gray[300],
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        fontSize: fontSize.base,
        fontFamily: fontFamily.montserrat.regular,
        color: colors.text.primary,
        backgroundColor: colors.white,
    },
    inputFilled: {
        borderColor: colors.primary[500],
        backgroundColor: colors.primary[50],
    },
    inputError: {
        borderColor: colors.error,
        backgroundColor: colors.error + '10',
    },
    errorText: {
        fontSize: fontSize.xs,
        fontFamily: fontFamily.montserrat.regular,
        color: colors.error,
        marginTop: spacing[1],
    },
});