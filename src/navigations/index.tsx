import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import ROUTING from "../constants/routing";
import { RootStackParamList } from "./type";
import { LandingScreen, LoginScreen, RegisterScreen, ChatbotScreen, HealthFormScreen, AppointmentHistoryScreen, WebSocketTestScreen } from "../screens";
import { AuthProvider } from "../contexts/AuthContext";
const Stack = createNativeStackNavigator<RootStackParamList>();

function NavigationApp() {
    return (
        <NavigationContainer>
            <AuthProvider>
                <Stack.Navigator
                    initialRouteName={ROUTING.LOGIN}
                    screenOptions={{ headerShown: false }}
                >
                    <Stack.Screen name={ROUTING.HOME} component={LandingScreen} options={{ headerShown: false }} />
                    <Stack.Screen name={ROUTING.LOGIN} component={LoginScreen} options={{ headerShown: false }} />
                    <Stack.Screen name={ROUTING.REGISTER} component={RegisterScreen} options={{ headerShown: false }} />
                    <Stack.Screen name={ROUTING.CHATBOT} component={ChatbotScreen} options={{ headerShown: false }} />
                    <Stack.Screen name={ROUTING.PREDICT} component={HealthFormScreen} options={{ headerShown: false }} />
                    <Stack.Screen name={ROUTING.APPOINTMENT} component={AppointmentHistoryScreen} options={{ headerShown: false }} />
                    <Stack.Screen name={ROUTING.SOCKET_TEST} component={WebSocketTestScreen} options={{ headerShown: false }} />
                </Stack.Navigator>
            </AuthProvider>
        </NavigationContainer>
    )
}

export default NavigationApp;