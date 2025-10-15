import axiosConfig from "./axios.config";
const api_url_schedule = 'appointments';
const api_url_time_slots = 'time-slots';
const api_url_doctor_schedules = 'doctor-schedules';

export const getAppointment = async (userId: string, consultationType: string, page: number, size: number, startTime: string, endTime: string): Promise<any> => {
    return await axiosConfig.get(`${api_url_schedule}/get-appointment-for-patient-with-filter`, {
        params: {
            patientId: userId,
            consultationType,
            page,
            size,
            startTime,
            endTime,
        }
    });
};

export const getTimeSlots = async (): Promise<any> => {
    return await axiosConfig.get(`${api_url_time_slots}/get-time-slots`);
};

export const getDoctorByDateAndTimeSlot = async (date: string, timeSlotId: number): Promise<any> => {
    return await axiosConfig.get(`${api_url_doctor_schedules}/getDoctorByDateAndTimeSlot`, {
        params: {
            date,
            slotId: timeSlotId
        }
    });
};