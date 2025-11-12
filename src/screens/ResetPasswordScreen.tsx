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
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { useAuthContext } from '../contexts/AuthContext';
import ROUTING from '../constants/routing';

const ResetPasswordScreen = () => {
    const [email, setEmail] = useState('');
    const [emailFocused, setEmailFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const { handleResetPasswordRequest } = useAuthContext();

    const isFormValid = email.trim().length > 0 && /\S+@\S+\.\S+/.test(email);

    const handleResetPassword = async () => {
        if (!isFormValid) {
            return;
        }

        setIsLoading(true);
        try {
            await handleResetPasswordRequest(email);
        } catch (error) {
            // Error handling is done in AuthContext
            console.error('Reset password error:', error);
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
                            {/* Back Button */}
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => navigation.goBack()}
                                activeOpacity={0.7}
                            >
                                <Lucide name="arrow-left" size={24} color={theme.colors.text.primary} />
                            </TouchableOpacity>

                            {/* Title */}
                            <Text style={styles.title}>Quên mật khẩu</Text>
                            <Text style={styles.subtitle}>
                                Nhập email của bạn để nhận link đặt lại mật khẩu
                            </Text>

                            {/* Email Input */}
                            <View style={styles.inputContainer}>
                                <Lucide
                                    name="mail"
                                    size={20}
                                    color={emailFocused ? (typeof theme.colors.primary === 'string' ? theme.colors.primary : theme.colors.primary[500]) : theme.colors.text.inverse}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[
                                        styles.input,
                                        emailFocused && styles.inputFocused,
                                    ]}
                                    placeholder="Email"
                                    placeholderTextColor={theme.colors.text.inverse}
                                    value={email}
                                    onChangeText={setEmail}
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => setEmailFocused(false)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                />
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    (!isFormValid || isLoading) && styles.submitButtonDisabled,
                                ]}
                                onPress={handleResetPassword}
                                disabled={!isFormValid || isLoading}
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <Text style={styles.submitButtonText}>Đang gửi...</Text>
                                ) : (
                                    <Text style={styles.submitButtonText}>Gửi email</Text>
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
        position: 'relative',
    },

    // Back button
    backButton: {
        position: 'absolute',
        top: theme.spacing[4],
        left: theme.spacing[4],
        zIndex: 1,
        padding: theme.spacing[2],
    },

    // Title
    title: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
        textAlign: 'center',
        marginBottom: theme.spacing[2],
        marginTop: theme.spacing[8],
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
        marginBottom: theme.spacing[6],
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
    },
    inputFocused: {
        ...theme.components.input.focused,
    },

    // Submit button
    submitButton: {
        ...theme.components.button.primary,
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

export default ResetPasswordScreen;
