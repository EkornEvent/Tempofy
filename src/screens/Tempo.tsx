import React, { useContext, useState } from 'react';
import { View, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { Button, makeStyles, Text } from '@rneui/themed';
import { Background } from '../components/Background';
import { useTempoCounter } from '../helpers/hooks';
import { getDatabase, ref, set } from '@react-native-firebase/database';
import { getAnalytics, logEvent } from '@react-native-firebase/analytics';
import { AppContext } from '../context/SpotifyContext';

export const TempoScreen = ({ route, navigation }: any) => {
    const { user } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const { bpm, tap, setBpm } = useTempoCounter();
    const styles = useStyles();

    const track = route.params.parent;

    // The value currently shown: the tapped BPM, or the track's stored tempo
    // before the user has tapped. Half/double operate on this so they can also
    // correct a stored tempo that was detected at double- or half-time.
    const currentTempo = bpm > 0 ? bpm : (track.tempo || 0);
    const scaleTempo = (factor: number) => {
        if(currentTempo > 0) {
            setBpm(Math.round(currentTempo * factor * 100) / 100);
        }
    };

    const onChangeTempo = () => {
        setLoading(true);
        const newTempo = Math.floor(bpm);
        logEvent(getAnalytics(), 'update_tempo', {value: newTempo});
        var updatedAt = new Date().toISOString();
        set(ref(getDatabase(), '/tempo/'+track.id), {
            tempo: newTempo,
            updatedAt: updatedAt,
            updatedBy: user.id
        })
        .then(() => {
            setLoading(false);
            track.tempo = Math.floor(newTempo);
            navigation.goBack();
        })
        .catch((err: any) => {
            // Write failed (offline, permissions). Drop out of the loading state
            // so the Update button works again instead of spinning forever; keep
            // the modal open so the user doesn't lose their tap.
            console.error('update_tempo failed', err);
            setLoading(false);
        });
    }

    if(!track) {
        return null;
    }

    return (
        <Background>
            <SafeAreaView style={styles.container}>
                <ScrollView>
                    <View style={styles.coverContainer}>
                        <Text h2 style={{fontWeight: 'bold'}}>{track.name}</Text>
                        <Text h3>{track.artists && track.artists.map((artist:any) => artist.name).join(' - ')}</Text>

                    </View>
                    <View style={styles.coverContainer}>
                        <Text h1>{bpm > 0 ? bpm : track.tempo ? track.tempo : '-'}</Text>
                        <Text>bpm</Text>
                        <View style={styles.tapRow}>
                            <TouchableOpacity
                                onPress={() => scaleTempo(0.5)}
                                disabled={!currentTempo}
                                style={[styles.sideButton, !currentTempo && styles.sideButtonDisabled]}
                            >
                                <Text h4>÷2</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={tap}
                                style={styles.roundButton}
                            >
                                <Text h3>Tap</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => scaleTempo(2)}
                                disabled={!currentTempo}
                                style={[styles.sideButton, !currentTempo && styles.sideButtonDisabled]}
                            >
                                <Text h4>×2</Text>
                            </TouchableOpacity>
                        </View>
                        <Text h2>Tap to get BPM</Text>
                    </View>
                    <Button 
                        onPress={onChangeTempo}
                        disabled={!bpm}
                        style={styles.button}
                        loading={loading}
                    >
                        <Text h2>Update</Text>
                    </Button>
                </ScrollView>
            </SafeAreaView>
        </Background>
    );
}

const useStyles = makeStyles((theme) => ({
    container: {
        flex: 1
    },
    coverContainer: {
        flex: 0,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50
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
    tapRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    roundButton: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderRadius: 100,
        backgroundColor: theme.colors.primary,
        margin: 30
    },
    sideButton: {
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 64,
        backgroundColor: theme.colors.secondary
    },
    sideButtonDisabled: {
        opacity: 0.3
    },
    button: {
        padding: 30
    }
}));