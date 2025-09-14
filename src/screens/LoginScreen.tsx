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
    Pressable,
    Image,
    ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { Lucide } from '@react-native-vector-icons/lucide';

interface LoginScreenProps {
    onLoginPress?: () => void;
    onRegisterPress?: (email: string, password: string, agreedToTerms: boolean) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
    onLoginPress,
    onRegisterPress,
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
        if (onLoginPress) {
            onLoginPress();
        }
    };

    const isFormValid = email.trim().length > 0 && password.length > 0;

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground
                source={require('../assets/background.png')} // đường dẫn ảnh
                style={styles.container}
                resizeMode="cover" // hoặc "stretch", "contain"
            >
                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled">

                        {/* Logo Placeholder */}
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../assets/Logo.png')} // Replace with your logo path
                                resizeMode="contain"
                            />
                        </View>

                        {/* Registration Form */}
                        <View style={styles.formContainer}>
                            {/* Title */}
                            <Text style={styles.title}>Đăng nhập</Text>

                            {/* Email Input */}
                            <View style={styles.inputContainer}>
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
                                />
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        passwordFocused && styles.inputFocused,
                                    ]}
                                    placeholder="Mật khẩu"
                                    placeholderTextColor={theme.colors.text.inverse}
                                    value={password}
                                    onChangeText={setPassword}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: [{ translateY: -7 }] }}>
                                    <Lucide name={showPassword ? "eye-closed" : "eye"} size={20} />
                                </TouchableOpacity>
                            </View>

                            {/* Forgot Password and Remember Me */}
                            <View style={styles.forgotPasswordContainer}>
                                <TouchableOpacity>
                                    <Text style={styles.forgotPasswordText}>Quên mật khẩu</Text>
                                </TouchableOpacity>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '30%' }}>
                                    <Pressable
                                        style={styles.checkboxContainer}
                                        onPress={() => setAgreedToTerms(!agreedToTerms)}>
                                        <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                                            {agreedToTerms && <Text style={styles.checkboxTick}>✓</Text>}
                                        </View>
                                    </Pressable>
                                    <Text style={styles.checkboxText}>
                                        Nhớ tôi
                                    </Text>
                                </View>
                            </View>

                            {/* Login Button */}
                            <TouchableOpacity
                                style={[
                                    styles.loginButton,
                                    !isFormValid && styles.loginButtonDisabled,
                                ]}
                                onPress={handleLogin}
                                disabled={!isFormValid}
                                activeOpacity={0.8}>
                                <Text style={styles.loginButtonText}>Đăng nhập</Text>
                            </TouchableOpacity>

                            {/* Social Login Buttons */}
                            <View style={styles.socialButtonsContainer}>
                                <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
                                    <Image source={require('../assets/google.png')} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.facebookButton} activeOpacity={0.8}>
                                    <Image source={require('../assets/facebook.png')} />
                                </TouchableOpacity>
                            </View>

                            {/* Register Link */}
                            <View style={styles.registerLinkContainer}>
                                <TouchableOpacity onPress={() => onRegisterPress && onRegisterPress('', '', false)} activeOpacity={0.7}>
                                    <Text style={styles.registerLinkText}>Chưa có tài khoản?</Text>
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
        backgroundColor: 'transparent', // Will be replaced with background image
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
        marginBottom: theme.spacing[8],
        fontWeight: 'bold',
    },

    // Input styles
    inputContainer: {
        marginBottom: theme.spacing[4],
    },
    input: {
        ...theme.components.input.default,
        backgroundColor: theme.colors.glassmorphism.background,
        borderColor: theme.colors.glassmorphism.border,
        paddingRight: 35
    },
    inputFocused: {
        ...theme.components.input.focused,
    },

    forgotPasswordContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing[2],
        width: '100%',
    },
    forgotPasswordText: {
        ...theme.typography.body2,
        color: theme.colors.text.primary,
        marginRight: theme.spacing[1],
    },
    dropdownArrow: {
        ...theme.typography.body2,
        color: theme.colors.text.primary,
        fontSize: 10,
    },

    // Checkbox styles
    checkboxContainer: {
        ...theme.components.checkbox.container,
        marginVertical: 0,
        flexShrink: 0,
    },
    checkbox: {
        ...theme.components.checkbox.box,
        marginRight: theme.spacing[1],
        backgroundColor: theme.colors.glassmorphism.background,
    },
    checkboxChecked: {
        ...theme.components.checkbox.checked,
    },
    checkboxTick: {
        color: theme.colors.white,
        fontSize: theme.fontSize.sm,
        fontWeight: 'bold',
    },
    checkboxText: {
        ...theme.components.checkbox.text,
        lineHeight: theme.fontSize.sm * 1.4,
        color: theme.colors.text.primary,
    },

    // Login button
    loginButton: {
        ...theme.components.button.primary,
        marginTop: theme.spacing[2],
        marginBottom: theme.spacing[6],
    },
    loginButtonDisabled: {
        backgroundColor: theme.colors.gray[400],
        opacity: 0.6,
    },
    loginButtonText: {
        ...theme.components.button.primaryText,
        fontSize: theme.fontSize.lg,
    },

    // Social buttons
    socialButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing[6],
        gap: theme.spacing[4],
    },
    googleButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.glassmorphism.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.glassmorphism.border,
    },
    facebookButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#1877F2',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Register link
    registerLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerLinkText: {
        ...theme.typography.body2,
        color: theme.colors.text.primary,
        fontWeight: '600',
    },

});

export default LoginScreen;