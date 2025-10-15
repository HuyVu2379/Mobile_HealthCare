import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { TimeSlot } from '../../../types/appointment';

interface DateTimeSelectorProps {
    timeSlots: TimeSlot[];
    selectedDate: Date | null;
    selectedTimeSlot: TimeSlot | null;
    onDateSelect: (date: Date) => void;
    onTimeSlotSelect: (timeSlot: TimeSlot) => void;
}

const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
    timeSlots,
    selectedDate,
    selectedTimeSlot,
    onDateSelect,
    onTimeSlotSelect,
}) => {
    const [showDatePicker, setShowDatePicker] = useState(false);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const renderTimeSlot = (item: TimeSlot) => {
        const isSelected = selectedTimeSlot?.slotId === item.slotId;

        return (
            <TouchableOpacity
                key={String(item.slotId)}
                style={[
                    styles.timeButton,
                    isSelected && styles.selectedTimeButton,
                ]}
                onPress={() => onTimeSlotSelect(item)}
            >
                <Text
                    style={[
                        styles.timeText,
                        isSelected && styles.selectedTimeText,

                    ]}
                >
                    {item.startTime} - {item.endTime}
                </Text>
            </TouchableOpacity>
        );
    };

    // Chia timeSlots thành các hàng (2 cột)
    const renderTimeSlots = () => {
        const rows = [];
        for (let i = 0; i < timeSlots.length; i += 2) {
            rows.push(
                <View key={`row-${i}`} style={styles.timeRow}>
                    {renderTimeSlot(timeSlots[i])}
                    {timeSlots[i + 1] && renderTimeSlot(timeSlots[i + 1])}
                </View>
            );
        }
        return rows;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Chọn ngày</Text>

            {/* Date Selection */}
            <TouchableOpacity
                style={styles.dateSelector}
                onPress={() => setShowDatePicker(true)}
            >
                <Text style={styles.dateText}>
                    {selectedDate ? formatDate(selectedDate) : 'Chọn ngày khám'}
                </Text>
                <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>

            <DatePicker
                modal
                open={showDatePicker}
                date={selectedDate || new Date()}
                mode="date"
                minimumDate={new Date()}
                locale="vi"
                title="Chọn ngày khám"
                confirmText="Xác nhận"
                cancelText="Hủy"
                onConfirm={(date) => {
                    setShowDatePicker(false);
                    onDateSelect(date);
                }}
                onCancel={() => {
                    setShowDatePicker(false);
                }}
            />

            {/* Time Selection */}
            {selectedDate && (
                <View style={styles.timeSection}>
                    <Text style={styles.sectionTitle}>Chọn giờ</Text>
                    <View style={styles.timeContainer}>
                        {renderTimeSlots()}
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    dateSelector: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 24,
    },
    dateText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    calendarIcon: {
        fontSize: 20,
    },
    timeSection: {
        marginTop: 8,
    },
    timeContainer: {
        gap: 12,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: 12,
    },
    timeButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        flex: 1,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    selectedTimeButton: {
        backgroundColor: '#4285F4',
        borderColor: '#4285F4',
        borderWidth: 2,
    },
    disabledTimeButton: {
        backgroundColor: '#f5f5f5',
        borderColor: '#e0e0e0',
    },
    timeText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    selectedTimeText: {
        color: '#fff',
    },
    disabledTimeText: {
        color: '#999',
    },
});

export default DateTimeSelector;