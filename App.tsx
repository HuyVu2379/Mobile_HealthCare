/**
 * Mobile Healthcare App
 * Registration Screen Demo
 *
 * @format
 */
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { enableScreens } from 'react-native-screens';
import NavigationApp from './src/navigations';
import Toast from 'react-native-toast-message';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs(false);
enableScreens();
function App() {
  return (
    <Provider store={store}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {/* Background placeholder - user will replace with their image */}
        <View style={styles.backgroundPlaceholder}>
          <NavigationApp />
          <Toast />
        </View>
      </View>
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
