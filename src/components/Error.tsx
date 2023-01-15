import React from "react";
import { Text, StyleSheet, View } from "react-native";

type Props = {
  message: string;
}

export const ErrorScreen = ({message}: Props) => {
  return (
      <View style={styles.container}>
          <Text>{message}</Text>
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
  