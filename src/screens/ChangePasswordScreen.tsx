import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { Lucide } from '@react-native-vector-icons/lucide';
import { NavigationProp, ParamListBase, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import ROUTING from '../constants/routing';
import { useAuthContext } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';

type ChangePasswordScreenRouteProp = RouteProp<{ params: { email: string; otp: string } }, 'params'>;

const ChangePasswordScreen = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newPasswordFocused, setNewPasswordFocused] = useState(false);
    const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const route = useRoute<ChangePasswordScreenRouteProp>();
    const { handleResetPassword } = useAuthContext();
    const email = route.params?.email || '';
    const otp = route.params?.otp || '';

    const isFormValid = newPassword.length >= 6 && confirmPassword.length >= 6;
    const isPasswordMatch = newPassword === confirmPassword;

    const handleChangePassword = async () => {
        if (!isFormValid) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Mật khẩu phải có ít nhất 6 ký tự'
            });
            return;
        }

        if (!isPasswordMatch) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Mật khẩu xác nhận không khớp'
            });
            return;
        }

        setIsLoading(true);
        try {
            await handleResetPassword(email, otp, newPassword);
        } catch (error: any) {
            // Error handling is done in AuthContext
            console.error('Change password error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground
                source={require('../assets/background.png')}
                style={styles.container}
                resizeMode="cover"
            >
                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Logo */}
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../assets/Logo.png')}
                                resizeMode="contain"
                            />
                        </View>

                        {/* Form Container */}
                        <View style={styles.formContainer}>
                            {/* Title */}
                            <Text style={styles.title}>Đổi mật khẩu</Text>
                            <Text style={styles.subtitle}>
                                Vui lòng nhập mật khẩu mới của bạn
                            </Text>

                            {/* New Password Input */}
                            <View style={styles.inputContainer}>
                                <Lucide
                                    name="lock"
                                    size={20}
                                    color={newPasswordFocused ? (typeof theme.colors.primary === 'string' ? theme.colors.primary : theme.colors.primary[500]) : theme.colors.text.inverse}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[
                                        styles.input,
                                        newPasswordFocused && styles.inputFocused,
                                    ]}
                                    placeholder="Mật khẩu mới"
                                    placeholderTextColor={theme.colors.text.inverse}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    onFocus={() => setNewPasswordFocused(true)}
                                    onBlur={() => setNewPasswordFocused(false)}
                                    secureTextEntry={!showNewPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowNewPassword(!showNewPassword)}
                                    style={styles.passwordToggle}
                                >
                                    <Lucide name={showNewPassword ? "eye-off" : "eye"} size={20} />
                                </TouchableOpacity>
                            </View>

                            {/* Confirm Password Input */}
                            <View style={styles.inputContainer}>
                                <Lucide
                                    name="lock"
                                    size={20}
                                    color={confirmPasswordFocused ? (typeof theme.colors.primary === 'string' ? theme.colors.primary : theme.colors.primary[500]) : theme.colors.text.inverse}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[
                                        styles.input,
                                        confirmPasswordFocused && styles.inputFocused,
                                        confirmPassword && !isPasswordMatch && styles.inputError,
                                    ]}
                                    placeholder="Xác nhận mật khẩu mới"
                                    placeholderTextColor={theme.colors.text.inverse}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    onFocus={() => setConfirmPasswordFocused(true)}
                                    onBlur={() => setConfirmPasswordFocused(false)}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.passwordToggle}
                                >
                                    <Lucide name={showConfirmPassword ? "eye-off" : "eye"} size={20} />
                                </TouchableOpacity>
                            </View>

                            {/* Password Match Indicator */}
                            {confirmPassword.length > 0 && (
                                <View style={styles.matchIndicator}>
                                    {isPasswordMatch ? (
                                        <View style={styles.matchSuccess}>
                                            <Lucide name="check" size={16} color={theme.colors.success[500]} />
                                            <Text style={styles.matchSuccessText}>Mật khẩu khớp</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.matchError}>
                                            <Lucide name="x" size={16} color={theme.colors.error[500]} />
                                            <Text style={styles.matchErrorText}>Mật khẩu không khớp</Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    (!isFormValid || !isPasswordMatch || isLoading) && styles.submitButtonDisabled,
                                ]}
                                onPress={handleChangePassword}
                                disabled={!isFormValid || !isPasswordMatch || isLoading}
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <Text style={styles.submitButtonText}>Đang xử lý...</Text>
                                ) : (
                                    <Text style={styles.submitButtonText}>Xác nhận đổi mật khẩu</Text>
                                )}
                            </TouchableOpacity>

                            {/* Back to Login Link */}
                            <View style={styles.loginLinkContainer}>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate(ROUTING.LOGIN)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.loginLinkText}>
                                        Quay lại đăng nhập
                                    </Text>
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
        marginBottom: theme.spacing[2],
        fontWeight: 'bold',
    },
    subtitle: {
        ...theme.typography.body2,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: theme.spacing[8],
        paddingHorizontal: theme.spacing[4],
    },

    // Input styles
    inputContainer: {
        marginBottom: theme.spacing[4],
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: 12,
        top: '50%',
        transform: [{ translateY: -10 }],
        zIndex: 1,
    },
    input: {
        ...theme.components.input.default,
        backgroundColor: theme.colors.glassmorphism.background,
        borderColor: theme.colors.glassmorphism.border,
        paddingLeft: 44,
        paddingRight: 44,
    },
    inputFocused: {
        ...theme.components.input.focused,
    },
    inputError: {
        borderColor: theme.colors.error[500],
    },
    passwordToggle: {
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: [{ translateY: -10 }],
        padding: theme.spacing[2],
    },

    // Match indicator
    matchIndicator: {
        marginBottom: theme.spacing[4],
    },
    matchSuccess: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[2],
    },
    matchSuccessText: {
        ...theme.typography.body2,
        color: theme.colors.success[500],
        fontWeight: '500',
    },
    matchError: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[2],
    },
    matchErrorText: {
        ...theme.typography.body2,
        color: theme.colors.error[500],
        fontWeight: '500',
    },

    // Submit button
    submitButton: {
        ...theme.components.button.primary,
        marginTop: theme.spacing[2],
        marginBottom: theme.spacing[6],
    },
    submitButtonDisabled: {
        backgroundColor: theme.colors.gray[400],
        opacity: 0.6,
    },
    submitButtonText: {
        ...theme.components.button.primaryText,
        fontSize: theme.fontSize.lg,
    },

    // Login link
    loginLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing[4],
    },
    loginLinkText: {
        ...theme.typography.body2,
        color: theme.colors.text.primary,
        fontWeight: '600',
    },
});

export default ChangePasswordScreen;
