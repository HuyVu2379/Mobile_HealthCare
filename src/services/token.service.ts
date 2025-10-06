import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys cho AsyncStorage
const ACCESS_TOKEN_KEY = '@healthcare_access_token';
const REFRESH_TOKEN_KEY = '@healthcare_refresh_token';
const USER_ID_KEY = '@healthcare_user_id';

export class TokenService {
    /**
     * Lưu access token vào AsyncStorage
     */
    static async setAccessToken(token: string): Promise<void> {
        try {
            await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
        } catch (error) {
            console.error('Error saving access token:', error);
            throw error;
        }
    }
    static async setUserId(userId: string): Promise<void> {
        try {
            await AsyncStorage.setItem(USER_ID_KEY, userId)
        } catch (error) {
            console.error('Error saving userId:', error);
            throw error;
        }
    }
    /**
     * Lấy access token từ AsyncStorage
     */
    static async getAccessToken(): Promise<string | null> {
        try {
            const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
            return token;
        } catch (error) {
            console.error('Error getting access token:', error);
            return null;
        }
    }

    /**
     * Lưu refresh token vào AsyncStorage
     */
    static async setRefreshToken(token: string): Promise<void> {
        try {
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
        } catch (error) {
            console.error('Error saving refresh token:', error);
            throw error;
        }
    }

    /**
     * Lấy refresh token từ AsyncStorage
     */
    static async getRefreshToken(): Promise<string | null> {
        try {
            const token = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
            return token;
        } catch (error) {
            console.error('Error getting refresh token:', error);
            return null;
        }
    }

    static async getUserId(): Promise<string | null> {
        try {
            const userId = await AsyncStorage.getItem(USER_ID_KEY);
            return userId;
        } catch (error) {
            console.error('Error getting userId:', error);
            return null;
        }
    }
    /**
     * Lưu cả access token và refresh token
     */
    static async setTokens(accessToken: string, refreshToken: string, userId: string): Promise<void> {
        try {
            await Promise.all([
                AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken),
                AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken),
                AsyncStorage.setItem(USER_ID_KEY, userId)
            ]);
        } catch (error) {
            console.error('Error saving tokens:', error);
            throw error;
        }
    }

    /**
     * Lấy cả access token và refresh token
     */
    static async getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
        try {
            const [accessToken, refreshToken] = await Promise.all([
                AsyncStorage.getItem(ACCESS_TOKEN_KEY),
                AsyncStorage.getItem(REFRESH_TOKEN_KEY)
            ]);
            return { accessToken, refreshToken };
        } catch (error) {
            console.error('Error getting tokens:', error);
            return { accessToken: null, refreshToken: null };
        }
    }

    /**
     * Xóa access token
     */
    static async removeAccessToken(): Promise<void> {
        try {
            await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
        } catch (error) {
            console.error('Error removing access token:', error);
            throw error;
        }
    }

    /**
     * Xóa refresh token
     */
    static async removeRefreshToken(): Promise<void> {
        try {
            await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        } catch (error) {
            console.error('Error removing refresh token:', error);
            throw error;
        }
    }

    /**
     * Xóa tất cả token (logout)
     */
    static async clearTokens(): Promise<void> {
        try {
            await Promise.all([
                AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
                AsyncStorage.removeItem(REFRESH_TOKEN_KEY)
            ]);
        } catch (error) {
            console.error('Error clearing tokens:', error);
            throw error;
        }
    }

    /**
     * Kiểm tra xem có token nào được lưu không
     */
    static async hasTokens(): Promise<boolean> {
        try {
            const { accessToken, refreshToken } = await this.getTokens();
            return !!(accessToken && refreshToken);
        } catch (error) {
            console.error('Error checking tokens:', error);
            return false;
        }
    }
}