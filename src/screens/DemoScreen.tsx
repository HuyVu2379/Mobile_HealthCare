import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/type';
import ROUTING from '../constants/routing';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Demo Screen - Sử dụng để test Bottom Navigation
 * 
 * Màn hình này chứa các button để điều hướng đến các màn hình khác nhau
 * Bạn có thể thêm màn hình này vào navigation stack để test
 */
const DemoScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Demo Navigation</Text>
                <Text style={styles.subtitle}>Chọn màn hình bạn muốn xem</Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate(ROUTING.BOTTOM_TAB)}
                    >
                        <Text style={styles.primaryButtonText}>
                            📱 Mở Bottom Navigation
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate(ROUTING.CHATBOT)}
                    >
                        <Text style={styles.buttonText}>💬 Chatbot</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate(ROUTING.PREDICT)}
                    >
                        <Text style={styles.buttonText}>📋 Health Form</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate(ROUTING.APPOINTMENT)}
                    >
                        <Text style={styles.buttonText}>📅 Appointment History</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate(ROUTING.HOME)}
                    >
                        <Text style={styles.buttonText}>🏠 Home</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>💡 Tip</Text>
                    <Text style={styles.infoText}>
                        Bottom Navigation bao gồm 3 tab:{'\n'}
                        • Thông tin cá nhân{'\n'}
                        • Lịch sử xét nghiệm{'\n'}
                        • Hồ sơ khám
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 40,
    },
    buttonContainer: {
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#007AFF',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    buttonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '600',
    },
    infoBox: {
        marginTop: 40,
        backgroundColor: '#E3F2FD',
        padding: 20,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 22,
    },
});

export default DemoScreen;
