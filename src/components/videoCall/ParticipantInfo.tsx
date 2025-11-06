import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, typography } from '../../theme';

interface ParticipantInfoProps {
    name: string;
    role: 'doctor' | 'patient';
    avatarUrl?: string;
    isCurrentUser?: boolean;
}

export const ParticipantInfo: React.FC<ParticipantInfoProps> = ({
    name,
    role,
    avatarUrl,
    isCurrentUser = false,
}) => {
    const roleText = role === 'doctor' ? 'Bác sĩ' : 'Bệnh nhân';
    const displayName = isCurrentUser ? `${name} (Bạn)` : name;

    return (
        <View style={styles.container}>
            {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarText}>
                        {name.charAt(0).toUpperCase()}
                    </Text>
                </View>
            )}
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                    {displayName}
                </Text>
                <Text style={styles.role}>{roleText}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 12,
        minWidth: 200,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    avatarImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    avatarPlaceholder: {
        backgroundColor: colors.primary[500] || '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: colors.white || '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    info: {
        flex: 1,
    },
    name: {
        color: colors.white || '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    role: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
    },
});
