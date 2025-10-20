import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PersonalInfoScreen = () => {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.infoCard}>
                        <Text style={styles.label}>Họ và tên</Text>
                        <Text style={styles.value}>Nguyễn Văn A</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.label}>Ngày sinh</Text>
                        <Text style={styles.value}>01/01/1990</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.label}>Giới tính</Text>
                        <Text style={styles.value}>Nam</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.label}>Số điện thoại</Text>
                        <Text style={styles.value}>0123456789</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>nguyenvana@email.com</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.label}>Địa chỉ</Text>
                        <Text style={styles.value}>123 Đường ABC, Quận XYZ, TP. HCM</Text>
                    </View>

                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>
                            📋 Màn hình Thông tin cá nhân
                        </Text>
                        <Text style={styles.placeholderSubtext}>
                            Hiển thị thông tin chi tiết về người dùng
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        backgroundColor: '#007AFF',
        padding: 20,
        paddingTop: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    content: {
        padding: 16,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        color: '#000000',
        fontWeight: '500',
    },
    placeholder: {
        marginTop: 20,
        padding: 30,
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#007AFF',
        marginBottom: 8,
    },
    placeholderSubtext: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
    },
});

export default PersonalInfoScreen;
