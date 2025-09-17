import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface AppointmentActionsProps {
    actions: Array<{
        type: 'reschedule' | 'cancel' | 'join';
        label: string;
        onPress: () => void;
    }>;
}

const AppointmentActions: React.FC<AppointmentActionsProps> = ({ actions }) => {
    const getButtonStyle = (type: string) => {
        switch (type) {
            case 'reschedule':
                return {
                    backgroundColor: 'transparent',
                    borderColor: '#E0E0E0',
                    borderWidth: 1,
                    textColor: '#666666',
                };
            case 'cancel':
                return {
                    backgroundColor: '#FFEBEE',
                    borderColor: 'transparent',
                    borderWidth: 0,
                    textColor: '#D32F2F',
                };
            case 'join':
                return {
                    backgroundColor: '#2196F3',
                    borderColor: 'transparent',
                    borderWidth: 0,
                    textColor: '#FFFFFF',
                };
            default:
                return {
                    backgroundColor: 'transparent',
                    borderColor: '#E0E0E0',
                    borderWidth: 1,
                    textColor: '#666666',
                };
        }
    };

    return (
        <View style={styles.container}>
            {actions.map((action, index) => {
                const buttonStyle = getButtonStyle(action.type);

                return (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.button,
                            {
                                backgroundColor: buttonStyle.backgroundColor,
                                borderColor: buttonStyle.borderColor,
                                borderWidth: buttonStyle.borderWidth,
                                marginRight: index < actions.length - 1 ? 8 : 0,
                            }
                        ]}
                        onPress={action.onPress}
                    >
                        <Text style={[styles.buttonText, { color: buttonStyle.textColor }]}>
                            {action.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginTop: 12,
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '500',
    },
});

export default AppointmentActions;