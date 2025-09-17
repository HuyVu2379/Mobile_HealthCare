import React, { useState } from 'react';
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

import { BookingState } from '../../../types/booking';
import {
    SERVICES,
    DOCTORS,
    TIME_SLOTS,
    BOOKING_METHODS,
} from '../../../constants/bookingData';

const BookingAppointment: React.FC = () => {
    const [bookingState, setBookingState] = useState<BookingState>({
        service: null,
        doctor: null,
        date: null,
        timeSlot: null,
        method: null,
    });

    const handleServiceSelect = (service: typeof SERVICES[0]) => {
        setBookingState(prev => ({
            ...prev,
            service,
            doctor: null, // Reset subsequent selections
            date: null,
            timeSlot: null,
            method: null,
        }));
    };

    const handleDoctorSelect = (doctor: typeof DOCTORS[0]) => {
        setBookingState(prev => ({
            ...prev,
            doctor,
            date: null, // Reset subsequent selections
            timeSlot: null,
            method: null,
        }));
    };

    const handleDateSelect = (date: Date) => {
        setBookingState(prev => ({
            ...prev,
            date,
            timeSlot: null, // Reset time selection when date changes
            method: null,
        }));
    };

    const handleTimeSlotSelect = (timeSlot: typeof TIME_SLOTS[0]) => {
        setBookingState(prev => ({
            ...prev,
            timeSlot,
            method: null, // Reset method selection
        }));
    };

    const handleMethodSelect = (method: typeof BOOKING_METHODS[0]) => {
        setBookingState(prev => ({
            ...prev,
            method,
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
                        setBookingState({
                            service: null,
                            doctor: null,
                            date: null,
                            timeSlot: null,
                            method: null,
                        });
                    },
                },
            ]
        );
    };

    const handleConfirm = () => {
        if (isBookingComplete) {
            Alert.alert(
                'Đặt lịch thành công',
                `Bạn đã đặt lịch hẹn:\n\nDịch vụ: ${bookingState.service?.name || 'N/A'}\nBác sĩ: ${bookingState.doctor?.name || 'N/A'}\nNgày: ${bookingState.date?.toLocaleDateString('vi-VN') || 'N/A'}\nGiờ: ${bookingState.timeSlot?.time || 'N/A'}\nHình thức: ${bookingState.method?.name || 'N/A'}`,
                [{ text: 'OK' }]
            );
        }
    };

    const isBookingComplete = Boolean(
        bookingState.service &&
        bookingState.doctor &&
        bookingState.date &&
        bookingState.timeSlot &&
        bookingState.method
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
                    selectedService={bookingState.service}
                    onServiceSelect={handleServiceSelect}
                />

                {/* Doctor Selection - Only show if service is selected */}
                {bookingState.service && (
                    <DoctorSelector
                        doctors={DOCTORS}
                        selectedDoctor={bookingState.doctor}
                        onDoctorSelect={handleDoctorSelect}
                    />
                )}

                {/* Date & Time Selection - Only show if doctor is selected */}
                {bookingState.doctor && (
                    <DateTimeSelector
                        timeSlots={TIME_SLOTS}
                        selectedDate={bookingState.date}
                        selectedTimeSlot={bookingState.timeSlot}
                        onDateSelect={handleDateSelect}
                        onTimeSlotSelect={handleTimeSlotSelect}
                    />
                )}

                {/* Method Selection - Only show if date and time are selected */}
                {bookingState.date && bookingState.timeSlot && (
                    <MethodSelector
                        methods={BOOKING_METHODS}
                        selectedMethod={bookingState.method}
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