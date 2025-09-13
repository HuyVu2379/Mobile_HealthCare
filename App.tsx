/**
 * Mobile Healthcare App
 * Registration Screen Demo
 *
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet, View, ImageBackground } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { RegisterScreen } from './src/screens';

function App() {
  const handleLoginPress = () => {
    console.log('Navigate to login screen');
    // TODO: Navigate to login screen
  };

  const handleRegisterPress = (
    email: string,
    password: string,
    agreedToTerms: boolean,
  ) => {
    console.log('Register:', { email, password, agreedToTerms });
    // TODO: Handle registration logic
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {/* Background placeholder - user will replace with their image */}
        <View style={styles.backgroundPlaceholder}>
          <RegisterScreen
            onLoginPress={handleLoginPress}
            onRegisterPress={handleRegisterPress}
          />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundPlaceholder: {
    flex: 1,
    backgroundColor: '#E3F2FD', // Light blue background as placeholder
  },
});

export default App;
