import React, { useContext, useEffect, useState } from 'react';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { AppContext} from '../context/SpotifyContext';
import { StyleSheet, View, Alert } from "react-native";
import { Button, Text } from '@rneui/themed';
import { TempoContext } from '../context/TempoContext';

export const AuthenticateScreen = () => {
    const { isConnected, authenticate, error } = useContext(AppContext);
    const {loading} = useContext(TempoContext);
    const [connecting, setConnecting] = useState(false);

    const handleClick = () => {
        setConnecting(true);
        authenticate();
    }

    useEffect(() => {
        if(isConnected) {
            setConnecting(false);
        }
    },[isConnected])

    useEffect(() => {
        if(error) {
            setConnecting(false);
            Alert.alert('Spotify must be playing in the background')
        }
    },[error])

    return (
        <View style={styles.container}>
            <Button onPress={handleClick} loading={connecting} title="Connect to Spotify" />
            <>
                <Text>{Constants.expoConfig?.version} - {Constants.nativeAppVersion} ({Updates.releaseChannel})</Text>
                <Text>{Updates.updateId}</Text>
                {loading && 
                    <Text>Downloading tempo...</Text>
                }  
            </>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
