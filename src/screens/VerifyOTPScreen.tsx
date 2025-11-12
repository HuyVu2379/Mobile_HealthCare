import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
    ImageBackground,
    Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { useAuthContext } from '../contexts/AuthContext';
import { NavigationProp, ParamListBase, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import ROUTING from '../constants/routing';
import Toast from 'react-native-toast-message';

type VerifyOTPScreenRouteProp = RouteProp<{ params: { email: string; fromResetPassword?: boolean } }, 'params'>;

const VerifyOTPScreen = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const { handleVerifyOTP, handleResendOTP, handleVerifyOTPForResetPassword, handleResetPasswordRequest } = useAuthContext();
    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const route = useRoute<VerifyOTPScreenRouteProp>();
    const email = route.params?.email || '';
    const fromResetPassword = route.params?.fromResetPassword || false;

    // Countdown timer for resend OTP
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleOtpChange = (value: string, index: number) => {
        // Only allow numbers
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            Toast.show({
                type: 'error',
                text1: 'OTP không hợp lệ',
                text2: 'Vui lòng nhập đầy đủ 6 số'
            });
            return;
        }

        try {
            if (fromResetPassword) {
                // Nếu từ reset password, gọi API verify OTP cho reset password
                await handleVerifyOTPForResetPassword(email, otpCode);
            } else {
                // Nếu từ đăng ký, verify OTP như bình thường
                await handleVerifyOTP(email, otpCode);
            }
        } catch (error: any) {
            // Error handling is done in AuthContext
            console.error('OTP verification failed:', error);
        }
    };

    const onResendOTP = async () => {
        if (countdown > 0) return;

        setIsResending(true);
        try {
            if (fromResetPassword) {
                // Nếu từ reset password, gọi API reset password
                await handleResetPasswordRequest(email);
            } else {
                // Nếu từ đăng ký, gọi API resend OTP đăng ký
                await handleResendOTP(email);
            }
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (error: any) {
            // Error handling is done in AuthContext
            console.error('Resend OTP failed:', error);
        } finally {
            setIsResending(false);
        }
    };

    const isOtpComplete = otp.every(digit => digit !== '');

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground
                source={require('../assets/background.png')}
                style={styles.container}
                resizeMode="cover">
                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled">

                        {/* Logo */}
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../assets/Logo.png')}
                                resizeMode="contain"
                            />
                        </View>

                        {/* OTP Form */}
                        <View style={styles.formContainer}>
                            {/* Title */}
                            <Text style={styles.title}>Xác thực OTP</Text>

                            {/* Subtitle */}
                            <Text style={styles.subtitle}>
                                Mã xác thực đã được gửi đến email
                            </Text>
                            <Text style={styles.email}>{email}</Text>

                            {/* OTP Input Boxes */}
                            <View style={styles.otpContainer}>
                                {otp.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={ref => { inputRefs.current[index] = ref; }}
                                        style={[
                                            styles.otpInput,
                                            digit && styles.otpInputFilled
                                        ]}
                                        value={digit}
                                        onChangeText={(value) => handleOtpChange(value, index)}
                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        selectTextOnFocus
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </View>

                            {/* Verify Button */}
                            <TouchableOpacity
                                style={[
                                    styles.verifyButton,
                                    !isOtpComplete && styles.verifyButtonDisabled
                                ]}
                                onPress={handleVerify}
                                disabled={!isOtpComplete}
                                activeOpacity={0.8}>
                                <Text style={styles.verifyButtonText}>Xác thực</Text>
                            </TouchableOpacity>

                            {/* Resend OTP */}
                            <View style={styles.resendContainer}>
                                <Text style={styles.resendText}>Không nhận được mã? </Text>
                                <TouchableOpacity
                                    onPress={onResendOTP}
                                    disabled={countdown > 0 || isResending}
                                    activeOpacity={0.7}>
                                    <Text style={[
                                        styles.resendLink,
                                        (countdown > 0 || isResending) && styles.resendLinkDisabled
                                    ]}>
                                        {countdown > 0
                                            ? `Gửi lại (${countdown}s)`
                                            : isResending
                                                ? 'Đang gửi...'
                                                : 'Gửi lại'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Back to Login */}
                            <View style={styles.backContainer}>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate(ROUTING.LOGIN)}
                                    activeOpacity={0.7}>
                                    <Text style={styles.backText}>Quay lại đăng nhập</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </ImageBackground>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing[6],
        paddingVertical: theme.spacing[8],
    },

    // Logo styles
    logoContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing[12],
    },

    // Form container
    formContainer: {
        ...theme.components.card.glassmorphism,
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
    },

    // Title
    title: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
        textAlign: 'center',
        marginBottom: theme.spacing[4],
        fontWeight: 'bold',
    },

    // Subtitle
    subtitle: {
        ...theme.typography.body2,
        color: theme.colors.text.primary,
        textAlign: 'center',
        marginBottom: theme.spacing[2],
    },
    email: {
        ...theme.typography.body2,
        color: theme.colors.primary[600],
        textAlign: 'center',
        marginBottom: theme.spacing[8],
        fontWeight: '600',
    },

    // OTP Input
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing[8],
        gap: theme.spacing[2],
    },
    otpInput: {
        flex: 1,
        height: 56,
        borderWidth: 2,
        borderColor: theme.colors.glassmorphism.border,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.glassmorphism.background,
        textAlign: 'center',
        fontSize: theme.fontSize['2xl'],
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    otpInputFilled: {
        borderColor: theme.colors.primary[500],
        backgroundColor: theme.colors.glassmorphism.background,
    },

    // Verify button
    verifyButton: {
        ...theme.components.button.primary,
        marginBottom: theme.spacing[6],
    },
    verifyButtonDisabled: {
        backgroundColor: theme.colors.gray[400],
        opacity: 0.6,
    },
    verifyButtonText: {
        ...theme.components.button.primaryText,
        fontSize: theme.fontSize.lg,
    },

    // Resend OTP
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing[4],
    },
    resendText: {
        ...theme.typography.body2,
        color: theme.colors.text.primary,
    },
    resendLink: {
        ...theme.typography.body2,
        color: theme.colors.primary[600],
        fontWeight: '600',
    },
    resendLinkDisabled: {
        color: theme.colors.gray[400],
    },

    // Back to login
    backContainer: {
        alignItems: 'center',
    },
    backText: {
        ...theme.typography.body2,
        color: theme.colors.text.primary,
        fontWeight: '600',
    },
});

export default VerifyOTPScreen;
