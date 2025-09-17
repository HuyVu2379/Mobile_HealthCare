import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AppointmentIconProps {
    type: 'in-person' | 'online';
}

const AppointmentIcon: React.FC<AppointmentIconProps> = ({ type }) => {
    const getIconProps = () => {
        if (type === 'in-person') {
            return {
                icon: '📍',
                color: '#4CAF50', // Xanh lá
                backgroundColor: '#E8F5E8'
            };
        } else {
            return {
                icon: '📹',
                color: '#2196F3', // Xanh dương
                backgroundColor: '#E3F2FD'
            };
        }
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