
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text, makeStyles } from "@rneui/themed";
import { useTempoCounter } from "../helpers/hooks";

export const TempoCounter = () => {
    const { bpm, tap } = useTempoCounter();
    const styles = useStyles();

    return (
        <View style={styles.container}>
            <Text h1>{bpm > 0 ? bpm : '-'}</Text>
            <TouchableOpacity 
                onPress={tap}
                style={styles.button}
            >
                <Text h3>Tap</Text>
            </TouchableOpacity>
            <Text h2>Tap to get BPM</Text>
            
        </View>
    )
}

const useStyles = makeStyles((theme) => ({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderRadius: 100,
        backgroundColor: theme.colors.primary,
        margin: 30
    }
}));