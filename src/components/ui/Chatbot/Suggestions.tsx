import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { SuggestionItem } from '../types/chat';

interface SuggestionsProps {
    suggestions?: SuggestionItem[];
    onSuggestionPress?: (suggestion: SuggestionItem) => void;
    onScrollBegin?: () => void;
}

const defaultSuggestions: SuggestionItem[] = [
    { id: '1', text: 'Tôi nên ăn gì để tránh suy thận' },
    { id: '2', text: 'Bài tập nào giúp khỏe thận' },
    { id: '3', text: 'Dấu hiệu suy thận' },
    { id: '4', text: 'Cách phòng ngừa bệnh tim mạch' },
    { id: '5', text: 'Chế độ ăn cho người tiểu đường' },
];

const Suggestions: React.FC<SuggestionsProps> = ({
    suggestions = defaultSuggestions,
    onSuggestionPress,
    onScrollBegin
}) => {
    const handlePress = (suggestion: SuggestionItem) => {
        if (onSuggestionPress) {
            onSuggestionPress(suggestion);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                onScrollBeginDrag={onScrollBegin}
            >
                {suggestions.map((suggestion) => (
                    <TouchableOpacity
                        key={suggestion.id}
                        style={styles.chip}
                        onPress={() => handlePress(suggestion)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.chipText}>{suggestion.text}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 10,
        paddingVertical: 4,
    },
    chip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    chipText: {
        color: '#333',
        fontSize: 13,
        fontWeight: '500',
    },
});

export default Suggestions;