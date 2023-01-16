import React, { useContext } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { LinearProgress, Text } from '@rneui/themed';
import { AppContext } from "../context/SpotifyContext";

export const ConnectionBar = () => {
    const { isConnected } = useContext(AppContext);
  
    return (
        <View style={[styles.container, {
                backgroundColor: isConnected ? 'lightgreen' : 'red',
                height: isConnected ? 0 : 15
            }]}
        >
            <Text>{isConnected ? 'connected' : 'disconnected'}</Text>
      </View>
  )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
  