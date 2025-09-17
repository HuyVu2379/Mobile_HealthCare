import { useDispatch, useSelector } from "react-redux";
import { LoginRequest } from "../types/IUser";
import { login, verifyOTP, getMe, logout, isAuthenticated, loadTokensFromStorage } from "../services/auth.service";
import { setMe, setAccessToken, setRefreshToken, loadTokensFromStorage as loadTokensAction, clearTokens } from "../store/slices/userSlice";
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import ROUTING from "../constants/routing";
import Toast from "react-native-toast-message";
import { useEffect } from "react";
import { RootState } from "../store/store";
const useAuth = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const { user, accessToken, refreshToken } = useSelector((state: RootState) => state.user);

    // Load tokens từ AsyncStorage khi hook được khởi tạo
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                await loadTokensFromStorage();

                // Nếu có token, thử lấy thông tin user
                if (await isAuthenticated()) {
                    await getCurrentUser();
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
            }
        };

        initializeAuth();
    }, []);

    const handleLogin = async (data: LoginRequest) => {
        try {
            const response = await login(data);
            if (response.success && response.statusCode === 200) {
                const { accessToken, refreshToken } = response.data ?? {};
                if (!accessToken || !refreshToken) {
                    Toast.show({
                        type: "error",
                        text1: "Login failed",
                        text2: "Missing tokens in login response",
                    });
                    return;
                }
                // Lưu token vào redux
                dispatch(setAccessToken(accessToken));
                dispatch(setRefreshToken(refreshToken));
                // Thông báo thành công
                Toast.show({
                    type: "success",
                    text1: "Login successful",
                    text2: "Welcome back!",
                });
                // Điều hướng về Home
                navigation.navigate(ROUTING.HOME);
                return;
            }
            //Nếu không success (ví dụ: statusCode 401)
            Toast.show({
                type: "error",
                text1: "Login failed",
                text2: response.message || "Invalid credentials",
            });

        } catch (error: any) {
            // fallback cho lỗi mạng, timeout, server chết
            const message =
                error?.response?.data?.message ||
                error?.response?.data ||
                error?.message ||
                "Network or server error";
            Toast.show({
                type: "error",
                text1: "Login failed",
                text2: message,
            });
        }
    };


    const getCurrentUser = async () => {
        try {
            const response = await getMe();
            if (response.statusCode === 200) {
                dispatch(setMe(response.data));
            }
        } catch (error) {
            console.error("Get me failed", error);
        }
    }

    const handleLogout = async () => {
        try {
            await logout();
            Toast.show({
                type: "success",
                text1: "Logout successful",
                text2: "See you later!",
            });
            navigation.navigate(ROUTING.LOGIN);
        } catch (error) {
            console.error("Logout failed", error);
            Toast.show({
                type: "error",
                text1: "Logout failed",
                text2: "Something went wrong",
            });
        }
    };

    const checkAuthStatus = async (): Promise<boolean> => {
        return await isAuthenticated();
    };

    return {
        handleLogin,
        getCurrentUser,
        handleLogout,
        checkAuthStatus,
        user,
        accessToken,
        refreshToken,
        isLoggedIn: !!accessToken && !!refreshToken
    };
}
export default useAuth;