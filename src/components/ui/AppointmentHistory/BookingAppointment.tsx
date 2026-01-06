import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    ScrollView,
    StyleSheet,
    Alert,
    View,
    Text,
    Image,
    TouchableOpacity,
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
import { getTimeSlots, getDoctorScheduleByDoctorIdAndDate } from '../../../services/schedule.service';
import {
    SERVICES,
    DOCTORS,
    TIME_SLOTS,
    CONSULTATION_TYPES,
} from '../../../constants/bookingData';
import { AppointmentStatusEnum, ConsultationType, CreateAppointmentRequest, DoctorClientResponse, TimeSlot, Appointment, Doctor } from '../../../types/appointment';
import { useAppointmentContext } from '../../../contexts';

interface BookingAppointmentProps {
    handleBooking: (bookingData: CreateAppointmentRequest, selectedDoctor: Doctor | null) => void;
    onClose?: () => void; // Callback để đóng modal
    initialData?: Appointment | null; // Dữ liệu ban đầu khi đổi lịch
    isReschedule?: boolean; // Flag để biết đây là đổi lịch hay đặt lịch mới
}
const BookingAppointment: React.FC<BookingAppointmentProps> = ({ handleBooking, onClose, initialData, isReschedule = false }) => {
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
        hasPredict: false,
        paymentMethod: "CASH",
    });
    // Use AppointmentContext instead of hook
    const { doctors, loading, error, handleGetDoctorByDateAndTimeSlot } = useAppointmentContext();

    // State phụ để quản lý UI
    const [selectedService, setSelectedService] = useState<typeof SERVICES[0] | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<ConsultationType | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"CASH" | "BANK">("CASH");

    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [availableSlotIds, setAvailableSlotIds] = useState<number[]>([]); // Danh sách slot ID khả dụng cho bác sĩ khi đổi lịch

    // Tự động gán patientId khi có thông tin user
    useEffect(() => {
        if (user?.userId) {
            setBookingState(prev => ({
                ...prev,
                patientId: user.userId || "",
            }));
        }
    }, [user]);

    // Khởi tạo dữ liệu khi là chế độ đổi lịch
    useEffect(() => {
        if (isReschedule && initialData) {
            // Tìm service tương ứng với note
            const matchedService = SERVICES.find(s => s.name === initialData.note);
            if (matchedService) {
                setSelectedService(matchedService);
            }

            // Set method (consultationType)
            setSelectedMethod(initialData.consultationType);

            // Set doctor info và tự động chọn bác sĩ cũ
            const doctorData: Doctor = {
                doctorId: String(initialData.doctor.doctorId),
                email: String(initialData.doctor.email),
                fullName: String(initialData.doctor.fullName),
                phoneNumber: String(initialData.doctor.phoneNumber),
                specialty: String(initialData.doctor.specialty || ''),
                avatarUrl: String(initialData.doctor.avatarUrl),
                clinicAddress: String(initialData.doctor.clinicAddress),
                experienceYears: Number(initialData.doctor.experienceYears),
                examinationFee: Number(initialData.doctor.examinationFee),
                rating: Number(initialData.doctor.rating),
                bio: String(initialData.doctor.bio),
                scheduleId: "",
            };
            setSelectedDoctor(doctorData);

            // Set symptoms và doctor info vào bookingState
            setBookingState(prev => ({
                ...prev,
                symptoms: String(initialData.symptoms),
                consultationType: initialData.consultationType,
                note: String(initialData.note),
                addressDetail: String(initialData.addressDetail || ""),
                doctorId: String(initialData.doctor.doctorId),
            }));
        }
    }, [isReschedule, initialData]);

    const handleGetTimeSlots = useCallback(async () => {
        try {
            const response = await getTimeSlots();
            setTimeSlots(response.data);
        } catch (error) {
            console.error('Error fetching time slots:', error);
        }
    }, []);

    // Chỉ gọi 1 lần khi component mount
    useEffect(() => {
        handleGetTimeSlots();
    }, [handleGetTimeSlots]);

    const handleServiceSelect = useCallback((service: typeof SERVICES[0]) => {
        setSelectedService(service);
        setBookingState(prev => ({
            ...prev,
            note: service.name,
        }));
    }, []);

    const handleDoctorSelect = useCallback((doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setBookingState(prev => ({
            ...prev,
            doctorId: String(doctor.doctorId) || "",
            scheduleId: String(doctor.scheduleId) || "",
        }));
    }, []);

    const handleDateSelect = useCallback((date: Date) => {
        setSelectedDate(date);
    }, []);

    // Gọi API lấy lịch bác sĩ khi chọn ngày trong chế độ đổi lịch
    useEffect(() => {
        if (!isReschedule || !selectedDoctor || !selectedDate) return;

        const fetchDoctorSchedule = async () => {
            try {
                const dateString = selectedDate.toISOString().split('T')[0];
                const response: any = await getDoctorScheduleByDoctorIdAndDate(String(selectedDoctor.doctorId), dateString);

                const scheduleData = response.data?.data || response.data || response;
                const availableSlots = scheduleData.timeSlots?.map((slot: any) => slot.slotId) || [];

                setAvailableSlotIds(availableSlots);
            } catch (error) {
                console.error('Error fetching doctor schedule:', error);
                setAvailableSlotIds([]);
            }
        };

        fetchDoctorSchedule();
    }, [isReschedule, selectedDoctor?.doctorId, selectedDate]);

    const handleTimeSlotSelect = useCallback((timeSlot: TimeSlot) => {
        setSelectedTimeSlot(timeSlot);
        setBookingState(prev => ({
            ...prev,
            slotId: Number(timeSlot.slotId) || 0,
        }));
    }, []);

    // Gọi API lấy danh sách bác sĩ khi đã chọn cả ngày và timeSlot
    useEffect(() => {
        if (!selectedDate || !selectedTimeSlot) return;

        const dateString = selectedDate.toISOString().split('T')[0];
        handleGetDoctorByDateAndTimeSlot(dateString, selectedTimeSlot.slotId);
    }, [selectedDate, selectedTimeSlot, handleGetDoctorByDateAndTimeSlot]);

    // Tự động cập nhật scheduleId khi có danh sách bác sĩ từ API (dành cho reschedule)
    useEffect(() => {
        if (!isReschedule || !selectedDoctor || doctors.length === 0) return;

        const currentDoctorSchedule = doctors.find(
            doc => String(doc.doctorId) === String(selectedDoctor.doctorId)
        );

        if (currentDoctorSchedule?.scheduleId) {
            setBookingState(prev => ({
                ...prev,
                scheduleId: String(currentDoctorSchedule.scheduleId),
            }));

            setSelectedDoctor(prev => prev ? {
                ...prev,
                scheduleId: currentDoctorSchedule.scheduleId
            } : null);
        }
    }, [doctors, isReschedule, selectedDoctor?.doctorId]);

    const handleMethodSelect = useCallback((method: ConsultationType) => {
        setSelectedMethod(method);
        setBookingState(prev => ({
            ...prev,
            consultationType: method as ConsultationType,
        }));
    }, []);

    const handleSymptomsChange = useCallback((text: string) => {
        if (text.length <= 500) {
            setBookingState(prev => ({
                ...prev,
                symptoms: text,
            }));
        }
    }, []);

    const resetBookingState = useCallback(() => {
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
            hasPredict: false,
            paymentMethod: "CASH",
        });
        setSelectedService(null);
        setSelectedDoctor(null);
        setSelectedDate(null);
        setSelectedTimeSlot(null);
        setSelectedMethod(null);
        setSelectedPaymentMethod("CASH");
    }, [user?.userId]);

    const handleCancel = useCallback(() => {
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
                        onClose?.();
                    },
                },
            ]
        );
    }, [resetBookingState, onClose]);

    const isBookingComplete = useMemo(() => Boolean(
        bookingState.patientId &&
        bookingState.scheduleId &&
        bookingState.doctorId &&
        bookingState.slotId &&
        bookingState.consultationType &&
        bookingState.symptoms.trim()
    ), [bookingState]);

    const handleConfirm = useCallback(() => {
        if (isBookingComplete) {
            handleBooking(bookingState, selectedDoctor);
            resetBookingState();
            onClose?.();
        }
    }, [isBookingComplete, bookingState, selectedDoctor, handleBooking, resetBookingState, onClose]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Reschedule Info Banner */}
                {isReschedule && initialData && (
                    <View style={styles.rescheduleInfoBanner}>
                        <Text style={styles.rescheduleInfoIcon}>ℹ️</Text>
                        <View style={styles.rescheduleInfoContent}>
                            <Text style={styles.rescheduleInfoTitle}>Đổi lịch khám</Text>
                            <Text style={styles.rescheduleInfoText}>
                                Bác sĩ hiện tại: {String(initialData.doctor.fullName)}
                            </Text>
                            <Text style={styles.rescheduleInfoText}>
                                Lịch cũ: {String(initialData.appointmentDate)} - {String(initialData.timeSlot.startTime)}
                            </Text>
                            <Text style={styles.rescheduleInfoSubtext}>
                                Vui lòng chọn ngày và giờ mới cho lịch khám
                            </Text>
                        </View>
                    </View>
                )}

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
                        oldSlotId={isReschedule && initialData ? initialData.timeSlot.slotId : undefined}
                        oldDate={isReschedule && initialData ? String(initialData.appointmentDate) : undefined}
                        isReschedule={isReschedule}
                        availableSlotIds={availableSlotIds}
                    />
                )}
                {/* Doctor Selection - Only show if date and time are selected AND NOT in reschedule mode */}
                {!isReschedule && selectedDate && selectedTimeSlot && (
                    <DoctorSelector
                        doctors={doctors}
                        selectedDoctor={selectedDoctor}
                        onDoctorSelect={handleDoctorSelect}
                    />
                )}

                {/* Doctor Info Display - Show when doctor is selected */}
                {selectedDoctor && (
                    <View style={styles.selectedDoctorInfo}>
                        <Text style={styles.sectionTitle}>Thông tin bác sĩ</Text>
                        <View style={styles.doctorInfoCard}>
                            <View style={styles.doctorHeader}>
                                {selectedDoctor.avatarUrl ? (
                                    <Image
                                        source={{ uri: selectedDoctor.avatarUrl }}
                                        style={styles.doctorAvatar}
                                    />
                                ) : (
                                    <View style={[styles.doctorAvatar, styles.avatarPlaceholder]}>
                                        <Text style={styles.avatarText}>
                                            {selectedDoctor.fullName.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                                <View style={styles.doctorInfo}>
                                    <Text style={styles.doctorName}>Bs. {String(selectedDoctor.fullName)}</Text>
                                    <Text style={styles.doctorDetail}>{String(selectedDoctor.specialty)}</Text>
                                    <Text style={styles.doctorDetail}>{Number(selectedDoctor.experienceYears)} năm kinh nghiệm</Text>
                                </View>
                            </View>
                            <View style={styles.doctorContactInfo}>
                                {selectedDoctor.examinationFee && (
                                    <View style={styles.contactRow}>
                                        <Text style={styles.contactIcon}>💰</Text>
                                        <Text style={styles.contactText}>Phí khám: {Number(selectedDoctor.examinationFee).toLocaleString('vi-VN')} VNĐ</Text>
                                    </View>
                                )}
                                {selectedDoctor.rating && (
                                    <View style={styles.contactRow}>
                                        <Text style={styles.contactIcon}>⭐</Text>
                                        <Text style={styles.contactText}>Đánh giá: {Number(selectedDoctor.rating)}/5</Text>
                                    </View>
                                )}
                                {selectedDoctor.phoneNumber && (
                                    <View style={styles.contactRow}>
                                        <Text style={styles.contactIcon}>📞</Text>
                                        <Text style={styles.contactText}>{selectedDoctor.phoneNumber}</Text>
                                    </View>
                                )}
                                {selectedDoctor.email && (
                                    <View style={styles.contactRow}>
                                        <Text style={styles.contactIcon}>✉️</Text>
                                        <Text style={styles.contactText}>{selectedDoctor.email}</Text>
                                    </View>
                                )}
                                {selectedDoctor.clinicAddress && (
                                    <View style={styles.contactRow}>
                                        <Text style={styles.contactIcon}>📍</Text>
                                        <Text style={styles.contactText}>{selectedDoctor.clinicAddress}</Text>
                                    </View>
                                )}
                            </View>
                            {isReschedule && (
                                <Text style={styles.lockInfo}>🔒 Không thể thay đổi bác sĩ khi đổi lịch</Text>
                            )}
                        </View>
                    </View>
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

                {/* Payment Method Selection - Only show if symptoms are entered */}
                {selectedMethod && bookingState.symptoms.trim() && (
                    <View style={styles.paymentSection}>
                        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                        <View style={styles.paymentMethodContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.paymentMethodButton,
                                    selectedPaymentMethod === "CASH" && styles.paymentMethodButtonSelected
                                ]}
                                onPress={() => {
                                    setSelectedPaymentMethod("CASH");
                                    setBookingState(prev => ({ ...prev, paymentMethod: "CASH" }));
                                }}
                            >
                                <Text style={styles.paymentMethodIcon}>💵</Text>
                                <Text style={[
                                    styles.paymentMethodText,
                                    selectedPaymentMethod === "CASH" && styles.paymentMethodTextSelected
                                ]}>Tiền mặt</Text>
                                <Text style={styles.paymentMethodDesc}>Thanh toán tại phòng khám</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.paymentMethodButton,
                                    selectedPaymentMethod === "BANK" && styles.paymentMethodButtonSelected
                                ]}
                                onPress={() => {
                                    setSelectedPaymentMethod("BANK");
                                    setBookingState(prev => ({ ...prev, paymentMethod: "BANK" }));
                                }}
                            >
                                <Text style={styles.paymentMethodIcon}>🏦</Text>
                                <Text style={[
                                    styles.paymentMethodText,
                                    selectedPaymentMethod === "BANK" && styles.paymentMethodTextSelected
                                ]}>Chuyển khoản</Text>
                                <Text style={styles.paymentMethodDesc}>Thanh toán online qua PayOS</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Action Buttons */}
                <ActionButtons
                    onCancel={handleCancel}
                    onConfirm={handleConfirm}
                    isConfirmEnabled={isBookingComplete}
                    isReschedule={isReschedule}
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
    rescheduleInfoBanner: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    rescheduleInfoIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    rescheduleInfoContent: {
        flex: 1,
    },
    rescheduleInfoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1976D2',
        marginBottom: 4,
    },
    rescheduleInfoText: {
        fontSize: 14,
        color: '#424242',
        marginBottom: 2,
    },
    rescheduleInfoSubtext: {
        fontSize: 13,
        color: '#757575',
        marginTop: 4,
        fontStyle: 'italic',
    },
    selectedDoctorInfo: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    doctorInfoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: '#4CAF50',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    doctorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    doctorAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
        backgroundColor: '#E0E0E0',
    },
    avatarPlaceholder: {
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    doctorInfo: {
        flex: 1,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    doctorDetail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    doctorContactInfo: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    contactIcon: {
        fontSize: 16,
        marginRight: 8,
        marginTop: 2,
    },
    contactText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    lockInfo: {
        fontSize: 12,
        color: '#757575',
        marginTop: 8,
        fontStyle: 'italic',
    },
    paymentSection: {
        marginBottom: 24,
    },
    paymentMethodContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    paymentMethodButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        alignItems: 'center',
    },
    paymentMethodButtonSelected: {
        borderColor: '#4CAF50',
        backgroundColor: '#E8F5E9',
    },
    paymentMethodIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    paymentMethodText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    paymentMethodTextSelected: {
        color: '#4CAF50',
    },
    paymentMethodDesc: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
});

export default BookingAppointment;