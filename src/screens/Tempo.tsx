import React, { useContext, useState } from 'react';
import { View, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { Button, makeStyles, Text } from '@rneui/themed';
import { Background } from '../components/Background';
import { useTempoCounter } from '../helpers/hooks';
import database from '@react-native-firebase/database';
import analytics from '@react-native-firebase/analytics';
import { AppContext } from '../context/SpotifyContext';

export const TempoScreen = ({ route, navigation }: any) => {
    const { user } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const { bpm, tap } = useTempoCounter();
    const styles = useStyles();

    const track = route.params.parent;
    
    const onChangeTempo = () => {
        setLoading(true);
        const newTempo = Math.floor(bpm);
        analytics().logEvent('update_tempo', {value: newTempo});
        var updatedAt = new Date().toISOString();
        database()
        .ref('/tempo/'+track.id)
        .set({
            tempo: newTempo,
            updatedAt: updatedAt,
            updatedBy: user.id
        })
        .then(() => {
            setLoading(false);
            track.tempo = Math.floor(newTempo);
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
                        <TouchableOpacity 
                            onPress={tap}
                            style={styles.roundButton}
                        >
                            <Text h3>Tap</Text>
                        </TouchableOpacity>
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
    button: {
        padding: 30
    }
}));