import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AppointmentStatusProps {
    status: 'upcoming' | 'completed' | 'cancelled';
    label: string;
}

const AppointmentStatus: React.FC<AppointmentStatusProps> = ({ status, label }) => {
    const getStatusStyle = () => {
        switch (status) {
            case 'upcoming':
                return {
                    backgroundColor: '#E3F2FD',
                    color: '#1976D2',
                };
            case 'completed':
                return {
                    backgroundColor: '#E8F5E8',
                    color: '#388E3C',
                };
            case 'cancelled':
                return {
                    backgroundColor: '#FFEBEE',
                    color: '#D32F2F',
                };
            default:
                return {
                    backgroundColor: '#F5F5F5',
                    color: '#666666',
                };
        }
    };

    const statusStyle = getStatusStyle();

    return (
        <View style={[styles.container, { backgroundColor: statusStyle.backgroundColor }]}>
            <Text style={[styles.text, { color: statusStyle.color }]}>
                {label}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    text: {
        fontSize: 12,
        fontWeight: '500',
    },
});

export default AppointmentStatus;