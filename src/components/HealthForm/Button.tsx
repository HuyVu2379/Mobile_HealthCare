import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    TouchableOpacityProps,
    ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { fontSize, fontFamily } from '../../theme/typography';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    variant = 'primary',
    size = 'medium',
    loading = false,
    fullWidth = false,
    disabled,
    ...touchableProps
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                styles[variant],
                styles[size],
                fullWidth && styles.fullWidth,
                (disabled || loading) && styles.disabled,
            ]}
            disabled={disabled || loading}
            {...touchableProps}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' ? colors.primary[500] : colors.white}
                    size="small"
                />
            ) : (
                <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.xl,
        flexDirection: 'row',
    },

    // Variants
    primary: {
        backgroundColor: colors.primary[500],
        shadowColor: colors.primary[500],
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    secondary: {
        backgroundColor: colors.secondary[500],
        shadowColor: colors.secondary[500],
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary[500],
    },

    // Sizes
    small: {
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        minHeight: 36,
    },
    medium: {
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        minHeight: 44,
    },
    large: {
        paddingHorizontal: spacing[6],
        paddingVertical: spacing[4],
        minHeight: 52,
    },

    // Full width
    fullWidth: {
        width: '100%',
    },

    // Disabled state
    disabled: {
        opacity: 0.6,
    },

    // Text styles
    text: {
        fontFamily: fontFamily.montserrat.semiBold,
        textAlign: 'center',
    },
    primaryText: {
        color: colors.white,
    },
    secondaryText: {
        color: colors.white,
    },
    outlineText: {
        color: colors.primary[500],
    },
    smallText: {
        fontSize: fontSize.sm,
    },
    mediumText: {
        fontSize: fontSize.base,
    },
    largeText: {
        fontSize: fontSize.lg,
    },
});