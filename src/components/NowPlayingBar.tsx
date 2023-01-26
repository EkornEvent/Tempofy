import React, { useContext, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { AppContext } from "../context/SpotifyContext";
import { Icon, LinearProgress, Text } from '@rneui/themed';
import { FullScreen } from "./FullScreen";
import { NowPlayingContext } from "../context/NowPlayingContext";
import { VolumeContext } from "../context/VolumeContext";

export const NowPlayingBar = () => {
    const { isConnected, playerState, remote } = useContext(AppContext);
    const { timeLeft } = useContext(NowPlayingContext);
    const { isFading } = useContext(VolumeContext);
    
    const [modalVisible, setModalVisible] = useState(false);
    const secondsLeft = timeLeft ? Math.floor((timeLeft / 1000) % 60) : null;

    if(!isConnected) {
        return null;
    }

    const togglePlayPause = () => {
        if(playerState?.isPaused) {
            remote.resume();
        } else {
            remote.pause();
        }
    }

    const getValidFadeTime = (value: number | null) => {
        return value && value > 0 && !isFading ? (value+'s') : '-'
    }

    if(playerState) {
        return (
            <>
                <TouchableOpacity style={styles.container} onPress={() => setModalVisible(!modalVisible)}>
                    <Icon name={'keyboard-arrow-up'}/>
                    <View style={styles.trackContainer}>
                        <Text>{playerState.track.artist.name} - {playerState.track.name}</Text>
                        <Text>{getValidFadeTime(secondsLeft)}</Text>
                    </View>
                    <TouchableOpacity style={styles.controlIcon} onPress={() => togglePlayPause()}>
                        <Icon raised name={playerState.isPaused ? 'play-arrow' : 'pause'}/>
                    </TouchableOpacity>
                </TouchableOpacity>
                <FullScreen 
                    playerState={playerState}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                />
            </>
        )
    }

    return null;
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'lightgreen',
        alignContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row'
    },
    trackContainer: {
        flex: 1,
        flexDirection: 'column',
        padding: 10
    },
    controlIcon: {
    },
});
  