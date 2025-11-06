import ROUTING from "../constants/routing";
import { Record } from "../types/healthRecord";

export type RootStackParamList = {
    [ROUTING.HOME]: undefined;
    [ROUTING.LOGIN]: undefined;
    [ROUTING.REGISTER]: undefined;
    [ROUTING.PROFILE]: undefined;
    [ROUTING.OTP]: { phoneNumber: string };
    [ROUTING.CHATBOT]: undefined;
    [ROUTING.CHAT_WITH_DOCTOR]: undefined;
    [ROUTING.CHAT]: { groupId: string; groupName: string };
    [ROUTING.APPOINTMENT]: undefined;
    [ROUTING.PREDICT]: undefined;
    [ROUTING.SOCKET_TEST]: undefined;
    [ROUTING.BOTTOM_TAB]: undefined;
    [ROUTING.MEDICAL_RECORD_DETAIL]: { record: Record };
    [ROUTING.VIDEO_CALL]: {
        mode: 'create' | 'join';
        roomId?: string;
        appointmentId?: string;
        doctorName?: string;
    };
};

export type BottomTabParamList = {
    [ROUTING.PERSONAL_INFO]: undefined;
    [ROUTING.TEST_HISTORY]: undefined;
    [ROUTING.MEDICAL_RECORD]: undefined;
};