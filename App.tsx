/**
 * Mobile Healthcare App
 * Registration Screen Demo
 *
 * @format
 */

// Import polyfills first (IMPORTANT: Must be imported before any other modules)
import './src/utils/polyfills';

import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { enableScreens } from 'react-native-screens';
import NavigationApp from './src/navigations';
import Toast from 'react-native-toast-message';
import { WebSocketTestScreen } from './src/screens';
import { LogBox } from 'react-native';
import { WebSocketProvider } from './src/contexts/WebSocketContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

LogBox.ignoreAllLogs(false);
enableScreens();

function App() {
  return (
    <Provider store={store}>
      <WebSocketProvider>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.container}>
          <SafeAreaView style={styles.backgroundPlaceholder}>
            <NavigationApp />
            <Toast />
          </SafeAreaView>
        </View>
      </WebSocketProvider>
    </Provider>
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
