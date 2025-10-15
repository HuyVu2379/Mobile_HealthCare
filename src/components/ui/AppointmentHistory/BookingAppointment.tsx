import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ServiceSelector from './ServiceSelector';
import DoctorSelector from './DoctorSelector';
import DateTimeSelector from './DateTimeSelector';
import MethodSelector from './MethodSelector';
import ActionButtons from './ActionButtons';
import { getTimeSlots } from '../../../services/schedule.service';
import {
    SERVICES,
    DOCTORS,
    TIME_SLOTS,
    CONSULTATION_TYPES,
} from '../../../constants/bookingData';
import { AppointmentStatusEnum, ConsultationType, CreateAppointmentRequest, DoctorClientResponse, TimeSlot } from '../../../types/appointment';
import useAppointment from '../../../hooks/useAppointment';

interface BookingAppointmentProps {
    handleBooking: (bookingData: CreateAppointmentRequest) => void;
}

const BookingAppointment: React.FC<BookingAppointmentProps> = ({ handleBooking }) => {
    const [bookingState, setBookingState] = useState<CreateAppointmentRequest>({
        patientId: "",
        scheduleId: "",
        doctorId: "",
        symptoms: "",
        note: "",
        slotId: 0,
        status: AppointmentStatusEnum.PENDING,
        consultationType: ConsultationType.DIRECT_CONSULTATION,
        addressDetail: "",
    });
    const { doctors, loading, error, handleGetDoctorByDateAndTimeSlot } = useAppointment();
    // State phụ để quản lý UI
    const [selectedService, setSelectedService] = useState<typeof SERVICES[0] | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorClientResponse | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<ConsultationType | null>(null);

    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const handleGetTimeSlots = async () => {
        try {
            const response = await getTimeSlots();
            console.log('Available Time Slots:', response.data);
            setTimeSlots(response.data);
        } catch (error) {
            console.error('Error fetching time slots:', error);
        }
    }

    // Chỉ gọi 1 lần khi component mount
    useEffect(() => {
        handleGetTimeSlots();
    }, []); // ✅ Empty dependency array

    const handleServiceSelect = (service: typeof SERVICES[0]) => {
        setSelectedService(service);
        setBookingState(prev => ({
            ...prev,
            note: service.name,
        }));
    };

    const handleDoctorSelect = (doctor: DoctorClientResponse) => {
        setSelectedDoctor(doctor);
        setBookingState(prev => ({
            ...prev,
            doctorId: doctor.doctorId || "",
        }));
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        // Cập nhật scheduleId dựa trên date
        setBookingState(prev => ({
            ...prev,
            scheduleId: date.toISOString().split('T')[0], // hoặc logic khác để lấy scheduleId
        }));
    };

    const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
        setSelectedTimeSlot(timeSlot);
        setBookingState(prev => ({
            ...prev,
            slotId: Number(timeSlot.slotId) || 0,
        }));
    };

    // Gọi API lấy danh sách bác sĩ khi đã chọn cả ngày và timeSlot
    useEffect(() => {
        if (selectedDate && selectedTimeSlot) {
            const dateString = selectedDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            const timeSlotId = selectedTimeSlot.slotId;

            console.log('Fetching doctors for date:', dateString, 'and timeSlot:', timeSlotId);
            handleGetDoctorByDateAndTimeSlot(dateString, timeSlotId);
        }
    }, [selectedDate, selectedTimeSlot]);

    const handleMethodSelect = (method: ConsultationType) => {
        setSelectedMethod(method);
        setBookingState(prev => ({
            ...prev,
            consultationType: method as ConsultationType,
        }));
    };

    const handleCancel = () => {
        Alert.alert(
            'Hủy đặt lịch',
            'Bạn có chắc chắn muốn hủy đặt lịch hẹn?',
            [
                { text: 'Không', style: 'cancel' },
                {
                    text: 'Hủy',
                    style: 'destructive',
                    onPress: () => {
                        // Reset bookingState
                        setBookingState({
                            patientId: "",
                            scheduleId: "",
                            doctorId: "",
                            symptoms: "",
                            note: "",
                            slotId: 0,
                            status: AppointmentStatusEnum.PENDING,
                            consultationType: ConsultationType.DIRECT_CONSULTATION,
                            addressDetail: "",
                        });
                        // Reset UI state
                        setSelectedService(null);
                        setSelectedDoctor(null);
                        setSelectedDate(null);
                        setSelectedTimeSlot(null);
                        setSelectedMethod(null);
                    },
                },
            ]
        );
    };

    const handleConfirm = () => {
        if (isBookingComplete) {
            // Gọi hàm handleBooking được truyền từ props
            handleBooking(bookingState);

            Alert.alert(
                'Đặt lịch thành công',
                `Bạn đã đặt lịch hẹn:\n\nGhi chú: ${bookingState.note}\nBác sĩ ID: ${bookingState.doctorId}`,
                [{ text: 'OK' }]
            );
        }
    };

    const isBookingComplete = Boolean(
        bookingState.patientId &&
        bookingState.scheduleId &&
        bookingState.doctorId &&
        bookingState.slotId &&
        bookingState.consultationType
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Service Selection */}
                <ServiceSelector
                    services={SERVICES}
                    selectedService={selectedService}
                    onServiceSelect={handleServiceSelect}
                />
                {/* Date & Time Selection - Only show if service is selected */}
                {selectedService && (
                    <DateTimeSelector
                        timeSlots={timeSlots}
                        selectedDate={selectedDate}
                        selectedTimeSlot={selectedTimeSlot}
                        onDateSelect={handleDateSelect}
                        onTimeSlotSelect={handleTimeSlotSelect}
                    />
                )}
                {/* Doctor Selection - Only show if date and time are selected */}
                {selectedDate && selectedTimeSlot && (
                    <DoctorSelector
                        doctors={doctors}
                        selectedDoctor={selectedDoctor}
                        onDoctorSelect={handleDoctorSelect}
                    />
                )}



                {/* Method Selection - Only show if doctor is selected */}
                {selectedDoctor && (
                    <MethodSelector
                        methods={CONSULTATION_TYPES}
                        selectedMethod={selectedMethod}
                        onMethodSelect={handleMethodSelect}
                    />
                )}

                {/* Action Buttons */}
                <ActionButtons
                    onCancel={handleCancel}
                    onConfirm={handleConfirm}
                    isConfirmEnabled={isBookingComplete}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
});

export default BookingAppointment;