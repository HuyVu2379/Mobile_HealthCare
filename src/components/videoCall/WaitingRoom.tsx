import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../theme';

interface WaitingRoomProps {
    roomId: string;
    doctorName: string;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({ roomId, doctorName }) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.title}>Đang chờ bệnh nhân...</Text>
            <Text style={styles.subtitle}>Bác sĩ: {doctorName}</Text>
            <View style={styles.roomInfo}>
                <Text style={styles.label}>Mã phòng:</Text>
                <Text style={styles.roomId}>{roomId}</Text>
            </View>
            <Text style={styles.instruction}>
                Chia sẻ mã phòng với bệnh nhân để họ có thể tham gia
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.gray[50],
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: colors.gray[900],
        marginTop: 24,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.gray[600],
        marginBottom: 32,
    },
    roomInfo: {
        backgroundColor: colors.white,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 14,
        color: colors.gray[600],
        marginBottom: 8,
    },
    roomId: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary[500],
        letterSpacing: 2,
    },
    instruction: {
        fontSize: 14,
        color: colors.gray[500],
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
