import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { Background } from "./Background";

type Props = {
  message: string;
}

export const ErrorScreen = ({message}: Props) => {
  return (
      <Background style={styles.container}>
          <Text>{message}</Text>
      </Background>
  )
}

const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
});
  