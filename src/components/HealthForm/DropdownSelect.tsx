import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { fontSize, fontFamily } from '../../theme/typography';

export interface DropdownOption {
    label: string;
    value: string;
}

interface DropdownSelectProps {
    label: string;
    value: string;
    onSelect: (value: string) => void;
    options: DropdownOption[];
    placeholder?: string;
    required?: boolean;
    error?: string;
}

export const DropdownSelect: React.FC<DropdownSelectProps> = ({
    label,
    value,
    onSelect,
    options,
    placeholder = 'Chọn một tùy chọn',
    required = false,
    error,
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const selectedOption = options.find(option => option.value === value);
    const displayText = selectedOption ? selectedOption.label : placeholder;

    const handleSelect = (optionValue: string) => {
        onSelect(optionValue);
        setIsVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
            </Text>

            <TouchableOpacity
                style={[
                    styles.dropdown,
                    error && styles.dropdownError,
                    value && styles.dropdownFilled,
                ]}
                onPress={() => setIsVisible(true)}
            >
                <Text
                    style={[
                        styles.dropdownText,
                        !value && styles.placeholderText,
                    ]}
                >
                    {displayText}
                </Text>
                <Text style={styles.arrow}>▼</Text>
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Modal
                visible={isVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={() => setIsVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{label}</Text>
                        <FlatList
                            data={options}
                            keyExtractor={item => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.optionItem,
                                        item.value === value && styles.selectedOption,
                                    ]}
                                    onPress={() => handleSelect(item.value)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            item.value === value && styles.selectedOptionText,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing[4],
    },
    label: {
        fontSize: fontSize.sm,
        fontFamily: fontFamily.montserrat.medium,
        color: colors.text.primary,
        marginBottom: spacing[2],
    },
    required: {
        color: colors.error,
        fontSize: fontSize.sm,
    },
    dropdown: {
        borderWidth: 1,
        borderColor: colors.gray[300],
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        backgroundColor: colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownFilled: {
        borderColor: colors.primary[500],
        backgroundColor: colors.primary[50],
    },
    dropdownError: {
        borderColor: colors.error,
        backgroundColor: colors.error + '10',
    },
    dropdownText: {
        fontSize: fontSize.base,
        fontFamily: fontFamily.montserrat.regular,
        color: colors.text.primary,
        flex: 1,
    },
    placeholderText: {
        color: colors.text.disabled,
    },
    arrow: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        marginLeft: spacing[2],
    },
    errorText: {
        fontSize: fontSize.xs,
        fontFamily: fontFamily.montserrat.regular,
        color: colors.error,
        marginTop: spacing[1],
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing[6],
        marginHorizontal: spacing[8],
        maxHeight: '70%',
        minWidth: '80%',
    },
    modalTitle: {
        fontSize: fontSize.lg,
        fontFamily: fontFamily.montserrat.semiBold,
        color: colors.text.primary,
        marginBottom: spacing[4],
        textAlign: 'center',
    },
    optionItem: {
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[4],
        borderRadius: borderRadius.md,
        marginVertical: spacing[1],
    },
    selectedOption: {
        backgroundColor: colors.primary[100],
    },
    optionText: {
        fontSize: fontSize.base,
        fontFamily: fontFamily.montserrat.regular,
        color: colors.text.primary,
    },
    selectedOptionText: {
        color: colors.primary[700],
        fontFamily: fontFamily.montserrat.medium,
    },
});