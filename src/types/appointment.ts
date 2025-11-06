
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
    doctorId: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    specialty: string;
    avatarUrl: string;
    clinicAddress: string;
    experienceYears: number;
    examinationFee: number;
    rating: number;
    bio: string;
    scheduleId: string;
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
    ALL = "ALL",
    DIRECT_CONSULTATION = "DIRECT_CONSULTATION",
    ONLINE_CONSULTATION = "ONLINE_CONSULTATION",
    LAB_TEST = "LAB_TEST",
    FOLLOW_UP = "FOLLOW_UP"
}

// Labels hiển thị cho ConsultationType
export const ConsultationTypeLabels: Record<ConsultationType, string> = {
    [ConsultationType.ALL]: "Tất cả",
    [ConsultationType.DIRECT_CONSULTATION]: "Khám trực tiếp",
    [ConsultationType.ONLINE_CONSULTATION]: "Tư vấn trực tuyến",
    [ConsultationType.LAB_TEST]: "Xét nghiệm",
    [ConsultationType.FOLLOW_UP]: "Tái khám"
};

export enum AppointmentStatusEnum {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELED = "CANCELED",
    REJECTED = "REJECTED",
    COMPLETED = "COMPLETED",
    NO_SHOW = "NO_SHOW",
    RESCHEDULED = "RESCHEDULED"
}

// Labels hiển thị cho AppointmentStatusEnum
export const AppointmentStatusLabels: Record<AppointmentStatusEnum, string> = {
    [AppointmentStatusEnum.PENDING]: "Đang chờ",
    [AppointmentStatusEnum.CONFIRMED]: "Đã xác nhận",
    [AppointmentStatusEnum.CANCELED]: "Đã hủy",
    [AppointmentStatusEnum.REJECTED]: "Đã từ chối",
    [AppointmentStatusEnum.COMPLETED]: "Đã hoàn thành",
    [AppointmentStatusEnum.NO_SHOW]: "Không đến",
    [AppointmentStatusEnum.RESCHEDULED]: "Đã lên lịch lại"
};

export interface EventSocketAppointment {
    appointmentId: String | null;
    patientId: String | null;
    doctorId: String | null;
    event: ScheduleSocketEvent | null;
    status: AppointmentStatusEnum | null;
    createAppointmentRequest: CreateAppointmentRequest | null;
    updateAppointmentRequest: UpdateAppointmentRequest | null;
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
    scheduleId: string;
}

export enum AppointmentAction {
    BOOKING_APPOINTMENT = "BOOKING_APPOINTMENT",
    UPDATE_APPOINTMENT_STATUS = "UPDATE_APPOINTMENT_STATUS",
    RESCHEDULE_APPOINTMENT = "RESCHEDULE_APPOINTMENT",
    CANCEL_APPOINTMENT = "CANCEL_APPOINTMENT"
}

// Labels hiển thị cho AppointmentAction
export const AppointmentActionLabels: Record<AppointmentAction, string> = {
    [AppointmentAction.BOOKING_APPOINTMENT]: "Đặt lịch hẹn",
    [AppointmentAction.UPDATE_APPOINTMENT_STATUS]: "Cập nhật trạng thái lịch hẹn",
    [AppointmentAction.RESCHEDULE_APPOINTMENT]: "Lên lịch lại cuộc hẹn",
    [AppointmentAction.CANCEL_APPOINTMENT]: "Hủy cuộc hẹn"
};

export enum RoomStatus {
    CREATED = "CREATED",
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}
export interface Room {
    room_id: String;
    room_name: String;
    appointmentId: String;
    doctorId: String;
    patientId: String;
    status: RoomStatus;
    createdAt: String;
    updatedAt: String;
}

export interface CreateRoomRequest {
    room_name: String;
    appointmentId: String;
    doctorId: String;
    patientId: String;
    status: RoomStatus;
}

export interface DoctorScheduleResponse {
    scheduleId: string;
    doctorId: string;
    weekDay: string;
    workDate: string;
    timeSlots: TimeSlotResponse[];
}

export interface TimeSlotResponse {
    slotId: number;
    startTime: string;
    endTime: string;
    createdAt: string;
    updatedAt: string;
}