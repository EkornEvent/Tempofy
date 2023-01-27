import React, { useState, useEffect, useContext } from "react";
import { FlatList, Alert } from "react-native";
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

export const TrackScreen = ({ route, navigation }: any) => {
    const { api, remote } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [items, setItems] = useState<TrackObject[]>([]);
    const [filteredItems, setFilteredItems] = useState<TrackObject[]>([]);
    const { allTempos, selectedTempo, setSelectedTempo } = useContext(TempoContext);
    const { setQueue, } = useContext(QueueContext);
    const { userSelectedTrack } = useContext(NowPlayingContext);

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
    }

    const handleShuffle = (play: boolean) => {
        console.log('handleShuffle');
        
        const array = shuffle([...filteredItems]);
        if(play) {
            const firstItem = array.shift();
            if(firstItem) {
                userSelectedTrack(firstItem);
            }
        }
        setQueue(array);
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
                    onValueChange={handleFilterTracks}
                    onSlidingComplete={setSelectedTempo}
                    onShuffle={() => handleShuffle(true)}
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