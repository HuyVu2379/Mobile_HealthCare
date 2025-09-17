export interface User {
    userId: string | null;
    email: string;
    fullName: string;
    gender: string;
    dob: Date;
    phone: string;
    address: string;
    avatarUrl: string;
    role: string;
    status: string;
    doctor: Doctor | null;
    patient: Patient | null;
}

export interface Doctor {
    specialty: string;
    experienceYears: number;
    bio: string;
    examinationFee: number;
    clinicAddress: string;
    rating: number;
    certifications: string[];
}

export interface Patient {
    height: number;
    weight: number;
    bloodType: string;
    bmi: number;
    insurances: Insurance[];
    allergies: Allergy[];
}

export interface Insurance {
    insuranceId: string;
    insuranceName: string;
    insuranceEndDate: Date;
    patientId: string;
}

export interface Allergy {
    allergyId: string;
    name: string;
    description: string;
    level: string;
    patientId: string;
}