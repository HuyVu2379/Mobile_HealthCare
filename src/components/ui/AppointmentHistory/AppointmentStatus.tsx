import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppointmentStatusEnum, AppointmentStatusLabels } from '../../../types/appointment';

interface AppointmentStatusProps {
    status: AppointmentStatusEnum;
}

const AppointmentStatus: React.FC<AppointmentStatusProps> = ({ status }) => {
    // Debug: In ra giá trị status
    console.log('AppointmentStatus received:', status);

    // Lấy text hiển thị từ Labels
    const getStatusText = () => {
        return AppointmentStatusLabels[status] || String(status);
    };

    const getStatusStyle = () => {
        const statusStr = String(status);

        // So sánh với enum key
        if (statusStr === AppointmentStatusEnum.PENDING) {
            return {
                backgroundColor: '#E3F2FD',
                color: '#1976D2',
            };
        }

        if (statusStr === AppointmentStatusEnum.CONFIRMED) {
            return {
                backgroundColor: '#E8F5E8',
                color: '#388E3C',
            };
        }

        if (statusStr === AppointmentStatusEnum.COMPLETED) {
            return {
                backgroundColor: '#E8F5E8',
                color: '#388E3C',
            };
        }

        if (statusStr === AppointmentStatusEnum.CANCELED) {
            return {
                backgroundColor: '#FFEBEE',
                color: '#D32F2F',
            };
        }

        if (statusStr === AppointmentStatusEnum.REJECTED) {
            return {
                backgroundColor: '#FFEBEE',
                color: '#D32F2F',
            };
        }

        if (statusStr === AppointmentStatusEnum.NO_SHOW) {
            return {
                backgroundColor: '#FFF3E0',
                color: '#F57C00',
            };
        }

        if (statusStr === AppointmentStatusEnum.RESCHEDULED) {
            return {
                backgroundColor: '#F3E5F5',
                color: '#7B1FA2',
            };
        }

        // Default style
        return {
            backgroundColor: '#F5F5F5',
            color: '#666666',
        };
    };

    const statusStyle = getStatusStyle();
    const statusText = getStatusText();

    return (
        <View style={[styles.container, { backgroundColor: statusStyle.backgroundColor }]}>
            <Text style={[styles.text, { color: statusStyle.color }]}>
                {statusText}
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