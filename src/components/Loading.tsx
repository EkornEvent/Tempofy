import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Background } from "./Background";

export const LoadingScreen = () => {
  return (
      <Background style={styles.container}>
          <ActivityIndicator />
      </Background>
  )
}

const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
});
  