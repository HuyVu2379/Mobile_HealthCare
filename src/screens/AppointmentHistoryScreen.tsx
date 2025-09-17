import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    Modal,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import AppointmentCard from '../components/ui/AppointmentHistory/AppointmentCard';
import { BookingAppointment } from '../components/ui/AppointmentHistory';
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

const AppointmentTimelineScreen: React.FC = () => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedType, setSelectedType] = useState('Tất cả');

    // Modal state for booking
    const [showBookingModal, setShowBookingModal] = useState(false);

    // DatePicker states
    const [fromDateObj, setFromDateObj] = useState(new Date());
    const [toDateObj, setToDateObj] = useState(new Date());
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);

    // Dropdown states
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const typeOptions = ['Tất cả', 'Khám trực tiếp', 'Tư vấn online'];

    // Format date to dd/MM/yyyy
    const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Dữ liệu mẫu
    const appointments: AppointmentData[] = [
        {
            id: '1',
            type: 'in-person',
            title: 'Khám tổng quát',
            doctor: 'BS. Lê Thị Mai',
            date: '20/1/2024',
            time: '09:30',
            status: 'upcoming',
            statusLabel: 'Sắp tới',
            actions: [
                {
                    type: 'reschedule',
                    label: 'Đổi lịch',
                    onPress: () => console.log('Đổi lịch'),
                },
                {
                    type: 'cancel',
                    label: 'Hủy lịch',
                    onPress: () => console.log('Hủy lịch'),
                },
            ],
        },
        {
            id: '2',
            type: 'online',
            title: 'Tư vấn thận học',
            doctor: 'BS. Trần Minh Hoàng',
            date: '15/1/2024',
            time: '14:00',
            status: 'upcoming',
            statusLabel: 'Sắp tới',
            actions: [
                {
                    type: 'join',
                    label: 'Vào phòng tư vấn',
                    onPress: () => console.log('Vào phòng tư vấn'),
                },
                {
                    type: 'reschedule',
                    label: 'Đổi lịch',
                    onPress: () => console.log('Đổi lịch'),
                },
                {
                    type: 'cancel',
                    label: 'Hủy lịch',
                    onPress: () => console.log('Hủy lịch'),
                },
            ],
        },
    ];

    const renderAppointment = ({ item, index }: { item: AppointmentData; index: number }) => (
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
                            <Text style={styles.dropdownText}>{selectedType}</Text>
                            <Text style={styles.dropdownIcon}>▼</Text>
                        </TouchableOpacity>

                        {/* Dropdown Options */}
                        {showTypeDropdown && (
                            <View style={styles.dropdownOptions}>
                                {typeOptions.map((option, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.dropdownOption}
                                        onPress={() => {
                                            setSelectedType(option);
                                            setShowTypeDropdown(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.dropdownOptionText,
                                            selectedType === option && styles.selectedOptionText
                                        ]}>
                                            {option}
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
            <FlatList
                data={appointments}
                renderItem={renderAppointment}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />

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
                    <BookingAppointment />
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
});

export default AppointmentTimelineScreen;