import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export const LoadingScreen = () => {
  return (
      <View style={styles.container}>
          <ActivityIndicator />
      </View>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
});
  