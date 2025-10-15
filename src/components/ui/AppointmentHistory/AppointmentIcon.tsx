import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ConsultationType } from '../../../types/appointment';

interface AppointmentIconProps {
    type: ConsultationType;
}

const AppointmentIcon: React.FC<AppointmentIconProps> = ({ type }) => {
    // Debug: In ra giá trị để kiểm tra
    console.log('Consultation Type received:', type);

    const getIconProps = () => {
        // So sánh với cả enum value và string key từ backend
        const typeStr = String(type);

        if (typeStr === ConsultationType.DIRECT_CONSULTATION || typeStr === 'DIRECT_CONSULTATION') {
            return {
                icon: '📍',
                color: '#4CAF50', // Xanh lá
                backgroundColor: '#E8F5E8'
            };
        }

        if (typeStr === ConsultationType.LAB_TEST || typeStr === 'LAB_TEST') {
            return {
                icon: '🧪',
                color: '#FF9800', // Cam
                backgroundColor: '#FFF3E0'
            };
        }

        if (typeStr === ConsultationType.FOLLOW_UP || typeStr === 'FOLLOW_UP') {
            return {
                icon: '🔄',
                color: '#9C27B0', // Tím
                backgroundColor: '#F3E5F5'
            };
        }

        if (typeStr === ConsultationType.ONLINE_CONSULTATION || typeStr === 'ONLINE_CONSULTATION') {
            return {
                icon: '📹',
                color: '#2196F3', // Xanh dương
                backgroundColor: '#E3F2FD'
            };
        }

        // Default case
        console.log('Using default icon for type:', typeStr);
        return {
            icon: '📋',
            color: '#757575', // Xám
            backgroundColor: '#F5F5F5'
        };
    };

    const iconProps = getIconProps();

    return (
        <View style={[styles.container, { backgroundColor: iconProps.backgroundColor }]}>
            <Text style={styles.icon}>
                {iconProps.icon}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 18,
    },
});

export default AppointmentIcon;