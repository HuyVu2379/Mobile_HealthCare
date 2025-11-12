import axiosConfig from "./axios.config";
const api_url = '/auth'
import { LoginRequest, AuthenticationResponse, ResetPasswordRequest } from "../types/IUser";
import { CustomApiResponse, LoginResponse } from "../types/api";
import { TokenService } from "./token.service";
import store from "../store/store";
import { clearTokens, setTokens, setMe } from "../store/slices/userSlice";
export const login = async (data: LoginRequest): Promise<any> => {
    const response = await axiosConfig.post(`${api_url}/login`, data);
    // Nếu login thành công và có token, lưu vào AsyncStorage
    if (response.data?.accessToken && response.data?.refreshToken && response.data?.userId) {
        await TokenService.setTokens(response.data.accessToken, response.data.refreshToken, response.data.userId);
        store.dispatch(setTokens({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
        }));

        // Gọi getMe để lấy thông tin user sau khi login thành công
        try {
            const userResponse = await getMe();
            if (userResponse.statusCode === 200 && userResponse.data) {
                // Lưu user info vào Redux store luôn
                store.dispatch(setMe(userResponse.data));
                return {
                    ...response,
                    userData: userResponse.data
                };
            }
        } catch (error) {
            console.error('Error getting user info after login:', error);
        }
    }

    return response;
}
export const register = async (data: LoginRequest): Promise<CustomApiResponse<AuthenticationResponse>> => {
    return await axiosConfig.post(`${api_url}/register`, data);
}
export const verifyOTP = async ({ email, otp }: { email: string; otp: string }): Promise<CustomApiResponse<LoginResponse>> => {
    const param = { email, otp }
    console.log("check param verify otp: ", email, "  " + otp);

    return await axiosConfig.get(`${api_url}/verify-account`, { params: param })
}
export const verifyOTPForResetPassword = async ({ email, otp }: { email: string; otp: string }): Promise<CustomApiResponse<any>> => {
    const param = { email, otp }
    console.log("check param verify otp for reset password: ", email, "  " + otp);
    return await axiosConfig.get(`${api_url}/validate-otp`, { params: param })
}
export const resendOTP = async (email: string): Promise<CustomApiResponse<any>> => {
    return await axiosConfig.get(`${api_url}/send-otp-register/${email}`)
}

export const getMe = async (): Promise<any> => {
    return await axiosConfig.get(`${api_url}/getMe`)
}

/**
 * Refresh access token bằng refresh token
 */
export const refreshToken = async (refreshToken: string): Promise<any> => {
    try {
        const response = await axiosConfig.post(`${api_url}/refresh-token`, {
            refreshToken: refreshToken
        });

        // Lưu token mới nếu thành công
        if (response.data?.accessToken && response.data?.refreshToken) {
            await TokenService.setTokens(response.data.accessToken, response.data.refreshToken, response.data.userId);
            store.dispatch(setTokens({
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken,
            }));
        }

        return response;
    } catch (error) {
        // Nếu refresh token thất bại, xóa tất cả token
        await logout();
        throw error;
    }
}

/**
 * Logout user và xóa tất cả token
 */
export const logout = async (): Promise<void> => {
    try {
        // Gọi API logout nếu có
        const refreshToken = await TokenService.getRefreshToken();
        if (refreshToken) {
            await axiosConfig.post(`${api_url}/logout?refreshToken=${refreshToken}`);
        }
    } catch (error) {
        console.error('Error calling logout API:', error);
        // Vẫn tiếp tục clear token dù API thất bại
    } finally {
        // Xóa token khỏi AsyncStorage và Redux store
        await TokenService.clearTokens();
        store.dispatch(clearTokens());
    }
}

/**
 * Kiểm tra xem user có đang đăng nhập không
 */
export const isAuthenticated = async (): Promise<boolean> => {
    try {
        const { accessToken, refreshToken } = await TokenService.getTokens();
        return !!(accessToken && refreshToken);
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}

/**
 * Load tokens từ AsyncStorage vào Redux store
 * Gọi khi app khởi động
 */
export const loadTokensFromStorage = async (): Promise<void> => {
    try {
        const { accessToken, refreshToken } = await TokenService.getTokens();
        if (accessToken && refreshToken) {
            store.dispatch(setTokens({
                accessToken,
                refreshToken
            }));
        }
    } catch (error) {
        console.error('Error loading tokens from storage:', error);
    }
}

/**
 * Gửi yêu cầu reset password
 */
export const resetPasswordRequest = async (email: string): Promise<CustomApiResponse<any>> => {
    return await axiosConfig.get(`${api_url}/send-otp-reset-password/${email}`);
}

/**
 * Reset password với token
 */
export const resetPassword = async (data: ResetPasswordRequest): Promise<CustomApiResponse<any>> => {
    return await axiosConfig.post(`${api_url}/reset-password`, data);
}
