import axios, { AxiosInstance } from 'axios';
import { Alert } from 'react-native';
import store from '../store/store';
import { TokenService } from './token.service';
import { setTokens, clearTokens } from '../store/slices/userSlice';
const API_URL = 'http://10.0.2.2:8080/api/v1';

const axiosConfig: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 15000
})

axiosConfig.interceptors.request.use(
    async (config) => {
        try {
            const state = store.getState();
            const accessToken = state.user.accessToken || null;
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
            return config;
        } catch (error) {
            return Promise.reject(error);
        }
    },
    (error) => {
        return Promise.reject(error);
    }
)

// Flag để tránh multiple refresh token calls
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

axiosConfig.interceptors.response.use(
    (response) => {
        // Custom response để thêm statusCode
        const customResponse = {
            ...response.data,
            statusCode: response.status, // Thêm statusCode từ response.status
            status: response.status,     // Giữ nguyên status gốc
            headers: response.headers,
            config: response.config
        };
        return customResponse;
    },
    async (error) => {
        const originalRequest = error.config;

        // Kiểm tra nếu lỗi 401 (Unauthorized) và chưa retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Nếu đang refresh token, thêm request vào queue
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosConfig(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await TokenService.getRefreshToken();

                if (!refreshToken) {
                    // Không có refresh token, logout user
                    store.dispatch(clearTokens());
                    await TokenService.clearTokens();
                    processQueue(error, null);
                    return Promise.reject(error);
                }

                // Gọi API refresh token
                const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                    refreshToken: refreshToken
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                // Lưu token mới
                await TokenService.setAccessToken(accessToken);
                await TokenService.setRefreshToken(newRefreshToken);
                store.dispatch(setTokens({ accessToken, refreshToken: newRefreshToken }));

                // Cập nhật header cho request gốc
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                processQueue(null, accessToken);

                return axiosConfig(originalRequest);
            } catch (refreshError) {
                // Refresh token thất bại, logout user
                store.dispatch(clearTokens());
                await TokenService.clearTokens();
                processQueue(refreshError, null);

                // Có thể thêm navigation để chuyển về màn hình login
                Alert.alert('Phiên đăng nhập hết hạn', 'Vui lòng đăng nhập lại');

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Nếu lỗi ở tầng HTTP khác (timeout, 500, không connect được…)
        return Promise.reject(error);
    },
);

export default axiosConfig;