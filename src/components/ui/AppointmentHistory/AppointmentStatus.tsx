import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppointmentStatusEnum } from '../../../types/appointment';

interface AppointmentStatusProps {
    status: AppointmentStatusEnum;
}

const AppointmentStatus: React.FC<AppointmentStatusProps> = ({ status }) => {
    // Debug: In ra giá trị status
    console.log('AppointmentStatus received:', status);

    // Mapping từ key sang value tiếng Việt
    const getStatusText = () => {
        const statusStr = String(status);

        // Map key từ backend sang value tiếng Việt
        const statusMap: { [key: string]: string } = {
            'PENDING': 'Đang chờ',
            'CONFIRMED': 'Đã xác nhận',
            'CANCELED': 'Đã hủy',
            'REJECTED': 'Đã từ chối',
            'COMPLETED': 'Đã hoàn thành',
            'NO_SHOW': 'Không đến',
            'RESCHEDULED': 'Đã lên lịch lại'
        };

        // Nếu status là key từ backend, trả về value tiếng Việt
        if (statusMap[statusStr]) {
            return statusMap[statusStr];
        }

        // Nếu status đã là value tiếng Việt, trả về luôn
        return statusStr;
    };

    const getStatusStyle = () => {
        const statusStr = String(status);

        // So sánh với cả enum value và string key
        if (statusStr === AppointmentStatusEnum.PENDING || statusStr === 'PENDING') {
            return {
                backgroundColor: '#E3F2FD',
                color: '#1976D2',
            };
        }

        if (statusStr === AppointmentStatusEnum.CONFIRMED || statusStr === 'CONFIRMED') {
            return {
                backgroundColor: '#E8F5E8',
                color: '#388E3C',
            };
        }

        if (statusStr === AppointmentStatusEnum.COMPLETED || statusStr === 'COMPLETED') {
            return {
                backgroundColor: '#E8F5E8',
                color: '#388E3C',
            };
        }

        if (statusStr === AppointmentStatusEnum.CANCELED || statusStr === 'CANCELED') {
            return {
                backgroundColor: '#FFEBEE',
                color: '#D32F2F',
            };
        }

        if (statusStr === AppointmentStatusEnum.REJECTED || statusStr === 'REJECTED') {
            return {
                backgroundColor: '#FFEBEE',
                color: '#D32F2F',
            };
        }

        if (statusStr === AppointmentStatusEnum.NO_SHOW || statusStr === 'NO_SHOW') {
            return {
                backgroundColor: '#FFF3E0',
                color: '#F57C00',
            };
        }

        if (statusStr === AppointmentStatusEnum.RESCHEDULED || statusStr === 'RESCHEDULED') {
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