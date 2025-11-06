export interface HealthMetricPanelResponse {
    measuredAt: string;
    metrics: Item[];
}

type Item = {
    name: string;
    value: string;
    unit: string;
}

export interface RecordResponse {
    records: Record[];
    pagination: Pagination;
}

export interface Pagination {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageSize: number;
}

export interface Record {
    recordId: String,
    appointmentId: String,
    patientId: String,
    doctorId: String,
    doctorName: String,
    patient: PatientResponse,
    serviceName: String;
    diagnosis: String;
    symptoms: String;
    treatment: String;
    doctorNote: String;
    followUpDate: String;
    imageAttachments: String[];
    signatureUrl: String;
    stage: String;
    statusHealth: String;
    createdAt: String;
    updatedAt: String;
    prescriptions: PrescriptionResponse[];
}

export interface PatientResponse {
    userId: String;
    email: String;
    fullName: String;
    phone: String;
    avatarUrl: String
}

export interface PrescriptionResponse {
    prescriptionId: String;
    medicalName: String;
    dosage: String;
    frequency: Frequency;
    notes: String;
    duration: String;
    startDate: String;
    endDate: String;
}
enum Frequency {
    MORNING, AFTERNOON, EVENING
}