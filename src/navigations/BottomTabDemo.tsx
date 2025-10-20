import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './BottomTabNavigator';

/**
 * Standalone Bottom Tab Navigation Demo
 * 
 * Để test Bottom Navigation độc lập, bạn có thể thay thế component NavigationApp
 * trong App.tsx bằng component này:
 * 
 * import BottomTabDemo from './src/navigations/BottomTabDemo';
 * 
 * function App() {
 *   return <BottomTabDemo />;
 * }
 */

const BottomTabDemo = () => {
    return (
        <NavigationContainer>
            <BottomTabNavigator />
        </NavigationContainer>
    );
};

export default BottomTabDemo;
