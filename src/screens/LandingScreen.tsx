import React from 'react'
import { ImageBackground, StyleSheet, View, Text } from 'react-native'
import Header from '../components/shared/Header';
import { theme } from "../theme"
import { FunctionGrid } from '../components/ui/Landing';
const LandingScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <ImageBackground source={require('../assets/header-banner.jpg')} style={styles.background}>
                <View style={styles.overlay} />
                <Header />
                <View style={styles.bannerTitle}>
                    <Text style={styles.bannerTitleText}>Hệ thống chăm sóc sức khỏe</Text>
                    <Text style={styles.contentSubtitle}>Chúng tôi luôn đồng hành cùng bạn trong hành trình phát hiện sớm, theo dõi và điều trị bệnh thận mạn tính</Text>
                </View>
            </ImageBackground>
            <View style={styles.content}>
                <Text style={styles.contentTitle}>Quản lý sức khỏe của bạn</Text>
                <Text style={styles.contentSubtitle}>Khám phá các dịch vụ được cá nhân hóa theo nhu cầu của bạn</Text>
                <FunctionGrid />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject, // Chiếm toàn bộ không gian của ImageBackground
        backgroundColor: 'rgba(246, 241, 241, 0.5)', // Màu đen với độ trong suốt 50%
    },
    background: {
        width: '100%',
        height: 250,
        resizeMode: 'contain',
        // opacity: 0.6,
    },
    header: {
        height: 100,
        width: '100%',
        backgroundColor: 'lightblue',
    },
    bannerTitle: {
        position: 'absolute',
        top: '40%',
        left: '5%',
        right: '5%',
        alignItems: 'center',
    },
    bannerTitleText: {
        ...theme.text.bannerTitleText,
    },
    contentTitle: {
        ...theme.text.bannerTitleText,
        marginBottom: 8,
    },
    contentSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    content: {
        paddingVertical: 20,
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
    }
})

export default LandingScreen;