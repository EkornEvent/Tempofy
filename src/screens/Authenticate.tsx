import React, { useContext, useEffect, useState } from 'react';

import { AppContext} from '../context/SpotifyContext';
import { StyleSheet, View, Alert } from "react-native";
import { Button, Text } from '@rneui/themed';

export const AuthenticateScreen = () => {
    const { isConnected, authenticate, error } = useContext(AppContext);
    const [loading, setLoading] = useState(false);

    const handleClick = () => {
        setLoading(true);
        authenticate();
    }

    useEffect(() => {
        if(isConnected) {
            setLoading(false);
        }
    },[isConnected])

    useEffect(() => {
        if(error) {
            setLoading(false);
            Alert.alert('Spotify must be playing in the background')
        }
    },[error])

    return (
        <View style={styles.container}>
            <Button onPress={handleClick} loading={loading} title="Connect to Spotify" />
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
