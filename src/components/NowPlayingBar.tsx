import React, { useContext, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { AppContext } from "../context/SpotifyContext";
import { LinearProgress, Text } from '@rneui/themed';
import { QueueContext } from "../context/QueueContext";
import { useEffect } from "react";
import { Track } from "react-native-spotify-remote";
import { useVolume } from "../helpers/hooks";
import { FullScreen } from "./FullScreen";
import { SettingsContext } from "../context/SettingsContext";
import { AutoSkipMode } from "../helpers/types";

export const NowPlayingBar = () => {
    const { isConnected, playerState, remote } = useContext(AppContext);
    const { consumeNextInQueue, canSkipNext } = useContext(QueueContext);
    const {fadeDown, fadeUp, resetFade, isFading, fadeTime} = useVolume();
    const [currentTrack, setCurrentTrack] = useState<Track>();
    const { autoSkipMode, autoSkipTime } = useContext(SettingsContext);
    const [playUntilPosition, setPlayUntilPosition] = useState(autoSkipTime);
    const [modalVisible, setModalVisible] = useState(false);
    const [waiting, setWaiting] = useState(false);

    const waitDuringPause = fadeTime;

    useEffect(() => {
        if(!playerState) {
            return;
        }
        if(!currentTrack || currentTrack.uri != playerState.track.uri) {
            setCurrentTrack(playerState.track);
            setPlayUntilPosition(autoSkipTime);
            resetFade();
            fadeUp();
            queueNextItem();
        }

        if(playerState.playbackPosition > playUntilPosition) {
            setPlayUntilPosition(playerState.playbackPosition+autoSkipTime+waitDuringPause);
        }
        if(!waiting && playerState.playbackPosition > playUntilPosition - fadeTime) {
            if(autoSkipMode != AutoSkipMode.Off) {
                if(autoSkipMode == AutoSkipMode.Skip) {
                    skipToNext(true);
                } else {
                    fadePause();
                }
            }
        }
        if(currentTrack && !waiting && playerState.playbackPosition > (currentTrack.duration - fadeTime)) {
            if(autoSkipMode != AutoSkipMode.Off) {
                if(autoSkipMode == AutoSkipMode.Skip) {
                    skipToNext(true);
                } else {
                    fadePause();
                }
            }
        }
    },[playerState]);

    if(!isConnected) {
        return null;
    }

    const queueNextItem = async () => {
        const nextItem = consumeNextInQueue();
        if(nextItem) {
            await remote.queueUri(nextItem.uri);
        }
    }

    const skipToNext = async (useFade?: boolean) => {
        setWaiting(true);
        if(useFade) {
            await fadeDown();
            
        }
        if(canSkipNext) {
            await remote.skipToNext();
        } else {
            await remote.pause();
            resetFade();
            fadeUp();
        }
        setWaiting(false);
    }

    const fadePause = async () => {
        setWaiting(true);
        await fadeDown();
        await new Promise(resolve => setTimeout(resolve, waitDuringPause))
        await fadeUp();
        setWaiting(false);
    }
    
    if(playerState) {
        let progressValue = playerState.playbackPosition / playerState.track.duration;
        return (
            <>
                <TouchableOpacity style={styles.container} onPress={() => setModalVisible(!modalVisible)}>
                    <Text>{playerState.track.artist.name} - {playerState.track.name}</Text>
                    <LinearProgress
                        style={{ marginVertical: 10 }}
                        value={progressValue}
                        animation={false}
                    />
                </TouchableOpacity>
                <FullScreen 
                    playerState={playerState}
                    playUntilPosition={playUntilPosition}
                    visible={modalVisible}
                    onSkipNext={skipToNext}
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
        padding: 15
    },
});
  