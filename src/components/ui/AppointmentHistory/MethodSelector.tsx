import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { ConsultationType, ConsultationTypeLabels } from '../../../types/appointment';
import { CONSULTATION_TYPE_ICONS } from '../../../constants/bookingData';

interface MethodSelectorProps {
    methods: ConsultationType[];
    selectedMethod: ConsultationType | null;
    onMethodSelect: (method: ConsultationType) => void;
}

const MethodSelector: React.FC<MethodSelectorProps> = ({
    methods,
    selectedMethod,
    onMethodSelect,
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Hình thức khám</Text>
            <View style={styles.methodsContainer}>
                {methods.map((method) => {
                    const isSelected = selectedMethod === method;
                    const iconName = CONSULTATION_TYPE_ICONS[method];

                    // Debug log để kiểm tra
                    console.log('Method:', method, 'Icon:', iconName);

                    return (
                        <TouchableOpacity
                            key={method}
                            style={[styles.methodCard, isSelected && styles.selectedCard]}
                            onPress={() => onMethodSelect(method)}
                        >
                            <View style={[styles.iconContainer, isSelected && styles.selectedIconContainer]}>
                                <Icon
                                    name={iconName || 'help-circle'}
                                    size={24}
                                    color={isSelected ? '#fff' : '#4285F4'}
                                />
                            </View>
                            <Text style={[styles.methodName, isSelected && styles.selectedText]}>
                                {ConsultationTypeLabels[method]}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    methodsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    methodCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    selectedCard: {
        borderColor: '#4285F4',
        backgroundColor: '#f0f7ff',
        borderWidth: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f0f7ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    selectedIconContainer: {
        backgroundColor: '#4285F4',
    },
    methodName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    selectedText: {
        color: '#4285F4',
    },
});

export default MethodSelector;