import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { LoginRequest } from '../types/IUser';
import { login, verifyOTP, getMe, logout, isAuthenticated, loadTokensFromStorage, register, resendOTP, resetPasswordRequest, verifyOTPForResetPassword, resetPassword } from '../services/auth.service';
import { setMe, setAccessToken, setRefreshToken, loadTokensFromStorage as loadTokensAction, clearTokens } from '../store/slices/userSlice';
import { RootState } from '../store/store';
import ROUTING from '../constants/routing';
import { useWebSocketContext } from './WebSocketContext';
import { TokenService } from '../services/token.service';
interface AuthContextType {
    user: any;
    accessToken: string | null;
    refreshToken: string | null;
    handleLogin: (data: LoginRequest) => Promise<void>;
    handleRegister: (data: LoginRequest) => Promise<void>;
    handleVerifyOTP: (email: string, otp: string) => Promise<void>;
    handleResendOTP: (email: string) => Promise<void>;
    handleResetPasswordRequest: (email: string) => Promise<void>;
    handleVerifyOTPForResetPassword: (email: string, otp: string) => Promise<void>;
    handleResetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
    handleLogout: () => Promise<void>;
    getCurrentUser: () => Promise<any>;
    loadTokens: () => Promise<void>;
    checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const dispatch = useDispatch();
    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const { user, accessToken, refreshToken } = useSelector((state: RootState) => state.user);
    const { connect, disconnect, isConnected, authenticate } = useWebSocketContext();

    const getCurrentUser = useCallback(async () => {
        try {
            const response = await getMe();
            if (response.statusCode === 200 && response.data) {
                dispatch(setMe(response.data));
                return response.data;
            }
            return null;
        } catch (error) {
            console.error("Get me failed", error);
            return null;
        }
    }, [dispatch]);

    const handleResendOTP = useCallback(async (email: string) => {
        try {
            console.log("check sending resend OTP for email: ", email);
            const response = await resendOTP(email);
            console.log("Resend OTP response: ", response);
            if (response.statusCode === 200 || response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Đã gửi lại mã OTP',
                    text2: 'Vui lòng kiểm tra email của bạn'
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Gửi lại OTP thất bại',
                    text2: response.message || 'Có lỗi xảy ra'
                });
            }
        } catch (error: any) {
            console.error("Resend OTP failed", error);
            Toast.show({
                type: 'error',
                text1: 'Gửi lại OTP thất bại',
                text2: error?.response?.data?.message || error.message || 'Có lỗi xảy ra'
            });
            throw error;
        }
    }, []);

    const handleRegister = useCallback(async (data: LoginRequest) => {
        try {
            const response = await register(data);
            console.log("check response register: ", response);

            if (response.data?.access_token && response.data?.refresh_token) {
                // Lưu tokens vào storage
                TokenService.setAccessToken(response.data.access_token);
                TokenService.setRefreshToken(response.data.refresh_token);

                // Hiển thị thông báo thành công
                Toast.show({
                    type: 'success',
                    text1: 'Đăng ký thành công',
                    text2: 'Vui lòng kiểm tra email để xác thực tài khoản'
                });

                // Navigate đến màn hình OTP với email
                navigation.navigate(ROUTING.OTP, { email: data.email });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Đăng ký thất bại',
                    text2: response.message || 'Có lỗi xảy ra'
                });
            }
        } catch (error: any) {
            console.error("Registration failed", error);

            // Kiểm tra nếu email đã tồn tại (statusCode 409)
            const statusCode = error?.response?.data?.statusCode || error?.statusCode;
            const errorMessage = error?.response?.data?.message || error?.message || '';

            if (statusCode === 409 && errorMessage.toLowerCase().includes('already exists')) {
                // Email đã tồn tại - gửi lại OTP và yêu cầu xác thực
                Toast.show({
                    type: 'info',
                    text1: 'Email đã tồn tại',
                    text2: 'Đang gửi mã OTP để xác thực tài khoản...'
                });

                try {
                    // Gửi OTP trước khi navigate
                    await handleResendOTP(data.email);

                    // Navigate đến màn hình OTP với email
                    navigation.navigate(ROUTING.OTP, { email: data.email });
                } catch (resendError) {
                    console.error("Failed to resend OTP:", resendError);
                    // Vẫn navigate đến OTP screen để user có thể tự gửi lại
                    navigation.navigate(ROUTING.OTP, { email: data.email });
                }
            } else {
                // Các lỗi khác
                Toast.show({
                    type: 'error',
                    text1: 'Đăng ký thất bại',
                    text2: errorMessage || 'Có lỗi xảy ra'
                });
                throw error;
            }
        }
    }, [dispatch, navigation, handleResendOTP]);

    const handleLogin = useCallback(async (data: LoginRequest) => {
        try {
            const response = await login(data);
            if (response.statusCode === 200 && response.data) {
                const { accessToken: token, refreshToken: refresh } = response.data;
                dispatch(setAccessToken(token));
                dispatch(setRefreshToken(refresh));

                // userData đã được lưu vào Redux store trong login() service
                const userData = response.userData;
                if (userData) {
                    console.log('🔐 Login successful, connecting to WebSocket...');
                    // Connect to WebSocket after successful login
                    connect();

                    // Authenticate with WebSocket
                    console.log('🔐 Authenticating WebSocket with userId:', userData.userId);
                    authenticate(userData.userId);

                    Toast.show({
                        type: 'success',
                        text1: 'Đăng nhập thành công',
                        text2: `Chào mừng ${userData.fullName || userData.email}!`
                    });
                    navigation.navigate(ROUTING.HOME as never);
                }
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Đăng nhập thất bại',
                    text2: response.message || 'Có lỗi xảy ra'
                });
            }
        } catch (error: any) {
            console.error("Login failed", error);
            Toast.show({
                type: 'error',
                text1: 'Đăng nhập thất bại',
                text2: error.message || error?.data?.message || 'Có lỗi xảy ra'
            });
        }
    }, [dispatch, connect, navigation, authenticate]);

    const handleVerifyOTP = useCallback(async (email: string, otp: string) => {
        try {
            const response = await verifyOTP({ email, otp });
            if (response.statusCode === 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Xác thực thành công',
                    text2: 'Bạn có thể đăng nhập ngay bây giờ'
                });
                navigation.navigate(ROUTING.LOGIN as never);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Xác thực thất bại',
                    text2: response.message || 'Mã OTP không đúng'
                });
            }
        } catch (error: any) {
            console.error("OTP verification failed", error);
            Toast.show({
                type: 'error',
                text1: 'Xác thực thất bại',
                text2: error.message || 'Có lỗi xảy ra'
            });
        }
    }, [navigation]);

    const handleResetPasswordRequest = useCallback(async (email: string) => {
        try {
            const response = await resetPasswordRequest(email);

            if (response.statusCode === 200 || response.statusCode === 201) {
                Toast.show({
                    type: 'success',
                    text1: 'Gửi email thành công',
                    text2: 'Mã OTP đã được gửi đến email của bạn'
                });

                // Navigate đến màn hình VerifyOTP sau 1 giây
                setTimeout(() => {
                    navigation.navigate(ROUTING.OTP, { email, fromResetPassword: true });
                }, 1000);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Gửi email thất bại',
                    text2: response.message || 'Không thể gửi email đặt lại mật khẩu'
                });
                throw new Error(response.message || 'Gửi email thất bại');
            }
        } catch (error: any) {
            console.error("Reset password request failed", error);
            const errorMessage = error.response?.data?.message || error.message || 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.';
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: errorMessage
            });
            throw error;
        }
    }, [navigation]);

    const handleVerifyOTPForResetPassword = useCallback(async (email: string, otp: string) => {
        try {
            const response = await verifyOTPForResetPassword({ email, otp });

            if (response.statusCode === 200 || response.statusCode === 201) {
                Toast.show({
                    type: 'success',
                    text1: 'Xác thực thành công',
                    text2: 'Vui lòng nhập mật khẩu mới'
                });

                // Navigate đến màn hình ChangePassword
                navigation.navigate(ROUTING.CHANGE_PASSWORD, { email, otp });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Xác thực thất bại',
                    text2: response.message || 'OTP không đúng hoặc đã hết hạn'
                });
                throw new Error(response.message || 'Xác thực thất bại');
            }
        } catch (error: any) {
            console.error("Verify OTP for reset password failed", error);
            const errorMessage = error.response?.data?.message || error.message || 'Xác thực OTP thất bại. Vui lòng thử lại.';
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: errorMessage
            });
            throw error;
        }
    }, [navigation]);

    const handleResetPassword = useCallback(async (email: string, otp: string, newPassword: string) => {
        try {
            const response = await resetPassword({ email, otp, newPassword });

            if (response.statusCode === 200 || response.statusCode === 201) {
                Toast.show({
                    type: 'success',
                    text1: 'Đổi mật khẩu thành công',
                    text2: 'Vui lòng đăng nhập lại với mật khẩu mới'
                });

                // Navigate đến LoginScreen sau 1.5 giây
                setTimeout(() => {
                    navigation.navigate(ROUTING.LOGIN as never);
                }, 1500);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Đổi mật khẩu thất bại',
                    text2: response.message || 'Không thể đổi mật khẩu'
                });
                throw new Error(response.message || 'Đổi mật khẩu thất bại');
            }
        } catch (error: any) {
            console.error("Reset password failed", error);
            const errorMessage = error.response?.data?.message || error.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.';
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: errorMessage
            });
            throw error;
        }
    }, [navigation]);

    const handleLogout = useCallback(async () => {
        try {
            console.log('🔐 Logging out, disconnecting WebSocket...');
            // Disconnect WebSocket before logout
            disconnect();

            await logout();
            dispatch(clearTokens());

            Toast.show({
                type: 'success',
                text1: 'Đăng xuất thành công',
                text2: 'Hẹn gặp lại bạn!'
            });
            navigation.navigate(ROUTING.LOGIN as never);
        } catch (error: any) {
            console.error("Logout failed", error);
            // Still disconnect and clear tokens even if API call fails
            disconnect();
            dispatch(clearTokens());
            navigation.navigate(ROUTING.LOGIN as never);
        }
    }, [disconnect, dispatch, navigation]);

    const loadTokens = useCallback(async () => {
        try {
            await loadTokensFromStorage();
            dispatch(loadTokensAction({ accessToken: '', refreshToken: '' })); // This will be overridden by the service
            // Try to get current user if tokens exist
            const userData = await getCurrentUser();
            if (userData) {
                console.log('🔐 Tokens loaded, connecting to WebSocket...');
                connect();
                authenticate(userData.userId);
            }
        } catch (error) {
            console.error("Load tokens failed", error);
        }
    }, [dispatch, getCurrentUser, connect, authenticate]);

    const checkAuth = useCallback(async (): Promise<boolean> => {
        try {
            const authenticated = await isAuthenticated();
            if (authenticated) {
                const userData = await getCurrentUser();
                if (!isConnected) {
                    console.log('🔐 User authenticated, connecting to WebSocket...');
                    connect();
                }
                if (userData) {
                    authenticate(userData.userId);
                }
                return true;
            } else {
                disconnect();
                return false;
            }
        } catch (error) {
            console.error("Auth check failed", error);
            disconnect();
            return false;
        }
    }, [getCurrentUser, connect, disconnect, isConnected, authenticate]);

    // Auto-connect and authenticate WebSocket when user is available and not connected
    useEffect(() => {
        if (user && accessToken && !isConnected) {
            console.log('🔐 User available, auto-connecting to WebSocket...');
            connect();
        }

        // Auto-authenticate when connected and user is available
        if (user?.userId && isConnected) {
            console.log('🔐 Auto-authenticating with userId:', user.userId);
            authenticate(user.userId);
        }
    }, [user, accessToken, isConnected, connect, authenticate]);

    const value: AuthContextType = {
        user,
        accessToken,
        refreshToken,
        handleLogin,
        handleRegister,
        handleVerifyOTP,
        handleResendOTP,
        handleResetPasswordRequest,
        handleVerifyOTPForResetPassword,
        handleResetPassword,
        handleLogout,
        getCurrentUser,
        loadTokens,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};