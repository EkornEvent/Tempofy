import React, { useState, useEffect, useContext } from "react";
import { FlatList, Alert, View, StyleSheet } from "react-native";
import { Text } from '@rneui/themed';
import { TrackListItem } from "../components/TrackListItem";
import { AppContext} from '../context/SpotifyContext';
import { TempoContext} from '../context/TempoContext';
import { Divider } from '@rneui/themed';
import { LoadingScreen } from "../components/Loading";
import { ErrorScreen } from "../components/Error";
import { getPlaylistTracks, shuffle} from "../helpers/data";
import { TrackFilterHeader } from "../components/TrackFilterHeader";
import { TrackObject } from "../helpers/types";
import { QueueContext } from "../context/QueueContext";
import { NowPlayingContext } from "../context/NowPlayingContext";
import { SettingsContext } from "../context/SettingsContext";
import { getAnalytics, logEvent } from '@react-native-firebase/analytics';

export const TrackScreen = ({ route, navigation }: any) => {
    const { api, remote } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [items, setItems] = useState<TrackObject[]>([]);
    const [filteredItems, setFilteredItems] = useState<TrackObject[]>([]);
    const { allTempos, selectedTempo, setSelectedTempo } = useContext(TempoContext);
    const { setQueue, } = useContext(QueueContext);
    const { userSelectedTrack } = useContext(NowPlayingContext);
    const { bpmRange } = useContext(SettingsContext);
    const [slideValue, setSlideValue] = useState<number | null>(null);

    useEffect(() => {
        navigation.setOptions({ title: route.params.parent.name })
    }, [route]);

    useEffect(() => {
        fetchItems();
    }, []);

    useEffect(() => {
        if(selectedTempo) {
            handleFilterTracks(selectedTempo);
            handleShuffle(false);
        }
    }, [selectedTempo]);

    const fetchItems = async () => {
        setLoading(true);
        setError(undefined);
        try {
            const result = await getPlaylistTracks(api, allTempos, route.params.parent.id);
            const sortedItems = [...result].sort((a,b) => (a.tempo ? a.tempo : 0) - (b.tempo ? b.tempo : 0));
            setItems(sortedItems);
            setFilteredItems(sortedItems);
        } catch (err: any) {
            setError(err.message);
        }
        setLoading(false);
    };

    const handleItemClick = async (item: TrackObject, index: number) => {
        userSelectedTrack(item);
        const nextItems = filteredItems.filter((a,trackIndex) => trackIndex > index);
        setQueue(nextItems);
        logEvent(getAnalytics(),'click_track');
    }

    const handleTempoClick = async (item: TrackObject, index: number) => {
        navigation.navigate('Tempo', {parent: item});
    }

    const handleShuffle = (play: boolean) => {
        const shuffled = shuffle([...filteredItems]);
        setFilteredItems(shuffled);
        if(play) {
            const [firstItem, ...rest] = shuffled;
            if(firstItem) {
                userSelectedTrack(firstItem);
            }
            setQueue(rest);
        } else {
            setQueue(shuffled);
        }
        logEvent(getAnalytics(),'shuffle');
    }

    const handleFilterTracks = (value: number) => {
        const newFilteredTracks = items.filter(track => {
            const minTempo = value;
            const maxTempo = minTempo + bpmRange;
            return track.tempo && (track.tempo > minTempo) && (track.tempo < maxTempo)
        });
        setFilteredItems(newFilteredTracks);
    }

    if(loading) {
        return <LoadingScreen />
    }

    if(error) {
        return <ErrorScreen message={error} />
    }

    return (
        <View style={styles.container}>
            <FlatList
                ListHeaderComponent={
                    <TrackFilterHeader
                        data={items}
                        onValueChange={handleFilterTracks}
                        onSlidingComplete={setSelectedTempo}
                        onShuffle={() => handleShuffle(true)}
                        onSlideValue={setSlideValue}
                    />
                }
                keyExtractor={(item: TrackObject) => item.id}
                data={filteredItems}
                renderItem={({ item, index, separators }) => <TrackListItem
                    onPress={() => handleItemClick(item, index)}
                    onPressTempo={() => handleTempoClick(item, index)}
                    item={item}
                />}
            />
            {slideValue !== null && (
                <View style={styles.bubble} pointerEvents="none">
                    <Text style={styles.bubbleValue}>{Math.round(slideValue)}</Text>
                    <Text style={styles.bubbleUnit}>BPM</Text>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    bubble: {
        position: 'absolute',
        top: '50%',
        alignSelf: 'center',
        transform: [{ translateY: -70 }],
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        borderRadius: 16,
        paddingVertical: 24,
        paddingHorizontal: 40,
        alignItems: 'center'
    },
    bubbleValue: {
        fontSize: 64,
        fontWeight: 'bold'
    },
    bubbleUnit: {
        fontSize: 18,
        opacity: 0.7
    }
});