import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { fontSize, fontFamily } from '../../theme/typography';

interface SectionProps {
    title: string;
    children: React.ReactNode;
    icon?: string;
}

export const Section: React.FC<SectionProps> = ({
    title,
    children,
    icon,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {icon && <Text style={styles.icon}>{icon}</Text>}
                <Text style={styles.title}>{title}</Text>
            </View>
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing[6],
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        shadowColor: colors.primary[500],
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[5],
        paddingVertical: spacing[4],
        backgroundColor: colors.primary[50],
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        borderBottomWidth: 1,
        borderBottomColor: colors.primary[100],
    },
    icon: {
        fontSize: fontSize.lg,
        marginRight: spacing[2],
    },
    title: {
        fontSize: fontSize.lg,
        fontFamily: fontFamily.montserrat.semiBold,
        color: colors.primary[700],
        flex: 1,
    },
    content: {
        padding: spacing[5],
    },
});