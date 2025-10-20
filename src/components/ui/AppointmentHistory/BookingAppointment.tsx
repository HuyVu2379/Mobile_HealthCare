import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import ServiceSelector from './ServiceSelector';
import DoctorSelector from './DoctorSelector';
import DateTimeSelector from './DateTimeSelector';
import MethodSelector from './MethodSelector';
import SymptomsInput from './SymptomsInput';
import ActionButtons from './ActionButtons';
import { getTimeSlots } from '../../../services/schedule.service';
import {
    SERVICES,
    DOCTORS,
    TIME_SLOTS,
    CONSULTATION_TYPES,
} from '../../../constants/bookingData';
import { AppointmentStatusEnum, ConsultationType, CreateAppointmentRequest, DoctorClientResponse, TimeSlot } from '../../../types/appointment';
import { useAppointmentContext } from '../../../contexts';

interface BookingAppointmentProps {
    handleBooking: (bookingData: CreateAppointmentRequest) => void;
    onClose?: () => void; // Callback để đóng modal
}
const BookingAppointment: React.FC<BookingAppointmentProps> = ({ handleBooking, onClose }) => {
    // Lấy thông tin người dùng từ Redux store
    const { user } = useSelector((state: RootState) => state.user);

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
    // Use AppointmentContext instead of hook
    const { doctors, loading, error, handleGetDoctorByDateAndTimeSlot } = useAppointmentContext();

    // State phụ để quản lý UI
    const [selectedService, setSelectedService] = useState<typeof SERVICES[0] | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorClientResponse | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<ConsultationType | null>(null);

    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

    // Tự động gán patientId khi có thông tin user
    useEffect(() => {
        if (user?.userId) {
            setBookingState(prev => ({
                ...prev,
                patientId: user.userId || "",
            }));
        }
    }, [user]);

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
            scheduleId: doctor.scheduleId || "",
        }));
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
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

    const handleSymptomsChange = (text: string) => {
        // Giới hạn 500 ký tự
        if (text.length <= 500) {
            setBookingState(prev => ({
                ...prev,
                symptoms: text,
            }));
        }
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
                        resetBookingState();
                        onClose?.(); // Đóng modal
                    },
                },
            ]
        );
    };

    const resetBookingState = () => {
        // Reset bookingState
        setBookingState({
            patientId: user?.userId || "",
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
    };

    const handleConfirm = () => {
        if (isBookingComplete) {
            // Debug: In ra bookingState trước khi gửi
            console.log('📤 Sending booking data:', JSON.stringify(bookingState, null, 2));
            // Gọi hàm handleBooking được truyền từ props
            handleBooking(bookingState);
            // Reset state và đóng modal
            resetBookingState();
            onClose?.(); // Đóng modal
        }
    };

    const isBookingComplete = Boolean(
        bookingState.patientId &&
        bookingState.scheduleId &&
        bookingState.doctorId &&
        bookingState.slotId &&
        bookingState.consultationType &&
        bookingState.symptoms.trim() // Yêu cầu nhập triệu chứng
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

                {/* Symptoms Input - Only show if method is selected */}
                {selectedMethod && (
                    <SymptomsInput
                        symptoms={bookingState.symptoms}
                        onSymptomsChange={handleSymptomsChange}
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