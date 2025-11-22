import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../../theme/colors';

type FilterType = 'ALL' | 'BLOG' | 'NEW';

interface CategoryFilterChipsProps {
    selectedFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

const CategoryFilterChips: React.FC<CategoryFilterChipsProps> = ({
    selectedFilter,
    onFilterChange
}) => {
    const filters: { label: string; value: FilterType }[] = [
        { label: 'Tất cả', value: 'ALL' },
        { label: 'BLOG', value: 'BLOG' },
        { label: 'TIN TỨC', value: 'NEW' },
    ];

    const isSelected = (filter: FilterType) => selectedFilter === filter;

    const getChipStyle = (filter: FilterType) => {
        if (isSelected(filter)) {
            return [styles.chip, styles.chipSelected];
        }
        return styles.chip;
    };

    const getTextStyle = (filter: FilterType) => {
        if (isSelected(filter)) {
            return [styles.chipText, styles.chipTextSelected];
        }
        return styles.chipText;
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
                {filters.map((filter) => (
                    <TouchableOpacity
                        key={filter.value}
                        style={getChipStyle(filter.value)}
                        onPress={() => onFilterChange(filter.value)}
                        activeOpacity={0.7}
                    >
                        <Text style={getTextStyle(filter.value)}>
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    scrollContainer: {
        paddingHorizontal: 16,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.gray[100],
        borderWidth: 1,
        borderColor: colors.gray[300],
    },
    chipSelected: {
        backgroundColor: colors.primary[600],
        borderColor: colors.primary[600],
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.gray[700],
    },
    chipTextSelected: {
        color: colors.white,
        fontWeight: '600',
    },
});

export default CategoryFilterChips;
