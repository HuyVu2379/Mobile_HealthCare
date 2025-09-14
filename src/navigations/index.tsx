import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import ROUTING from "../constants/routing";
import { RootStackParamList } from "./type";
import { LandingScreen, LoginScreen, RegisterScreen, ChatbotScreen } from "../screens";
const Stack = createNativeStackNavigator<RootStackParamList>();

function NavigationApp() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={ROUTING.HOME}
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name={ROUTING.HOME} component={LandingScreen} options={{ headerShown: false }} />
                <Stack.Screen name={ROUTING.LOGIN} component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name={ROUTING.REGISTER} component={RegisterScreen} options={{ headerShown: false }} />
                <Stack.Screen name={ROUTING.CHATBOT} component={ChatbotScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}