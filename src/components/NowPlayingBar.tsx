import React, { useContext, useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { AppContext } from "../context/SpotifyContext";
import { Icon, makeStyles, Text } from '@rneui/themed';
import { FullScreen } from "./FullScreen";
import { NowPlayingContext } from "../context/NowPlayingContext";
import { VolumeContext } from "../context/VolumeContext";
import analytics from '@react-native-firebase/analytics';

export const NowPlayingBar = () => {
    const { isConnected, playerState, remote } = useContext(AppContext);
    const { timeLeft } = useContext(NowPlayingContext);
    const { isFading } = useContext(VolumeContext);
    const styles = useStyles();

    const [modalVisible, setModalVisible] = useState(false);
    const secondsLeft = timeLeft ? Math.floor((timeLeft / 1000) % 60) : null;

    useEffect(() => {
        if(modalVisible) {
            analytics().logEvent('show_fullscreen');
        }
    },[modalVisible])

    if(!isConnected) {
        return null;
    }

    const togglePlayPause = () => {
        if(playerState?.isPaused) {
            remote.resume();
        } else {
            remote.pause();
        }
        analytics().logEvent('toggle_play_pause');
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

const useStyles = makeStyles((theme) => ({
    container: {
        backgroundColor: theme.colors.primary,
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
}));
  