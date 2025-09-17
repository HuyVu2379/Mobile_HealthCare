import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppointmentIcon from './AppointmentIcon';
import AppointmentStatus from './AppointmentStatus';
import AppointmentActions from './AppointmentActions';

interface AppointmentData {
    id: string;
    type: 'in-person' | 'online';
    title: string;
    doctor: string;
    date: string;
    time: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    statusLabel: string;
    actions: Array<{
        type: 'reschedule' | 'cancel' | 'join';
        label: string;
        onPress: () => void;
    }>;
}

interface AppointmentCardProps {
    appointment: AppointmentData;
    isFirst: boolean;
    isLast: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
    appointment,
    isFirst,
    isLast
}) => {
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
                    <AppointmentIcon type={appointment.type} />
                    <View style={styles.headerContent}>
                        <Text style={styles.title}>{appointment.title}</Text>
                        <Text style={styles.doctor}>{appointment.doctor}</Text>
                    </View>
                </View>

                <AppointmentStatus status={appointment.status} label={appointment.statusLabel} />

                <View style={styles.dateTimeContainer}>
                    <View style={styles.dateTime}>
                        <Text style={styles.dateTimeIcon}>📅</Text>
                        <Text style={styles.dateTimeText}>{appointment.date}</Text>
                    </View>
                    <View style={styles.dateTime}>
                        <Text style={styles.dateTimeIcon}>🕘</Text>
                        <Text style={styles.dateTimeText}>{appointment.time}</Text>
                    </View>
                </View>

                <AppointmentActions actions={appointment.actions} />
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
});

export default AppointmentCard;