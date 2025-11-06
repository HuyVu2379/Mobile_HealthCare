import { useVideoCall as useVideoCallContext } from '../contexts/VideoCallContext';

/**
 * Custom hook để sử dụng video call
 * Wrapper around VideoCallContext để dễ sử dụng
 */
export const useVideoCall = () => {
    return useVideoCallContext();
};
