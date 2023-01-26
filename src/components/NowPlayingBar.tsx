import React, { useContext, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { AppContext } from "../context/SpotifyContext";
import { LinearProgress, Text } from '@rneui/themed';
import { FullScreen } from "./FullScreen";

export const NowPlayingBar = () => {
    const { isConnected, playerState } = useContext(AppContext);
    
    const [modalVisible, setModalVisible] = useState(false);
    
    if(!isConnected) {
        return null;
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
        padding: 15
    },
});
  