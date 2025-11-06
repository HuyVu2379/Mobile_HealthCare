import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

interface ActionButtonsProps {
    onCancel: () => void;
    onConfirm: () => void;
    isConfirmEnabled: boolean;
    isReschedule?: boolean; // Flag để biết có phải đổi lịch không
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
    onCancel,
    onConfirm,
    isConfirmEnabled,
    isReschedule = false,
}) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.confirmButton,
                    !isConfirmEnabled && styles.disabledButton,
                ]}
                onPress={onConfirm}
                disabled={!isConfirmEnabled}
            >
                <Text
                    style={[
                        styles.confirmButtonText,
                        !isConfirmEnabled && styles.disabledButtonText,
                    ]}
                >
                    {isReschedule ? 'Xác nhận đổi lịch' : 'Xác nhận đặt lịch'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 20,
        paddingBottom: 10,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    confirmButton: {
        flex: 2,
        backgroundColor: '#4285F4',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    disabledButton: {
        backgroundColor: '#e0e0e0',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    disabledButtonText: {
        color: '#999',
    },
});

export default ActionButtons;