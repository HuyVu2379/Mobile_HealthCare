import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface EmptyStateProps {
    title?: string;
    message?: string;
    icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title = 'Chưa có thông tin',
    message = 'Vui lòng đăng nhập để xem thông tin cá nhân',
    icon = '👤'
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

interface LoadingStateProps {
    message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
    message = 'Đang tải thông tin...'
}) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#F5F5F5',
    },
    icon: {
        fontSize: 64,
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
    },
    loadingText: {
        fontSize: 16,
        color: '#666666',
        marginTop: 16,
    },
});
