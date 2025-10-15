import { useCallback, useEffect, useState } from "react";
import { getAppointment, getDoctorByDateAndTimeSlot } from "../services/schedule.service"
import { Appointment, DoctorClientResponse, EventSocketAppointment, GetAppointmentRequest } from "../types/appointment";
import { useWebSocketContext } from "../contexts";
import { SOCKET_ACTIONS } from "../constants/eventSocket";
const useAppointment = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [doctors, setDoctors] = useState<DoctorClientResponse[]>([]);
    const { isConnected: connected, send, subscribe } = useWebSocketContext();
    // Subscribe to WebSocket messages
    useEffect(() => {
        const handleMessage = (data: any) => {
            console.log("📩 Chat message received", data);
            const action = data.action || data;
            const messageData = data.data || data;
            switch (action) {
                case SOCKET_ACTIONS.APPOINTMENT:
                    console.log("📅 Appointment action received", messageData);
                    break;
                default:
                    console.log("⚠️ Unknown action", action, data);
            }
        };

        const unsubscribe = subscribe(handleMessage);
        return unsubscribe;
    }, [subscribe]);
    const handleGetAppointments = async (req: GetAppointmentRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAppointment(req.patientId, req.consultationType, req.page, req.size, req.startTime, req.endTime);
            console.log("check response get appointment", response);
            setAppointments(response.data.content);
        } catch (err) {
            console.error("Failed to fetch appointments:", err);
            setError("Failed to fetch appointments");
        } finally {
            setLoading(false);
        }
    }
    const handleSendSocketEventAppointment = useCallback((data: EventSocketAppointment) => {
        send(SOCKET_ACTIONS.APPOINTMENT, data);
        setLoading(false);
    }, []);
    const handleGetDoctorByDateAndTimeSlot = async (date: string, timeSlotId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getDoctorByDateAndTimeSlot(date, timeSlotId);
            console.log("check response get doctor by date and time slot", response);
            setDoctors(response.data);
        } catch (err) {
            console.error("Failed to fetch appointments:", err);
            setError("Failed to fetch appointments");
        } finally {
            setLoading(false);
        }
    }
    return {
        handleGetAppointments,
        handleSendSocketEventAppointment,
        handleGetDoctorByDateAndTimeSlot,
        appointments,
        loading,
        error,
        doctors
    }
}

export default useAppointment;