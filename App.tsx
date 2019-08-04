/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * 
 * Generated with the TypeScript template
 * https://github.com/emin93/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Platform
} from 'react-native';

import ConnectionBar from './src/components/ConnectionBar'
import AppNavigator from './src/navigation/AppNavigator';

import { SettingsProvider } from "./src/context/SettingsContext";
import { PlayingProvider } from "./src/context/PlayingContext";

const App = () => {
  return (
    <View style={styles.container}>
      <PlayingProvider>
        <SettingsProvider>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <AppNavigator />
          <ConnectionBar />
        </SettingsProvider>
      </PlayingProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default App;
