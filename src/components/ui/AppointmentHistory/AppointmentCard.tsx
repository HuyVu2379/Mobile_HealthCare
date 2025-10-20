import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppointmentIcon from './AppointmentIcon';
import AppointmentStatus from './AppointmentStatus';
import AppointmentActions from './AppointmentActions';
import { Appointment, AppointmentStatusEnum, ConsultationType, ConsultationTypeLabels, AppointmentStatusLabels } from '../../../types/appointment';

interface AppointmentCardProps {
    appointment: Appointment;
    isFirst: boolean;
    isLast: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
    appointment,
    isFirst,
    isLast
}) => {
    // Debug: In ra giá trị để kiểm tra
    console.log('Appointment data:', {
        consultationType: appointment.consultationType,
        status: appointment.status,
        addressDetail: appointment.addressDetail
    });

    const actions: Array<{
        type: 'reschedule' | 'cancel' | 'join';
        label: string;
        onPress: () => void;
    }> = [{
        type: 'reschedule',
        label: 'Đổi lịch',
        onPress: () => console.log('Reschedule Appointment Pressed'),
    },
    {
        type: 'cancel',
        label: 'Hủy lịch',
        onPress: () => console.log('Cancel Appointment Pressed'),
    }];

    // So sánh với cả enum value và string key từ backend
    const consultationTypeStr = String(appointment.consultationType);
    const statusStr = String(appointment.status);

    if ((consultationTypeStr === ConsultationType.ONLINE_CONSULTATION || consultationTypeStr === 'ONLINE_CONSULTATION') &&
        (statusStr === AppointmentStatusEnum.CONFIRMED || statusStr === 'CONFIRMED')) {
        actions.unshift({
            type: 'join',
            label: 'Tham gia cuộc hẹn',
            onPress: () => console.log('Join Appointment Pressed'),
        });
    }

    return (
        <View style={styles.container}>
            {/* Timeline */}
            <View style={styles.timeline}>
                {!isFirst && <View style={styles.timelineTop} />}
                <View style={styles.timelineDot} />
                {!isLast && <View style={styles.timelineBottom} />}
            </View>

            {/* Card Content */}
            <View style={styles.card}>
                <View style={styles.header}>
                    <AppointmentIcon type={appointment.consultationType} />
                    <View style={styles.headerContent}>
                        <Text style={styles.title}>{appointment.note}</Text>
                        <Text style={styles.doctor}>Bs. {appointment.doctor.fullName}</Text>
                    </View>
                </View>

                <AppointmentStatus status={appointment.status} />

                <View style={styles.dateTimeContainer}>
                    <View style={styles.dateTime}>
                        <Text style={styles.dateTimeIcon}>📅</Text>
                        <Text style={styles.dateTimeText}>{appointment.appointmentDate}</Text>
                    </View>
                    <View style={styles.dateTime}>
                        <Text style={styles.dateTimeIcon}>🕘</Text>
                        <Text style={styles.dateTimeText}>{appointment.timeSlot.startTime} - {appointment.timeSlot.endTime}</Text>
                    </View>
                </View>

                {(consultationTypeStr === ConsultationType.DIRECT_CONSULTATION || consultationTypeStr === 'DIRECT_CONSULTATION') && appointment.addressDetail && (
                    <View style={styles.addressContainer}>
                        <Text style={styles.addressIcon}>📍</Text>
                        <Text style={styles.addressText}>{appointment.addressDetail}</Text>
                    </View>
                )}

                <AppointmentActions actions={actions} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    timeline: {
        width: 20,
        alignItems: 'center',
        marginRight: 12,
    },
    timelineTop: {
        width: 2,
        height: 20,
        backgroundColor: '#E0E0E0',
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#2196F3',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    timelineBottom: {
        width: 2,
        flex: 1,
        backgroundColor: '#E0E0E0',
        minHeight: 40,
    },
    card: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerContent: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 4,
    },
    doctor: {
        fontSize: 14,
        color: '#666666',
    },
    dateTimeContainer: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    dateTime: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    dateTimeIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    dateTimeText: {
        fontSize: 14,
        color: '#666666',
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
    },
    addressIcon: {
        fontSize: 16,
        marginRight: 8,
        marginTop: 2,
    },
    addressText: {
        flex: 1,
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
    },
});

export default AppointmentCard;