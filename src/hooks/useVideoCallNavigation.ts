import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import ROUTING from '../constants/routing';

/**
 * Helper hook để navigate đến VideoCallScreen
 * Sử dụng trong các components khác để dễ dàng tích hợp video call
 */
export const useVideoCallNavigation = () => {
    const navigation = useNavigation();

    /**
     * Navigate để tạo phòng mới (cho bác sĩ)
     */
    const createVideoCall = useCallback(() => {
        (navigation.navigate as any)(ROUTING.VIDEO_CALL, {
            mode: 'create',
        });
    }, [navigation]);

    /**
     * Navigate để join phòng (cho bệnh nhân)
     * @param roomId - ID của phòng cần join
     * @param appointmentId - ID của cuộc hẹn (optional)
     * @param doctorName - Tên bác sĩ (optional)
     */
    const joinVideoCall = useCallback((
        roomId: string,
        appointmentId?: string,
        doctorName?: string
    ) => {
        (navigation.navigate as any)(ROUTING.VIDEO_CALL, {
            mode: 'join',
            roomId,
            appointmentId,
            doctorName,
        });
    }, [navigation]);

    return {
        createVideoCall,
        joinVideoCall,
    };
};
