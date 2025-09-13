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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';

interface RegisterScreenProps {
  onLoginPress?: () => void;
  onRegisterPress?: (email: string, password: string, agreedToTerms: boolean) => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onLoginPress,
  onRegisterPress,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleRegister = () => {
    if (onRegisterPress) {
      onRegisterPress(email, password, agreedToTerms);
    }
  };

  const isFormValid = email.trim().length > 0 && password.length > 0 && agreedToTerms;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          {/* Logo Placeholder */}
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>HEALTHCARE</Text>
              <Text style={styles.logoSubtext}>LOGO</Text>
            </View>
          </View>

          {/* Registration Form */}
          <View style={styles.formContainer}>
            {/* Title */}
            <Text style={styles.title}>Đăng ký tài khoản</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  emailFocused && styles.inputFocused,
                ]}
                placeholder="Email"
                placeholderTextColor={theme.colors.text.disabled}
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
                placeholderTextColor={theme.colors.text.disabled}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Terms and Conditions Checkbox */}
            <Pressable
              style={styles.checkboxContainer}
              onPress={() => setAgreedToTerms(!agreedToTerms)}>
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms && <Text style={styles.checkboxTick}>✓</Text>}
              </View>
              <Text style={styles.checkboxText}>
                Tôi đồng ý với điều khoản sử dụng website
              </Text>
            </Pressable>

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                !isFormValid && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={!isFormValid}
              activeOpacity={0.8}>
              <Text style={styles.registerButtonText}>Đăng ký</Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={onLoginPress} activeOpacity={0.7}>
                <Text style={styles.loginLinkText}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  logoPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: theme.colors.glassmorphism.background,
    borderRadius: theme.borderRadius.full,
    borderWidth: theme.dimensions.borderWidth.base,
    borderColor: theme.colors.glassmorphism.border,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.glassmorphism,
  },
  logoText: {
    ...theme.typography.h6,
    color: theme.colors.primary[600],
    textAlign: 'center',
    fontWeight: 'bold',
  },
  logoSubtext: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing[1],
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
  },
  inputFocused: {
    ...theme.components.input.focused,
  },

  // Checkbox styles
  checkboxContainer: {
    ...theme.components.checkbox.container,
    marginVertical: theme.spacing[4],
  },
  checkbox: {
    ...theme.components.checkbox.box,
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
  },

  // Register button
  registerButton: {
    ...theme.components.button.primary,
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[6],
  },
  registerButtonDisabled: {
    backgroundColor: theme.colors.gray[400],
    opacity: 0.6,
  },
  registerButtonText: {
    ...theme.components.button.primaryText,
    fontSize: theme.fontSize.lg,
  },

  // Login link
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
  },
  loginLinkText: {
    ...theme.typography.body2,
    color: theme.colors.primary[600],
    fontWeight: '600',
  },
});

export default RegisterScreen;