import { useWebSocketContext } from "../contexts";
import { SOCKET_ACTIONS } from "../constants/eventSocket";
import { CreateRoomRequest, Room } from "../types/appointment";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
export const useRoom = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { isConnected: connected, send, subscribe } = useWebSocketContext();
    useEffect(() => {
        const handleMessage = (data: any) => {
            console.log("📩 Room message received:", data);

            const action = data.action || data;
            switch (action) {
                case SOCKET_ACTIONS.ROOM.CREATE_ROOM_RESPONSE:
                    if (data.status) {
                        setRooms((prevRooms) => [...prevRooms, data.data]);
                    } else {
                    }
                    break;
                case SOCKET_ACTIONS.ROOM.GET_ROOM_BY_DATE_RESPONSE:
                    if (data.status) {
                        setRooms((prevRooms) => [...prevRooms, ...data.data]);
                    } else {
                        setError("Failed to get rooms");
                        Toast.show({
                            type: "error",
                            text1: "Lấy danh sách phòng thất bại",
                            text2: data.message || data.error || "Có lỗi xảy ra, vui lòng thử lại",
                        });
                    }
                    break;
                case SOCKET_ACTIONS.ROOM.UPDATE_ROOM_STATUS_RESPONSE:
                    if (data.status) {
                        setRooms((prevRooms) =>
                            prevRooms.map((room) =>
                                room.room_id === data.room.room_id ? data.data : room
                            )
                        );
                    } else {
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
    }, [subscribe, connected])

    const handleCreateRoom = (data: CreateRoomRequest) => {
        setLoading(true);
        setError(null);
        send(SOCKET_ACTIONS.ROOM.CREATE_ROOM, data);
    }

    const handleGetRooms = (userId: string | null) => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        setRooms([]); // Reset rooms trước khi lấy dữ liệu mới
        // Format date as YYYY-MM-DD for server compatibility
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // Get only the date part (2025-10-28)
        send(SOCKET_ACTIONS.ROOM.GET_ROOM_BY_DATE, { userId, date: formattedDate });
    }
    const handleUpdateRoomStatus = (roomId: string, status: string) => {
        setLoading(true);
        setError(null);
    }
    return {
        handleCreateRoom,
        handleGetRooms,
        handleUpdateRoomStatus,
        rooms,
        loading,
        error
    }
}

