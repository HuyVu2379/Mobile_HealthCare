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
import AppointmentCard from '../components/ui/AppointmentHistory/AppointmentCard';
import { BookingAppointment } from '../components/ui/AppointmentHistory';
import { useAppointmentContext } from '../contexts';
import { useAuthContext } from '../contexts/AuthContext';
import { Appointment, AppointmentStatusEnum, CreateAppointmentRequest } from '../types/appointment';

const AppointmentTimelineScreen: React.FC = () => {
    const { user } = useAuthContext();
    const isFirstMount = useRef(true);
    const isInitialApiCall = useRef(true);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedType, setSelectedType] = useState('ALL');
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
    const handleBookingSubmit = (bookingData: CreateAppointmentRequest) => {
        // Chuyển đổi dữ liệu từ BookingState sang EventSocketAppointment
        const eventData = {
            appointmentId: null,
            patientId: user?.userId || null,
            doctorId: bookingData.doctorId || null,
            event: 'BOOKING_APPOINTMENT', // hoặc giá trị enum phù hợp
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
            },
            updateAppointmentRequest: null,
        };

        handleSendSocketEventAppointment(eventData as any);
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