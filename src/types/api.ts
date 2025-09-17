// Custom API Response Type
export interface CustomApiResponse<T = any> {
    data: T;
    statusCode: number;
    message?: string;
    success?: boolean;
    headers?: any;
    config?: any;
}

// Auth specific responses
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user?: any;
    email: string;
    userId: string;
    role: string;
}

export interface ApiSuccessResponse<T = any> extends CustomApiResponse<T> {
    success: true;
    data: T;
}

export interface ApiErrorResponse extends CustomApiResponse {
    success: false;
    message: string;
    error?: any;
}