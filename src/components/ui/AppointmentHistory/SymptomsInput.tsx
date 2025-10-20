import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
} from 'react-native';

interface SymptomsInputProps {
    symptoms: string;
    onSymptomsChange: (text: string) => void;
}

const SymptomsInput: React.FC<SymptomsInputProps> = ({
    symptoms,
    onSymptomsChange,
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Triệu chứng</Text>
            <Text style={styles.subtitle}>
                Mô tả chi tiết các triệu chứng bạn đang gặp phải
            </Text>

            <TextInput
                style={styles.textInput}
                placeholder="Ví dụ: Sốt cao, đau đầu, ho khan..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={symptoms}
                onChangeText={onSymptomsChange}
            />

            <Text style={styles.charCount}>
                {symptoms.length}/500 ký tự
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    textInput: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        minHeight: 120,
        maxHeight: 200,
    },
    charCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 8,
    },
});

export default SymptomsInput;
