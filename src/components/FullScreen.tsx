import React, { useContext, useEffect, useState } from "react";
import { Modal, View, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from "react-native";
import { Icon, LinearProgress, Text } from '@rneui/themed'
import { PlayerState } from "react-native-spotify-remote";
import { SettingsContext } from "../context/SettingsContext";
import { AppContext } from "../context/SpotifyContext";
import { QueueContext } from "../context/QueueContext";
import { VolumeContext } from "../context/VolumeContext";
import { NowPlayingContext } from "../context/NowPlayingContext";
import { TempoContext } from "../context/TempoContext";

export const FullScreen: React.FC<{ playerState: PlayerState, visible: boolean, onRequestClose: () => void }> = ({
    playerState,
    visible,
    onRequestClose
  }) => {
    
    const { autoSkipMode, setAutoSkipMode, autoSkipTime, setAutoSkipTime } = useContext(SettingsContext);
    const { remote } = useContext(AppContext);
    const { canSkipNext, currentTrack } = useContext(QueueContext);
    const { isFading } = useContext(VolumeContext);
    const { skipToNext, timeLeft } = useContext(NowPlayingContext);
    const { selectedTempo, setSelectedTempo } = useContext(TempoContext);
    const [userChangedTempo, setUserChangedTempo] = useState(false);

    const secondsLeft = timeLeft ? Math.floor((timeLeft / 1000) % 60) : null;

    useEffect(() => {
        if(userChangedTempo) {
            setUserChangedTempo(false);
        }
    },[isFading])

    const toggleAutoSkipMode = () => {
        setAutoSkipMode(autoSkipMode == 2 ? 0 : autoSkipMode+1);
    }

    const toggleAutoSkipTime = () => {
        const step = 15000;
        const newValue = autoSkipTime + step
        setAutoSkipTime(newValue > 120000 ? step : newValue);
    }

    const togglePlayPause = () => {
        if(playerState.isPaused) {
            remote.resume();
        } else {
            remote.pause();
        }
    }

    const onSkipPrevious = () => {
        remote.skipToPrevious();
    }

    const onChangeTempo = (increment: number) => {
        setSelectedTempo((tempo: number) => tempo+increment);
        setUserChangedTempo(true);
    }

    const getValidFadeTime = (value: number | null) => {
        return value && value > 0 && !isFading ? value : '-'
    }

    return (
        <Modal
            animationType="slide"
            presentationStyle="fullScreen"
            supportedOrientations={["portrait","landscape"]}
            visible={visible}
            onRequestClose={onRequestClose}
        >
            <SafeAreaView style={styles.container}>
                <TouchableOpacity style={styles.controlIcon} onPress={onRequestClose}>
                    <Icon size={40} name={'keyboard-arrow-down'}/>
                </TouchableOpacity>
                <View style={styles.coverContainer}>
                    <View>
                        <Text style={[styles.coverText, {fontWeight: 'bold'}]}>{playerState.track.name}</Text>
                        <Text style={styles.coverText}>{playerState.track.artist.name}</Text>
                    </View>
                </View>
                <View style={styles.controlButtons}>
                    <TouchableOpacity style={styles.controlIcon} onPress={() => onSkipPrevious()}>
                        <Icon size={40} name={'skip-previous'}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlIcon} onPress={() => togglePlayPause()}>
                        <Icon size={40} name={playerState.isPaused ? 'play-arrow' : 'pause'}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.controlIcon,{opacity: canSkipNext ? 1 : 0.2}]} disabled={!canSkipNext} onPress={() => skipToNext()}>
                        <Icon size={40} name={'skip-next'}/>
                    </TouchableOpacity>
                </View>
                <View style={styles.controlButtons}>
                    <TouchableOpacity style={styles.controlIcon} onPress={() => onChangeTempo(-2)}>
                        <Text h1>-</Text>
                    </TouchableOpacity>
                    <View style={styles.controlIcon}>
                        <Text h1>
                            {userChangedTempo ? selectedTempo : (
                                currentTrack ? currentTrack.tempo : '-'
                            )}
                        </Text>
                        <Text>bpm</Text>
                    </View>
                    <TouchableOpacity style={styles.controlIcon} onPress={() => onChangeTempo(2)}>
                        <Text h1>+</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.controlButtons}>
                    <View style={styles.controlIcon}>
                        <Text h4>{getValidFadeTime(secondsLeft)}</Text>
                        <Text>sec</Text>
                    </View>
                    <TouchableOpacity style={styles.controlIcon} onPress={() => toggleAutoSkipMode()}>
                        <View>
                        <Icon size={40} name={autoSkipMode > 0 ? (autoSkipMode == 1 ? 'timer' : 'volume-down') : 'timer-off'}/>
                        <Text>{autoSkipMode > 0 ? (autoSkipMode == 1 ? 'Skip timer' : 'Fade timer') : 'Play track'}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlIcon} onPress={() => toggleAutoSkipTime()}>
                        <View>
                        <Text h4>{autoSkipTime/1000}</Text>
                        <Text>sec</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    coverContainer: {
        flex: 0
    },
    coverImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').width
    },
    coverText: {
        color: 'black'
    },
    controlButtons: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    controlIcon: {
        alignSelf: 'center',
        alignItems: 'center',
        padding: 10,
        width: 100
    },
    blocksContainer: {
        flex: 0,
        flexDirection: 'row'
    },
    blockItem: {
      borderWidth: 1,
      borderColor: 'red'
    },
    progressContainer: {
      flex: 0,
      flexDirection: 'row',
    },
    progressDone: {
      backgroundColor: 'green',
      height: 10
    },
    progressLeft: {
      backgroundColor: 'white',
      height: 10
    }
});