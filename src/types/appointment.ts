
export interface GetAppointmentRequest {
    patientId: string;
    consultationType: string;
    page: number;
    size: number;
    startTime: string;
    endTime: string;
}

export interface Appointment {
    appointmentId: String;
    appointmentDate: String;
    consultationType: ConsultationType;
    symptoms: String;
    status: AppointmentStatusEnum;
    note: String;
    hasPredict: Boolean
    addressDetail: String;
    doctor: Doctor;
    patient: Patient;
    timeSlot: TimeSlot;
}

export interface Doctor {
    doctorId: String;
    email: String;
    fullName: String;
    phoneNumber: String;
    speciatly: String;
    avatarUrl: String;
    clinicAddress: String;
    experienceYears: Number;
}

export interface Patient {
    userId: String;
    email: String;
    phone: String;
    fullName: String;
    avatarUrl: String;
}

export interface TimeSlot {
    startTime: String;
    endTime: String;
    slotId: number;
}

export enum ConsultationType {
    ALL = "Tất cả",
    DIRECT_CONSULTATION = "Khám trực tiếp",
    ONLINE_CONSULTATION = "Tư vấn trực tuyến",
    LAB_TEST = "Xét nghiệm",
    FOLLOW_UP = "Tái khám"
}
export enum AppointmentStatusEnum {
    PENDING = "Đang chờ",
    CONFIRMED = "Đã xác nhận",
    CANCELED = "Đã hủy",
    REJECTED = "Đã từ chối",
    COMPLETED = "Đã hoàn thành",
    NO_SHOW = "Không đến",
    RESCHEDULED = "Đã lên lịch lại"
}

export interface EventSocketAppointment {
    appointmentId: String | null;
    patientId: String | null;
    doctorId: String | null;
    event: ScheduleSocketEvent | null;
    status: AppointmentStatusEnum | null;
    createAppointmentRequest: any | null;
    updateAppointmentRequest: any | null;
}

enum ScheduleSocketEvent {
    BOOKING_APPOINTMENT,
    UPDATE_APPOINTMENT_STATUS,
    RESCHEDULE_APPOINTMENT,
    CANCEL_APPOINTMENT,
}

export interface CreateAppointmentRequest {
    patientId: string;
    scheduleId: string;
    doctorId: string;
    symptoms: string;
    note: string;
    slotId: number;
    status: AppointmentStatusEnum;
    consultationType: ConsultationType;
    addressDetail: string;
}

export interface UpdateAppointmentRequest {
    appointmentId: string;
    oldScheduleId: string;
    newScheduleId: string;
    oldSlotId: number | null;
    newSlotId: number | null;
}

export interface DoctorClientResponse {
    doctorId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    specialty: string;
    experienceYears: number;
    avatarUrl: string;
    clinicAddress: string;
}