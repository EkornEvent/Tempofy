import React, { useState, useEffect, useContext } from "react";
import { FlatList, Alert } from "react-native";
import { TrackListItem } from "../components/TrackListItem";
import { AppContext} from '../context/SpotifyContext';
import { TempoContext} from '../context/TempoContext';
import { Divider } from '@rneui/themed';
import { LoadingScreen } from "../components/Loading";
import { ErrorScreen } from "../components/Error";
import { getPlaylistTracks} from "../helpers/data";
import { TrackFilterHeader } from "../components/TrackFilterHeader";
import { TrackObject } from "../helpers/types";
import { QueueContext } from "../context/QueueContext";

export const TrackScreen = ({ route, navigation }: any) => {
    const { api, remote } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [items, setItems] = useState<TrackObject[]>([]);
    const [filteredItems, setFilteredItems] = useState<TrackObject[]>([]);
    const {allTempos} = useContext(TempoContext);
    const { setQueue, setCurrentTrack } = useContext(QueueContext);

    useEffect(() => {
        navigation.setOptions({ title: route.params.parent.name })
    }, [route]);

    useEffect(() => {
        fetchItems();
    }, []);

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
        await remote.playUri(item.uri)
        .catch(err => {
            Alert.alert(err.message);
        })
        const nextItems = filteredItems.filter((a,trackIndex) => trackIndex > index);
        setQueue(nextItems);
        setCurrentTrack(item);
    }

    const handleFilterTracks = (value: number) => {
        const newFilteredTracks = items.filter(track => {
            const minTempo = value;
            const maxTempo = minTempo + 5;
            return track.tempo && (track.tempo > minTempo) && (track.tempo < maxTempo)
        });
        setFilteredItems(newFilteredTracks);
    }

    const separator = () => {
        return <Divider orientation="vertical" />;
    };

    if(loading) {
        return <LoadingScreen />
    }

    if(error) {
        return <ErrorScreen message={error} />
    }

    return (
        <FlatList
            ListHeaderComponent={
                <TrackFilterHeader 
                    data={items} 
                    onFilterTracks={handleFilterTracks}
                />
            }
            ItemSeparatorComponent={separator}
            keyExtractor={(item: TrackObject, index: number) => item.id+index.toString()}
            data={filteredItems}
            renderItem={({ item, index, separators }) => <TrackListItem
                onPress={() => handleItemClick(item, index)}
                item={item}
            />}
        />
    )
}