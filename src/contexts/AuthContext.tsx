import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { LoginRequest } from '../types/IUser';
import { login, verifyOTP, getMe, logout, isAuthenticated, loadTokensFromStorage } from '../services/auth.service';
import { setMe, setAccessToken, setRefreshToken, loadTokensFromStorage as loadTokensAction, clearTokens } from '../store/slices/userSlice';
import { RootState } from '../store/store';
import ROUTING from '../constants/routing';
import { useWebSocketContext } from './WebSocketContext';

interface AuthContextType {
    user: any;
    accessToken: string | null;
    refreshToken: string | null;
    handleLogin: (data: LoginRequest) => Promise<void>;
    handleVerifyOTP: (email: string, otp: string) => Promise<void>;
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
        handleVerifyOTP,
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