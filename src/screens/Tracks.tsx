import React, { useState, useEffect, useContext } from "react";
import { FlatList, Alert } from "react-native";
import { TrackListItem } from "../components/TrackListItem";
import { AppContext} from '../context/SpotifyContext';
import { Divider } from '@rneui/themed';
import { LoadingScreen } from "../components/Loading";
import { ErrorScreen } from "../components/Error";
import { getPlaylistTracks, getTempofyPlaylist, resetTempofyPlaylist, updateTempofyPlaylist } from "../helpers/data";
import { TrackFilterHeader } from "../components/TrackFilterHeader";
import { TrackObject } from "../helpers/types";
import { QueueContext } from "../context/QueueContext";

export const TrackScreen = ({ route, navigation }: any) => {
    const { api, remote } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [items, setItems] = useState<TrackObject[]>([]);
    const [filteredItems, setFilteredItems] = useState<TrackObject[]>([]);
    //const [tempofyPlaylist, setTempofyPlaylist] = useState<ContentItem>();
    const { setQueue } = useContext(QueueContext);

    useEffect(() => {
        navigation.setOptions({ title: route.params.parent.name })
    }, [route]);

    useEffect(() => {
        fetchItems();
    }, []);

    const sortTempofyPlaylistByTempo = async (items: TrackObject[]) => {
        setLoading(true);
        const list = await getTempofyPlaylist(api);
        await resetTempofyPlaylist(api, list);
        await updateTempofyPlaylist(api, list, filteredItems);
        setLoading(false);
    }
    
    const fetchItems = async () => {
        setLoading(true);
        setError(undefined);
        try {
            const result = await getPlaylistTracks(api, route.params.parent.id);
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
    }

    const handleFilterTracks = (value: number) => {
        const newFilteredTracks = items.filter(track => {
            const minTempo = value;
            const maxTempo = minTempo + 5;
            return track.tempo && (track.tempo > minTempo) && (track.tempo < maxTempo)
        });
        setFilteredItems(newFilteredTracks);
    }

    const handleFilterTracksComplete = async (value: number) => {
        //sortTempofyPlaylistByTempo(filteredItems);
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
                    onFilterTracksComplete={handleFilterTracksComplete}
                />
            }
            ItemSeparatorComponent={separator}
            data={filteredItems}
            renderItem={({ item, index, separators }) => <TrackListItem
                onPress={() => handleItemClick(item, index)}
                item={item}
            />}
        />
    )
}