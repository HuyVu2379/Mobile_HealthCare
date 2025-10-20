import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { getAppointment, getDoctorByDateAndTimeSlot } from '../services/schedule.service';
import { Appointment, DoctorClientResponse, EventSocketAppointment, GetAppointmentRequest } from '../types/appointment';
import { useWebSocketContext } from './WebSocketContext';
import { SOCKET_ACTIONS } from '../constants/eventSocket';
import { AppointmentAction, AppointmentActionLabels } from '../types/appointment';
import Toast from 'react-native-toast-message';

interface AppointmentContextType {
    appointments: Appointment[];
    loading: boolean;
    error: string | null;
    doctors: DoctorClientResponse[];
    refresh: boolean;
    handleGetAppointments: (req: GetAppointmentRequest) => Promise<void>;
    handleSendSocketEventAppointment: (data: EventSocketAppointment) => void;
    handleGetDoctorByDateAndTimeSlot: (date: string, timeSlotId: number) => Promise<void>;
}

const AppointmentContext = createContext<AppointmentContextType | null>(null);

interface AppointmentProviderProps {
    children: ReactNode;
}

export const AppointmentProvider: React.FC<AppointmentProviderProps> = ({ children }) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [doctors, setDoctors] = useState<DoctorClientResponse[]>([]);
    const [refresh, setRefresh] = useState<boolean>(false);

    const { isConnected: connected, send, subscribe } = useWebSocketContext();

    // Subscribe to WebSocket messages - CHỈ MỘT LẦN cho toàn bộ app
    useEffect(() => {
        console.log("🔗 AppointmentProvider: Setting up WebSocket subscription");
        console.log("📊 Current WebSocket status - connected:", connected);

        const handleMessage = (data: any) => {
            console.log("=".repeat(80));
            console.log("📩 AppointmentContext - Message received!");
            console.log("📦 Raw data:", JSON.stringify(data, null, 2));
            console.log("=".repeat(80));

            const action = data.action || data;
            const messageData = data.data || data;

            console.log("🎯 Parsed action:", action);
            console.log("🔍 Expected:", SOCKET_ACTIONS.APPOINTMENT_RESPONSE);
            console.log("✅ Match:", action === SOCKET_ACTIONS.APPOINTMENT_RESPONSE);

            switch (action) {
                case SOCKET_ACTIONS.APPOINTMENT_RESPONSE:
                    if (messageData.success) {
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
        console.log("✅ AppointmentProvider: Subscription created");

        return () => {
            console.log("🔌 AppointmentProvider: Unsubscribing");
            unsubscribe();
        };
    }, [subscribe, connected]);

    const handleGetAppointments = useCallback(async (req: GetAppointmentRequest) => {
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
    }, []);

    const handleSendSocketEventAppointment = useCallback((data: EventSocketAppointment) => {
        console.log("📤 Sending appointment event:", data);
        send(SOCKET_ACTIONS.APPOINTMENT, data);
    }, [send]);

    const handleGetDoctorByDateAndTimeSlot = useCallback(async (date: string, timeSlotId: number) => {
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
    }, []);

    const value: AppointmentContextType = {
        appointments,
        loading,
        error,
        doctors,
        refresh,
        handleGetAppointments,
        handleSendSocketEventAppointment,
        handleGetDoctorByDateAndTimeSlot,
    };

    return (
        <AppointmentContext.Provider value={value}>
            {children}
        </AppointmentContext.Provider>
    );
};

export const useAppointmentContext = (): AppointmentContextType => {
    const context = useContext(AppointmentContext);
    if (!context) {
        throw new Error('useAppointmentContext must be used within an AppointmentProvider');
    }
    return context;
};
