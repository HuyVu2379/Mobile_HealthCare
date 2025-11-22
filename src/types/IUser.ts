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
export enum Gender {
    MALE, FEMALE, OTHER
}
export enum Role {
    PATIENT, DOCTOR, ADMIN
}
export enum Status {
    ACTIVE, INACTIVE, BLOCKED
}
export interface CertificationDto {
    id: string;
    name: string;
    issuingOrganization: string;
    yearIssued: number;
}
export interface DoctorResponse {
    userId: string;
    fullName: string;
    email: string;
    gender: Gender;
    dob: string;
    phone: string;
    address: string;
    avatarUrl: string;
    role: Role;
    status: Status;
    specialty: string;
    examinationFee: number;
    clinicAddress: string;
    rating: number;
    experienceYears: number;
    bio: string;
    certifications: CertificationDto[];
}