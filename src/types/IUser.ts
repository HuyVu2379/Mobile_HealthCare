export type LoginRequest = { email: string; password: string };
export type AuthenticationResponse = {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
}