import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppointmentIcon from './AppointmentIcon';
import AppointmentStatus from './AppointmentStatus';
import AppointmentActions from './AppointmentActions';
import { Appointment, AppointmentStatusEnum, ConsultationType, ConsultationTypeLabels, AppointmentStatusLabels, Room, RoomStatus, EventSocketAppointment, AppointmentAction } from '../../../types/appointment';
import { useAppointmentContext } from '../../../contexts/AppointmentContext';

interface AppointmentCardProps {
    appointment: Appointment;
    isFirst: boolean;
    isLast: boolean;
    rooms: Room[];
    userRole?: string; // Thêm prop để xác định role của user
    onReschedule?: (appointment: Appointment) => void; // Callback để xử lý đổi lịch
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
    appointment,
    isFirst,
    isLast,
    rooms,
    userRole,
    onReschedule
}) => {
    const navigation = useNavigation();
    const { handleSendSocketEventAppointment } = useAppointmentContext();

    // Debug: In ra giá trị để kiểm tra
    console.log('Appointment data:', {
        consultationType: appointment.consultationType,
        status: appointment.status,
        addressDetail: appointment.addressDetail,
        userRole
    });

    // Tìm room tương ứng với appointmentId
    const correspondingRoom = rooms.find(room => room.appointmentId === appointment.appointmentId);
    const isRoomActive = correspondingRoom?.status === RoomStatus.ACTIVE;

    console.log('Room check:', {
        appointmentId: appointment.appointmentId,
        room: correspondingRoom,
        isRoomActive
    });

    // Handler để hủy lịch hẹn
    const handleCancelAppointment = () => {
        Alert.alert(
            'Xác nhận hủy lịch',
            'Bạn có chắc chắn muốn hủy lịch hẹn này không?',
            [
                {
                    text: 'Không',
                    style: 'cancel'
                },
                {
                    text: 'Có',
                    onPress: () => {
                        const eventData: EventSocketAppointment = {
                            appointmentId: appointment.appointmentId,
                            patientId: appointment.patient.userId,
                            doctorId: null,
                            event: 'CANCEL_APPOINTMENT' as any,
                            status: null,
                            createAppointmentRequest: null,
                            updateAppointmentRequest: null,
                        };

                        console.log('🚫 Canceling appointment:', eventData);
                        handleSendSocketEventAppointment(eventData);
                    }
                }
            ]
        );
    };

    // Kiểm tra xem appointmentDate có trước ngày hiện tại không
    const isPastAppointment = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day

        let appointmentDateObj: Date;

        // Kiểm tra format của appointmentDate
        if (appointment.appointmentDate.includes('-')) {
            // Format: yyyy-MM-dd hoặc yyyy-M-d
            const dateParts = appointment.appointmentDate.split('-');
            if (dateParts.length === 3) {
                appointmentDateObj = new Date(
                    parseInt(dateParts[0]), // year
                    parseInt(dateParts[1]) - 1, // month (0-indexed)
                    parseInt(dateParts[2]) // day
                );
            } else {
                return false;
            }
        } else if (appointment.appointmentDate.includes('/')) {
            // Format: dd/MM/yyyy hoặc d/M/yyyy
            const dateParts = appointment.appointmentDate.split('/');
            if (dateParts.length === 3) {
                appointmentDateObj = new Date(
                    parseInt(dateParts[2]), // year
                    parseInt(dateParts[1]) - 1, // month (0-indexed)
                    parseInt(dateParts[0]) // day
                );
            } else {
                return false;
            }
        } else {
            return false;
        }

        appointmentDateObj.setHours(0, 0, 0, 0);

        console.log('📅 Date comparison:', {
            appointmentDate: appointment.appointmentDate,
            appointmentDateObj: appointmentDateObj.toISOString(),
            today: today.toISOString(),
            isPast: appointmentDateObj < today
        });

        return appointmentDateObj < today;
    };

    // So sánh với cả enum value và string key từ backend
    const consultationTypeStr = String(appointment.consultationType);
    const statusStr = String(appointment.status);

    // Kiểm tra nếu là lịch hẹn đã hủy hoặc là lịch hẹn trong quá khứ
    const isCanceled = statusStr === AppointmentStatusEnum.CANCELED || statusStr === 'CANCELED';
    const isPast = isPastAppointment();
    const shouldHideActions = isCanceled || isPast;

    // Handler để đổi lịch
    const handleRescheduleAppointment = () => {
        if (onReschedule) {
            onReschedule(appointment);
        } else {
            console.log('⚠️ onReschedule callback not provided');
        }
    };

    const actions: Array<{
        type: 'reschedule' | 'cancel' | 'join';
        label: string;
        onPress: () => void;
        disabled?: boolean;
    }> = shouldHideActions ? [] : [{
        type: 'reschedule',
        label: 'Đổi lịch',
        onPress: handleRescheduleAppointment,
    },
    {
        type: 'cancel',
        label: 'Hủy lịch',
        onPress: handleCancelAppointment,
    }];

    // Handler để tham gia video call
    const handleJoinVideoCall = () => {
        const roomId = correspondingRoom?.room_id || `appointment-${appointment.appointmentId}`;

        console.log('🎥 Joining video call:', {
            appointmentId: appointment.appointmentId,
            roomId,
            userRole
        });

        // Navigate to VideoCallScreen với mode join và roomId
        (navigation.navigate as any)('VideoCall', {
            mode: 'join',
            roomId: roomId,
            appointmentId: appointment.appointmentId,
            doctorName: appointment.doctor.fullName,
        });
    };

    // Chỉ thêm nút join nếu không bị ẩn actions và đáp ứng điều kiện
    if (!shouldHideActions &&
        (consultationTypeStr === ConsultationType.ONLINE_CONSULTATION || consultationTypeStr === 'ONLINE_CONSULTATION') &&
        (statusStr === AppointmentStatusEnum.CONFIRMED || statusStr === 'CONFIRMED')) {

        // Chỉ hiển thị nút join cho bệnh nhân
        const isPatient = userRole === 'PATIENT' || userRole === 'patient';

        if (isPatient) {
            actions.unshift({
                type: 'join',
                label: 'Tham gia cuộc hẹn',
                onPress: handleJoinVideoCall,
                disabled: !isRoomActive, // Disable nếu room không phải ACTIVE
            });
        }
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

                {actions.length > 0 && <AppointmentActions actions={actions} />}
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