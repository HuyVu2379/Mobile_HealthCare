import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import ROUTING from "../constants/routing";
import { RootStackParamList } from "./type";
import { LandingScreen, LoginScreen, RegisterScreen, ChatbotScreen, HealthFormScreen, AppointmentHistoryScreen, WebSocketTestScreen } from "../screens";
import { AuthProvider, AppointmentProvider } from "../contexts";
import BottomTabNavigator from "./BottomTabNavigator";

const Stack = createNativeStackNavigator<RootStackParamList>();

function NavigationApp() {
    return (
        <NavigationContainer>
            <AuthProvider>
                <AppointmentProvider>
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
                        <Stack.Screen name={ROUTING.BOTTOM_TAB} component={BottomTabNavigator} options={{ headerShown: false }} />
                    </Stack.Navigator>
                </AppointmentProvider>
            </AuthProvider>
        </NavigationContainer>
    )
}

export default NavigationApp;