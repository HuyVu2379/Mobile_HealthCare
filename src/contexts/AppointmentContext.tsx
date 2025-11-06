import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { getAppointment, getDoctorByDateAndTimeSlot } from '../services/schedule.service';
import { Appointment, Doctor, EventSocketAppointment, GetAppointmentRequest } from '../types/appointment';
import { useWebSocketContext } from './WebSocketContext';
import { SOCKET_ACTIONS } from '../constants/eventSocket';
import { AppointmentAction, AppointmentActionLabels } from '../types/appointment';
import Toast from 'react-native-toast-message';

interface AppointmentContextType {
    appointments: Appointment[];
    loading: boolean;
    error: string | null;
    doctors: Doctor[];
    refresh: boolean;
    handleGetAppointments: (req: GetAppointmentRequest) => Promise<void>;
    handleSendSocketEventAppointment: (data: EventSocketAppointment, onSuccess?: () => void) => void;
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
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [pendingCallbacks, setPendingCallbacks] = useState<Map<string, () => void>>(new Map());

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

                        // Execute pending callback if exists
                        // Try with new appointmentId first, then fallback to 'new' for creation events
                        const callbackKeyWithId = `${messageData.eventType}_${messageData.appointmentId}`;
                        const callbackKeyNew = `${messageData.eventType}_new`;

                        setPendingCallbacks(prev => {
                            let callback = prev.get(callbackKeyWithId);
                            let usedKey = callbackKeyWithId;

                            // For new appointments, the key was stored with 'new'
                            if (!callback && messageData.eventType === 'BOOKING_APPOINTMENT') {
                                callback = prev.get(callbackKeyNew);
                                usedKey = callbackKeyNew;
                            }

                            if (callback) {
                                console.log("🎯 Executing success callback for:", usedKey);
                                callback();
                                const newMap = new Map(prev);
                                newMap.delete(usedKey);
                                return newMap;
                            } else {
                                console.log("⚠️ No callback found for keys:", callbackKeyWithId, "or", callbackKeyNew);
                            }
                            return prev;
                        });
                    } else {
                        const eventLabel = messageData.eventType && AppointmentActionLabels[messageData.eventType as AppointmentAction]
                            ? AppointmentActionLabels[messageData.eventType as AppointmentAction]
                            : messageData.eventType || "Thao tác lịch hẹn";

                        Toast.show({
                            type: "error",
                            text1: `${eventLabel} thất bại`,
                            text2: messageData.message || messageData.error || "Có lỗi xảy ra, vui lòng thử lại",
                        });

                        // Clean up pending callback on failure - try both keys
                        const callbackKeyWithId = `${messageData.eventType}_${messageData.appointmentId}`;
                        const callbackKeyNew = `${messageData.eventType}_new`;
                        setPendingCallbacks(prev => {
                            const newMap = new Map(prev);
                            newMap.delete(callbackKeyWithId);
                            newMap.delete(callbackKeyNew);
                            return newMap;
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

    const handleSendSocketEventAppointment = useCallback((data: EventSocketAppointment, onSuccess?: () => void) => {
        console.log("📤 Sending appointment event:", data);
        send(SOCKET_ACTIONS.APPOINTMENT, data);

        // Store callback if provided
        if (onSuccess) {
            const callbackKey = `${data.event}_${data.appointmentId || 'new'}`;
            console.log("💾 Storing callback for:", callbackKey);
            setPendingCallbacks(prev => {
                const newMap = new Map(prev);
                newMap.set(callbackKey, onSuccess);
                return newMap;
            });
        }
    }, [send]);

    const handleGetDoctorByDateAndTimeSlot = useCallback(async (date: string, timeSlotId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getDoctorByDateAndTimeSlot(date, timeSlotId);
            console.log("check doctor by date and time slot: ", response.data);

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
