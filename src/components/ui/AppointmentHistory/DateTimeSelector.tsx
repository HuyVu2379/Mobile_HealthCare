import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { TimeSlot } from '../../../types/booking';

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

    const renderTimeSlot = ({ item }: { item: TimeSlot }) => {
        const isSelected = selectedTimeSlot?.id === item.id;
        const isAvailable = item.available;

        return (
            <TouchableOpacity
                style={[
                    styles.timeButton,
                    isSelected && styles.selectedTimeButton,
                    !isAvailable && styles.disabledTimeButton,
                ]}
                onPress={() => isAvailable && onTimeSlotSelect(item)}
                disabled={!isAvailable}
            >
                <Text
                    style={[
                        styles.timeText,
                        isSelected && styles.selectedTimeText,
                        !isAvailable && styles.disabledTimeText,
                    ]}
                >
                    {item.time}
                </Text>
            </TouchableOpacity>
        );
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
                    <FlatList
                        data={timeSlots}
                        renderItem={renderTimeSlot}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        columnWrapperStyle={styles.timeRow}
                        contentContainerStyle={styles.timeContainer}
                    />
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
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    timeButton: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        flex: 0.48,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    selectedTimeButton: {
        backgroundColor: '#4285F4',
        borderColor: '#4285F4',
    },
    disabledTimeButton: {
        backgroundColor: '#f5f5f5',
        borderColor: '#e0e0e0',
    },
    timeText: {
        fontSize: 16,
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