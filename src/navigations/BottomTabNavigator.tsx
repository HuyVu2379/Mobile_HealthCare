import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { Platform } from 'react-native';

// Import screens
import PersonalInfoScreen from '../screens/PersonalInfoScreen';
import TestHistoryScreen from '../screens/TestHistoryScreen';
import MedicalRecordScreen from '../screens/MedicalRecordScreen';

// Type definitions
export type BottomTabParamList = {
    PersonalInfo: undefined;
    TestHistory: undefined;
    MedicalRecord: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            initialRouteName="PersonalInfo"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#E5E5EA',
                    height: Platform.OS === 'ios' ? 88 : 60,
                    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen
                name="PersonalInfo"
                component={PersonalInfoScreen}
                options={{
                    tabBarLabel: 'Thông tin',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Icon
                            name={focused ? 'person' : 'person-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tab.Screen
                name="TestHistory"
                component={TestHistoryScreen}
                options={{
                    tabBarLabel: 'Xét nghiệm',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Icon
                            name={focused ? 'flask' : 'flask-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tab.Screen
                name="MedicalRecord"
                component={MedicalRecordScreen}
                options={{
                    tabBarLabel: 'Hồ sơ',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Icon
                            name={focused ? 'document-text' : 'document-text-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
