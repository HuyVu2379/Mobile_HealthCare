import axiosConfig from "./axios.config";
const api_url = '/auth'
import { LoginRequest } from "../types/IUser";
import { CustomApiResponse, LoginResponse } from "../types/api";
import { TokenService } from "./tokenService";
import store from "../store/store";
import { clearTokens, setTokens } from "../store/slices/userSlice";
export const login = async (data: LoginRequest): Promise<any> => {
    const response = await axiosConfig.post(`${api_url}/login`, data);
    // Nếu login thành công và có token, lưu vào AsyncStorage
    if (response.data?.accessToken && response.data?.refreshToken) {
        await TokenService.setTokens(response.data.accessToken, response.data.refreshToken);
        store.dispatch(setTokens({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken
        }));
    }

    return response;
}

export const verifyOTP = async ({ email, otp }: { email: string; otp: string }): Promise<CustomApiResponse<LoginResponse>> => {
    const param = { email, otp }
    return await axiosConfig.post(`${api_url}/verify-account`, param)
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
            await TokenService.setTokens(response.data.accessToken, response.data.refreshToken);
            store.dispatch(setTokens({
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken
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
            await axiosConfig.post(`${api_url}/logout`, {
                refreshToken: refreshToken
            });
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
