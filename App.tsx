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

import { TempofyProvider } from "./src/TempofyContext";

const App = () => {
  return (
    <View style={styles.container}>
      <TempofyProvider>
        {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
        <AppNavigator />
        <ConnectionBar />
      </TempofyProvider>
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
