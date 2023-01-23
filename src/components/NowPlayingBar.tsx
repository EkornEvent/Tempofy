import React, { useContext, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { AppContext } from "../context/SpotifyContext";
import { LinearProgress, Text } from '@rneui/themed';
import { QueueContext } from "../context/QueueContext";
import { useEffect } from "react";
import { FullScreen } from "./FullScreen";
import { SettingsContext } from "../context/SettingsContext";
import { AutoSkipMode } from "../helpers/types";
import { VolumeContext } from "../context/VolumeContext";

export const NowPlayingBar = () => {
    const { isConnected, playerState, remote } = useContext(AppContext);
    const { consumeNextInQueue, canSkipNext, currentTrack, setCurrentTrack } = useContext(QueueContext);
    const { fadeDown, fadeUp } = useContext(VolumeContext);
    const { autoSkipMode, autoSkipTime, fadeTime } = useContext(SettingsContext);
    const [playUntilPosition, setPlayUntilPosition] = useState(autoSkipTime);
    const [modalVisible, setModalVisible] = useState(false);
    const [waiting, setWaiting] = useState(false);

    const waitDuringPause = fadeTime;

    useEffect(() => {
        if(!playerState) {
            return;
        }

        if(currentTrack && currentTrack.uri != playerState.track.uri) {
            playNextInQueue();
            return;
        }

        if(!waiting && playUntilPosition > 0 && playerState.playbackPosition > playUntilPosition - 1000) {
            if(autoSkipMode != AutoSkipMode.Off) {
                if(autoSkipMode == AutoSkipMode.Skip) {
                    skipToNext(true);
                } else {
                    if(playerState.playbackPosition + autoSkipMode > playerState.track.duration) {
                        // Almost reach end, not enough time for another 
                        skipToNext(true);
                    } else {
                        fadePause();
                    }
                }
            }
        }
    },[playerState]);

    if(!isConnected) {
        return null;
    }

    const playNextInQueue = async () => {
        setWaiting(true);
        const nextItem = consumeNextInQueue();
        if(nextItem) {
            setCurrentTrack(undefined);
            await remote.playUri(nextItem.uri);
            setPlayUntilPosition(autoSkipTime);
            setCurrentTrack(nextItem);
        }
        setWaiting(false);
    }

    const skipToNext = async (useFade?: boolean) => {
        setWaiting(true);
        if(useFade) {
            await fadeDown();
            await new Promise(resolve => setTimeout(resolve, waitDuringPause));
        }
        if(canSkipNext) {
            await remote.skipToNext();
        } else {
            await remote.pause();
        }
        await fadeUp();
        setWaiting(false);
    }

    const fadePause = async () => {
        setWaiting(true);
        await fadeDown();
        await new Promise(resolve => setTimeout(resolve, waitDuringPause));
        setPlayUntilPosition(playerState!.playbackPosition+autoSkipTime+fadeTime+waitDuringPause+fadeTime);
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
  