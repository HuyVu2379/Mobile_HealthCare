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
};