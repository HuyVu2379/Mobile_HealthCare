import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import ROUTING from "../constants/routing";
import { RootStackParamList } from "./type";
import {
    LandingScreen,
    LoginScreen,
    RegisterScreen,
    ResetPasswordScreen,
    ChangePasswordScreen,
    VerifyOTPScreen,
    ChatbotScreen,
    HealthFormScreen,
    AppointmentHistoryScreen,
    ConversationListScreen,
    VideoCallScreen
} from "../screens";
import MedicalRecordDetailScreen from "../screens/MedicalRecordDetailScreen";
import ChatScreen from "../screens/ChatScreen";
import { AuthProvider, AppointmentProvider, ChatProvider } from "../contexts";
import BottomTabNavigator from "./BottomTabNavigator";

const Stack = createNativeStackNavigator<RootStackParamList>();

function NavigationApp() {
    return (
        <NavigationContainer>
            <AuthProvider>
                <AppointmentProvider>
                    <ChatProvider>
                        <Stack.Navigator
                            initialRouteName={ROUTING.LOGIN}
                            screenOptions={{ headerShown: false }}
                        >
                            <Stack.Screen name={ROUTING.HOME} component={LandingScreen} options={{ headerShown: false }} />
                            <Stack.Screen name={ROUTING.LOGIN} component={LoginScreen} options={{ headerShown: false }} />
                            <Stack.Screen name={ROUTING.REGISTER} component={RegisterScreen} options={{ headerShown: false }} />
                            <Stack.Screen name={ROUTING.RESET_PASSWORD} component={ResetPasswordScreen} options={{ headerShown: false }} />
                            <Stack.Screen name={ROUTING.CHANGE_PASSWORD} component={ChangePasswordScreen} options={{ headerShown: false }} />
                            <Stack.Screen name={ROUTING.OTP} component={VerifyOTPScreen} options={{ headerShown: false }} />
                            <Stack.Screen name={ROUTING.CHATBOT} component={ChatbotScreen} options={{ headerShown: false }} />
                            <Stack.Screen name={ROUTING.CHAT_WITH_DOCTOR} component={ConversationListScreen} options={{ headerShown: false }} />
                            <Stack.Screen name={ROUTING.PREDICT} component={HealthFormScreen} options={{ headerShown: false }} />
                            <Stack.Screen name={ROUTING.APPOINTMENT} component={AppointmentHistoryScreen} options={{ headerShown: false }} />
                            <Stack.Screen name={ROUTING.BOTTOM_TAB} component={BottomTabNavigator} options={{ headerShown: false }} />
                            <Stack.Screen name={ROUTING.MEDICAL_RECORD_DETAIL} component={MedicalRecordDetailScreen} options={{ headerShown: false }} />
                            <Stack.Screen name={ROUTING.CHAT} component={ChatScreen} options={{ headerShown: false }} />
                            <Stack.Screen name={ROUTING.VIDEO_CALL} component={VideoCallScreen} options={{ headerShown: false }} />
                        </Stack.Navigator>
                    </ChatProvider>
                </AppointmentProvider>
            </AuthProvider>
        </NavigationContainer>
    )
}

export default NavigationApp;