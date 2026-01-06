import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Toast from 'react-native-toast-message';
import AppointmentCard from '../components/ui/AppointmentHistory/AppointmentCard';
import { BookingAppointment } from '../components/ui/AppointmentHistory';
import PaymentWebView from '../components/ui/PaymentWebView';
import { useAppointmentContext } from '../contexts';
import { useAuthContext } from '../contexts/AuthContext';
import { Appointment, AppointmentStatusEnum, CreateAppointmentRequest, Doctor } from '../types/appointment';
import { useChatContext } from '../contexts';
import { useRoom } from '../hooks/useRoom';
import { usePaymentPolling } from '../hooks/usePaymentPolling';
import { getDoctorScheduleByDoctorIdAndDate } from '../services/schedule.service';
import { createPayment } from '../services/payment.service';
const AppointmentTimelineScreen: React.FC = () => {
    const { user } = useAuthContext();
    const isFirstMount = useRef(true);
    const isInitialApiCall = useRef(true);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedType, setSelectedType] = useState('ALL');
    const { createGroup } = useChatContext();
    const { rooms, handleGetRooms } = useRoom();
    const [appointmentRequest, setAppointmentRequest] = useState({
        patientId: user?.userId || '',
        consultationType: 'ALL',
        page: 0,
        size: 10,
        startTime: '',
        endTime: '',
    });
    // Modal state for booking
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [appointmentToReschedule, setAppointmentToReschedule] = useState<Appointment | null>(null);

    // Payment state
    const [showPaymentWebView, setShowPaymentWebView] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState('');
    const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
    const [currentAppointmentId, setCurrentAppointmentId] = useState<string | null>(null);
    const [pendingAppointmentData, setPendingAppointmentData] = useState<{
        bookingData: CreateAppointmentRequest;
        selectedDoctor: Doctor | null;
    } | null>(null);

    // Payment polling hook
    const { isPolling, startPolling, stopPolling } = usePaymentPolling();

    // DatePicker states
    const [fromDateObj, setFromDateObj] = useState(new Date());
    const [toDateObj, setToDateObj] = useState(new Date());
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);

    // Dropdown states
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const typeOptions = {
        ALL: 'Tất cả',
        DIRECT_CONSULTATION: 'Khám trực tiếp',
        ONLINE_CONSULTATION: 'Tư vấn trực tuyến',
        LAB_TEST: 'Xét nghiệm',
        FOLLOW_UP: 'Tái khám'
    };
    // Format date to dd/MM/yyyy
    const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Use AppointmentContext instead of hook
    const { appointments, handleGetAppointments, error, loading, handleSendSocketEventAppointment, refresh } = useAppointmentContext();

    // Hàm chuyển đổi BookingState sang EventSocketAppointment
    const handleBookingSubmit = async (bookingData: CreateAppointmentRequest, selectedDoctor: Doctor | null) => {
        try {
            // Kiểm tra payment method
            if (bookingData.paymentMethod === "BANK") {
                // Flow BANK: Thanh toán online qua PayOS
                await handleBankPaymentFlow(bookingData, selectedDoctor);
            } else {
                // Flow CASH: Đặt lịch trực tiếp qua WebSocket
                await handleCashPaymentFlow(bookingData, selectedDoctor);
            }
        } catch (error) {
            console.error("❌ Error in booking submit:", error);
            Toast.show({
                type: "error",
                text1: "Lỗi đặt lịch",
                text2: "Có lỗi xảy ra, vui lòng thử lại",
            });
        }
    };

    // Flow CASH: Đặt lịch trực tiếp
    const handleCashPaymentFlow = (bookingData: CreateAppointmentRequest, selectedDoctor: Doctor | null) => {
        const eventData = {
            appointmentId: null,
            patientId: user?.userId || null,
            doctorId: bookingData.doctorId || null,
            event: 'BOOKING_APPOINTMENT',
            status: AppointmentStatusEnum.PENDING,
            createAppointmentRequest: {
                patientId: bookingData.patientId,
                scheduleId: bookingData.scheduleId,
                doctorId: bookingData.doctorId,
                symptoms: bookingData.symptoms,
                note: bookingData.note,
                slotId: bookingData.slotId,
                status: AppointmentStatusEnum.PENDING,
                consultationType: bookingData.consultationType,
                addressDetail: bookingData.addressDetail,
                hasPredict: bookingData.hasPredict || false,
                paymentMethod: bookingData.paymentMethod,
            },
            updateAppointmentRequest: null,
        };

        handleSendSocketEventAppointment(eventData as any, (appointmentId) => {
            console.log("✅ Booking appointment successful (CASH), appointmentId:", appointmentId);
            if (bookingData.doctorId && user?.userId && selectedDoctor) {
                setTimeout(() => {
                    createGroup({
                        groupName: `Tư vấn - ${selectedDoctor.fullName || 'Bác sĩ'}`,
                        appointmentId: appointmentId || bookingData.scheduleId?.toString() || '',
                        members: [
                            {
                                userId: user.userId,
                                fullName: user.fullName || 'Bệnh nhân',
                                avatarUrl: user.avatarUrl || ''
                            },
                            {
                                userId: selectedDoctor.doctorId,
                                fullName: selectedDoctor.fullName || 'Bác sĩ',
                                avatarUrl: selectedDoctor.avatarUrl || ''
                            }
                        ]
                    });
                }, 0);
            }
        });
    };

    // Flow BANK: Thanh toán online qua PayOS
    const handleBankPaymentFlow = async (bookingData: CreateAppointmentRequest, selectedDoctor: Doctor | null) => {
        try {
            // Bước 2: Tạo appointment với status PAYMENT_PENDING
            const eventData = {
                appointmentId: null,
                patientId: user?.userId || null,
                doctorId: bookingData.doctorId || null,
                event: 'BOOKING_APPOINTMENT',
                status: AppointmentStatusEnum.PAYMENT_PENDING,
                createAppointmentRequest: {
                    patientId: bookingData.patientId,
                    scheduleId: bookingData.scheduleId,
                    doctorId: bookingData.doctorId,
                    symptoms: bookingData.symptoms,
                    note: bookingData.note,
                    slotId: bookingData.slotId,
                    status: AppointmentStatusEnum.PAYMENT_PENDING,
                    consultationType: bookingData.consultationType,
                    addressDetail: bookingData.addressDetail,
                    hasPredict: bookingData.hasPredict || false,
                    paymentMethod: bookingData.paymentMethod,
                },
                updateAppointmentRequest: null,
            };

            // Lưu thông tin để xử lý sau khi thanh toán thành công
            setPendingAppointmentData({ bookingData, selectedDoctor });

            // Gửi WebSocket để tạo appointment
            handleSendSocketEventAppointment(eventData as any, async (appointmentId) => {
                console.log("✅ Appointment created with PAYMENT_PENDING status");
                console.log("📋 Real appointmentId from WebSocket:", appointmentId);

                // Bước 3: Tạo payment PayOS với appointmentId thật từ response
                if (!appointmentId) {
                    console.error("❌ No appointmentId received from WebSocket");
                    Toast.show({
                        type: "error",
                        text1: "Lỗi đặt lịch",
                        text2: "Không nhận được mã lịch hẹn",
                    });
                    return;
                }

                // Lưu appointmentId thực
                setCurrentAppointmentId(appointmentId);

                try {
                    const paymentData = {
                        appointmentId: appointmentId,
                        amount: selectedDoctor?.examinationFee || 0,
                        description: `Thanh toán khám bệnh - ${selectedDoctor?.fullName || 'Bác sĩ'}`,
                        returnUrl: "", // Mobile không cần returnUrl
                        cancelUrl: "", // Mobile không cần cancelUrl
                    };

                    console.log("💳 Creating payment...", paymentData);
                    const paymentResponse = await createPayment(paymentData);
                    console.log("✅ Payment created:", paymentResponse);

                    // Lưu payment info
                    setCurrentPaymentId(paymentResponse.paymentId);
                    setPaymentUrl(paymentResponse.paymentUrl);

                    // Mở WebView để thanh toán
                    setShowPaymentWebView(true);

                    // Bắt đầu polling để kiểm tra trạng thái thanh toán
                    startPolling(
                        paymentResponse.paymentId,
                        () => {
                            // onSuccess: Thanh toán thành công
                            handlePaymentSuccess();
                        },
                        (error: string) => {
                            // onFailed: Thanh toán thất bại
                            handlePaymentFailed(error);
                        }
                    );
                } catch (paymentError) {
                    console.error("❌ Error creating payment:", paymentError);
                    Toast.show({
                        type: "error",
                        text1: "Lỗi tạo thanh toán",
                        text2: "Không thể tạo link thanh toán. Vui lòng thử lại.",
                    });
                }
            });
        } catch (error) {
            console.error("❌ Error in bank payment flow:", error);
            Toast.show({
                type: "error",
                text1: "Lỗi đặt lịch",
                text2: "Có lỗi xảy ra, vui lòng thử lại",
            });
        }
    };

    // Xử lý khi thanh toán thành công
    const handlePaymentSuccess = () => {
        console.log("✅ Payment successful!");
        setShowPaymentWebView(false);
        stopPolling();

        Toast.show({
            type: "success",
            text1: "Thanh toán thành công",
            text2: "Lịch hẹn của bạn đã được xác nhận",
        });

        // Tạo chat group nếu có thông tin
        if (pendingAppointmentData?.selectedDoctor && user?.userId) {
            const { bookingData, selectedDoctor } = pendingAppointmentData;
            setTimeout(() => {
                createGroup({
                    groupName: `Tư vấn - ${selectedDoctor.fullName || 'Bác sĩ'}`,
                    appointmentId: currentAppointmentId || bookingData.scheduleId?.toString() || '',
                    members: [
                        {
                            userId: user.userId,
                            fullName: user.fullName || 'Bệnh nhân',
                            avatarUrl: user.avatarUrl || ''
                        },
                        {
                            userId: selectedDoctor.doctorId,
                            fullName: selectedDoctor.fullName || 'Bác sĩ',
                            avatarUrl: selectedDoctor.avatarUrl || ''
                        }
                    ]
                });
            }, 0);
        }

        // Clear pending data
        setPendingAppointmentData(null);
        setCurrentPaymentId(null);
        setCurrentAppointmentId(null);
        setPaymentUrl('');
    };

    // Xử lý khi thanh toán thất bại
    const handlePaymentFailed = (error: string) => {
        console.log("❌ Payment failed:", error);
        setShowPaymentWebView(false);
        stopPolling();

        Toast.show({
            type: "error",
            text1: "Thanh toán thất bại",
            text2: error || "Vui lòng thử lại",
        });

        // Clear pending data
        setPendingAppointmentData(null);
        setCurrentPaymentId(null);
        setCurrentAppointmentId(null);
        setPaymentUrl('');
    };

    // Đóng WebView thanh toán
    const handleClosePaymentWebView = () => {
        if (isPolling) {
            Toast.show({
                type: "info",
                text1: "Đang kiểm tra trạng thái thanh toán",
                text2: "Vui lòng đợi trong giây lát...",
            });
            return;
        }

        setShowPaymentWebView(false);
        stopPolling();

        // Clear data
        setPendingAppointmentData(null);
        setCurrentPaymentId(null);
        setCurrentAppointmentId(null);
        setPaymentUrl('');
    };

    // Hàm xử lý đổi lịch
    const handleRescheduleSubmit = (bookingData: CreateAppointmentRequest, selectedDoctor: any) => {
        if (!appointmentToReschedule) {
            console.error('❌ No appointment to reschedule');
            return;
        }

        // Tạo UpdateAppointmentRequest cho việc đổi lịch
        const updateAppointmentRequest = {
            appointmentId: String(appointmentToReschedule.appointmentId),
            oldScheduleId: bookingData.scheduleId, // scheduleId từ lịch cũ (được lấy từ API)
            newScheduleId: bookingData.scheduleId, // scheduleId mới (cùng bác sĩ nhưng khác lịch)
            oldSlotId: appointmentToReschedule.timeSlot.slotId,
            newSlotId: bookingData.slotId,
        };

        // Tạo EventSocketAppointment cho việc đổi lịch
        const eventData = {
            appointmentId: appointmentToReschedule.appointmentId,
            patientId: user?.userId || null,
            doctorId: bookingData.doctorId || null,
            event: 'RESCHEDULE_APPOINTMENT' as any,
            status: null,
            createAppointmentRequest: null, // Set null khi đổi lịch theo yêu cầu
            updateAppointmentRequest: updateAppointmentRequest,
        };

        console.log('🔄 Sending reschedule event:', eventData);

        handleSendSocketEventAppointment(eventData as any, () => {
            console.log("✅ Reschedule appointment successful");
            // Không cần tạo group chat mới vì đã có group chat từ lần đặt trước
        });
    };

    // Hàm mở modal đổi lịch
    const handleOpenRescheduleModal = (appointment: Appointment) => {
        console.log('🔄 Opening reschedule modal for:', appointment);
        setAppointmentToReschedule(appointment);
        setShowRescheduleModal(true);
    };

    // Update appointmentRequest when filters change
    useEffect(() => {
        // Bỏ qua lần render đầu tiên vì đã có giá trị mặc định
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }

        setAppointmentRequest(prev => ({
            ...prev,
            startTime: fromDate ? fromDate.split('/').reverse().join('-') : '',
            endTime: toDate ? toDate.split('/').reverse().join('-') : '',
            consultationType: selectedType
        }));
    }, [fromDate, toDate, selectedType]);

    useEffect(() => {
        handleGetRooms(user?.userId || null);
        // Gọi API ngay lập tức khi component mount lần đầu
        if (isInitialApiCall.current) {
            isInitialApiCall.current = false;
            console.log("🚀 [Initial Mount] Calling API with:", appointmentRequest);
            const fetchData = async () => {
                await handleGetAppointments(appointmentRequest);
            };
            fetchData();
            return;
        }

        // Debounce: Chờ 4 giây sau khi filters thay đổi mới gọi API
        console.log("⏱️ [Debounce] Waiting 4s to call API with:", appointmentRequest);
        const timeoutId = setTimeout(async () => {
            console.log("🔄 [API Call] Calling API after debounce:", appointmentRequest);
            await handleGetAppointments(appointmentRequest);
        }, 4000);

        // Cleanup function: Hủy timeout nếu appointmentRequest thay đổi trước khi timeout hoàn thành
        return () => {
            console.log("🧹 [Cleanup] Timeout cleared");
            clearTimeout(timeoutId);
        };
    }, [appointmentRequest, refresh]);

    const renderAppointment = ({ item, index }: { item: Appointment; index: number }) => (
        <AppointmentCard
            appointment={item}
            isFirst={index === 0}
            isLast={index === appointments.length - 1}
            rooms={rooms}
            userRole={user?.role}
            onReschedule={handleOpenRescheduleModal}
        />
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Overlay to close dropdown */}
            {showTypeDropdown && (
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => setShowTypeDropdown(false)}
                />
            )}

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Lịch sử khám bệnh</Text>
                <Text style={styles.headerSubtitle}>Theo dõi lịch trình khám bệnh theo thời gian</Text>

                {/* Add Button moved here */}
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowBookingModal(true)}
                >
                    <Text style={styles.addButtonIcon}>+</Text>
                    <Text style={styles.addButtonText}>Đặt lịch mới</Text>
                </TouchableOpacity>
            </View>

            {/* Filter Section */}
            <View style={styles.filterContainer}>
                <View style={styles.dateInputContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Từ ngày</Text>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setShowFromDatePicker(true)}
                        >
                            <Text style={[styles.dateInputText, !fromDate && styles.placeholderText]}>
                                {fromDate || 'dd/mm/yyyy'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Đến ngày</Text>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setShowToDatePicker(true)}
                        >
                            <Text style={[styles.dateInputText, !toDate && styles.placeholderText]}>
                                {toDate || 'dd/mm/yyyy'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Loại hình</Text>
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                        >
                            <Text style={styles.dropdownText}>{typeOptions[selectedType as keyof typeof typeOptions]}</Text>
                            <Text style={styles.dropdownIcon}>▼</Text>
                        </TouchableOpacity>

                        {/* Dropdown Options */}
                        {showTypeDropdown && (
                            <View style={styles.dropdownOptions}>
                                {Object.entries(typeOptions).map(([key, value]) => (
                                    <TouchableOpacity
                                        key={key}
                                        style={styles.dropdownOption}
                                        onPress={() => {
                                            setSelectedType(key);
                                            setShowTypeDropdown(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.dropdownOptionText,
                                            selectedType === key && styles.selectedOptionText
                                        ]}>
                                            {value}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.timelineHeader}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineLine} />
                    <TouchableOpacity style={styles.todayButton}>
                        <Text style={styles.todayButtonText}>Hôm nay</Text>
                    </TouchableOpacity>
                    <View style={styles.timelineLine} />
                </View>
            </View>

            {/* Appointments List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => handleGetAppointments(appointmentRequest)}
                    >
                        <Text style={styles.retryButtonText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            ) : appointments.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📅</Text>
                    <Text style={styles.emptyTitle}>Chưa có lịch khám</Text>
                    <Text style={styles.emptySubtitle}>
                        Bạn chưa có lịch khám nào trong khoảng thời gian này
                    </Text>
                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={() => setShowBookingModal(true)}
                    >
                        <Text style={styles.emptyButtonText}>Đặt lịch ngay</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={appointments}
                    renderItem={renderAppointment}
                    keyExtractor={(item) => item.appointmentId.toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Booking Modal */}
            <Modal
                visible={showBookingModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowBookingModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Đặt lịch khám mới</Text>
                        <TouchableOpacity
                            onPress={() => setShowBookingModal(false)}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <BookingAppointment
                        handleBooking={handleBookingSubmit}
                        onClose={() => setShowBookingModal(false)}
                    />
                </View>
            </Modal>

            {/* Reschedule Modal */}
            <Modal
                visible={showRescheduleModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => {
                    setShowRescheduleModal(false);
                    setAppointmentToReschedule(null);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Đổi lịch khám</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setShowRescheduleModal(false);
                                setAppointmentToReschedule(null);
                            }}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <BookingAppointment
                        handleBooking={handleRescheduleSubmit}
                        onClose={() => {
                            setShowRescheduleModal(false);
                            setAppointmentToReschedule(null);
                        }}
                        initialData={appointmentToReschedule}
                        isReschedule={true}
                    />
                </View>
            </Modal>

            {/* From Date Picker */}
            <DatePicker
                modal
                open={showFromDatePicker}
                date={fromDateObj}
                mode="date"
                onConfirm={(date) => {
                    setShowFromDatePicker(false);
                    setFromDateObj(date);
                    setFromDate(formatDate(date));
                }}
                onCancel={() => {
                    setShowFromDatePicker(false);
                }}
            />

            {/* To Date Picker */}
            <DatePicker
                modal
                open={showToDatePicker}
                date={toDateObj}
                mode="date"
                onConfirm={(date) => {
                    setShowToDatePicker(false);
                    setToDateObj(date);
                    setToDate(formatDate(date));
                }}
                onCancel={() => {
                    setShowToDatePicker(false);
                }}
            />

            {/* Payment WebView */}
            <PaymentWebView
                visible={showPaymentWebView}
                paymentUrl={paymentUrl}
                onClose={handleClosePaymentWebView}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailed={handlePaymentFailed}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 12,
    },
    addButton: {
        backgroundColor: '#2196F3',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    addButtonIcon: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 6,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    filterContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    dateInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    inputGroup: {
        flex: 1,
        marginHorizontal: 4,
    },
    inputLabel: {
        fontSize: 14,
        color: '#333333',
        marginBottom: 8,
        fontWeight: '500',
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateInputText: {
        fontSize: 14,
        color: '#333333',
    },
    placeholderText: {
        color: '#999999',
    },
    calendarIcon: {
        fontSize: 16,
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        position: 'relative',
    },
    dropdownText: {
        fontSize: 14,
        color: '#333333',
    },
    dropdownIcon: {
        fontSize: 12,
        color: '#666666',
    },
    dropdownOptions: {
        position: 'absolute',
        top: 45,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    dropdownOption: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    dropdownOptionText: {
        fontSize: 14,
        color: '#333333',
    },
    selectedOptionText: {
        color: '#2196F3',
        fontWeight: '500',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
    },
    timelineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#2196F3',
    },
    timelineLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#2196F3',
    },
    todayButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        marginHorizontal: 12,
    },
    todayButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
    listContainer: {
        padding: 20,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    modalHeader: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        color: '#666666',
        fontWeight: '500',
    },
    // Loading styles
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666666',
    },
    // Error styles
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    // Empty state styles
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AppointmentTimelineScreen;