import React, { useContext, useEffect, useState } from 'react';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { AppContext} from '../context/SpotifyContext';
import { StyleSheet, Alert, Modal, Image, View } from "react-native";
import { Button, Text } from '@rneui/themed';
import { TempoContext } from '../context/TempoContext';
import { Background } from '../components/Background';
import analytics from '@react-native-firebase/analytics';

export const AuthenticateScreen = () => {
    const { isConnected, authenticate, error } = useContext(AppContext);
    const {loading} = useContext(TempoContext);
    const [connecting, setConnecting] = useState(false);
    const [visible, setVisible] = useState(false);

    const handleClick = () => {
        setConnecting(true);
        authenticate();
        analytics().logEvent('connect_spotify');
    }

    useEffect(() => {
        if(isConnected) {
            setConnecting(false);
        }
        setTimeout(() => {
            setVisible(!isConnected);
        },500);
    },[isConnected])

    useEffect(() => {
        if(error) {
            setConnecting(false);
            Alert.alert('Spotify must be playing in the background')
        }
    },[error])
    
    return (
        <Modal
            animationType="slide"
            presentationStyle="overFullScreen"
            supportedOrientations={["portrait","landscape"]}
            visible={visible}
        >
            <Background style={styles.container}>
                <View style={styles.top}>
                    <Image
                        style={styles.logo}
                        source={require('../../assets/transparent-icon.png')}
                    />
                </View>
                <View style={styles.center}>
                    <Text h1>Tempofy</Text>
                    {!isConnected &&
                    <Button 
                        onPress={handleClick} 
                        loading={connecting} 
                        title="Connect to Spotify"
                        icon={{
                            name: 'spotify',
                            type: 'font-awesome'
                        }}
                        iconRight
                    />
                    }
                    <Text>{loading ? "Downloading tempo..." : ""}</Text>
                </View>
                <View style={styles.bottom}>
                    <Text>{Constants.expoConfig?.version} - {Constants.nativeAppVersion} ({Updates.releaseChannel})</Text>
                    <Text>{Updates.updateId}</Text>
                </View>
            </Background>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-evenly',
        alignItems:'center',
    },
    top: {
        flex: 2,
        justifyContent: 'space-evenly',
    },
    logo: {
        width: 150,
        height: 150,
    },
    center: {
        flex: 2,
        alignItems:'center',
        justifyContent: 'space-evenly',
    },
    bottom: {
        flex: 0,
        alignItems:'center',
    }
});
