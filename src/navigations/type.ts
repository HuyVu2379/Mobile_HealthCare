import ROUTING from "../constants/routing";
export type RootStackParamList = {
    [ROUTING.HOME]: undefined;
    [ROUTING.LOGIN]: undefined;
    [ROUTING.REGISTER]: undefined;
    [ROUTING.PROFILE]: undefined;
    [ROUTING.OTP]: { phoneNumber: string };
    [ROUTING.CHATBOT]: undefined;
    [ROUTING.APPOINTMENT]: undefined;
    [ROUTING.PREDICT]: undefined;
    [ROUTING.SOCKET_TEST]: undefined;
    [ROUTING.BOTTOM_TAB]: undefined;
};

export type BottomTabParamList = {
    [ROUTING.PERSONAL_INFO]: undefined;
    [ROUTING.TEST_HISTORY]: undefined;
    [ROUTING.MEDICAL_RECORD]: undefined;
};