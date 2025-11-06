import { useCallback, useEffect, useState } from "react";
import { getAppointment, getDoctorByDateAndTimeSlot } from "../services/schedule.service"
import { Appointment, Doctor, EventSocketAppointment, GetAppointmentRequest } from "../types/appointment";
import { useWebSocketContext } from "../contexts";
import { SOCKET_ACTIONS } from "../constants/eventSocket";
import { AppointmentAction, AppointmentActionLabels } from "../types/appointment";
import Toast from "react-native-toast-message";

const useAppointment = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const { isConnected: connected, send, subscribe } = useWebSocketContext();
    const [refresh, setRefresh] = useState<boolean>(false);

    // Subscribe to WebSocket messages
    useEffect(() => {
        const handleMessage = (data: any) => {
            console.log("📩 Appointment message received:", data);

            const action = data.action || data;
            const messageData = data.data || data;

            switch (action) {
                case SOCKET_ACTIONS.APPOINTMENT_RESPONSE:
                    if (messageData.success) {
                        // Hiển thị thông báo thành công với label tiếng Việt
                        const eventLabel = messageData.eventType && AppointmentActionLabels[messageData.eventType as AppointmentAction]
                            ? AppointmentActionLabels[messageData.eventType as AppointmentAction]
                            : messageData.eventType || "Thao tác lịch hẹn";

                        Toast.show({
                            type: "success",
                            text1: `${eventLabel} thành công`,
                            text2: messageData.message || "Lịch hẹn đã được cập nhật",
                        });
                        setRefresh(prev => !prev);
                    } else {
                        // Hiển thị thông báo lỗi với label tiếng Việt
                        const eventLabel = messageData.eventType && AppointmentActionLabels[messageData.eventType as AppointmentAction]
                            ? AppointmentActionLabels[messageData.eventType as AppointmentAction]
                            : messageData.eventType || "Thao tác lịch hẹn";

                        Toast.show({
                            type: "error",
                            text1: `${eventLabel} thất bại`,
                            text2: messageData.message || messageData.error || "Có lỗi xảy ra, vui lòng thử lại",
                        });
                    }
                    break;
                default:
                    console.log("⚠️ Unknown appointment action:", action);
            }
        };

        const unsubscribe = subscribe(handleMessage);

        return () => {
            unsubscribe();
        };
    }, [subscribe, connected]);

    const handleGetAppointments = async (req: GetAppointmentRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAppointment(req.patientId, req.consultationType, req.page, req.size, req.startTime, req.endTime);
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
    }, [send]);

    const handleGetDoctorByDateAndTimeSlot = async (date: string, timeSlotId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getDoctorByDateAndTimeSlot(date, timeSlotId);
            setDoctors(response.data);
        } catch (err) {
            console.error("Failed to fetch doctors:", err);
            setError("Failed to fetch doctors");
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
        doctors,
        refresh
    }
}

export default useAppointment;