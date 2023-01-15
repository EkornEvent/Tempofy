import React, { useState, useEffect, useContext } from "react";
import { FlatList } from "react-native";
import { PlaylistListItem } from "../components/PlaylistListItem";
import { AppContext} from '../context/SpotifyContext';
import { Divider } from '@rneui/themed';
import { LoadingScreen } from "../components/Loading";
import { ErrorScreen } from "../components/Error";
import { getUserPlaylists } from "../helpers/data";

export const PlaylistScreen = ({ route, navigation }: any) => {
    const { isConnected, api, user } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [items, setItems] = useState<SpotifyApi.PlaylistObjectSimplified[]>([]);
    
    const fetchItems = async () => {
        setLoading(true);
        setError(undefined);
        try {
            const result = await getUserPlaylists(api);
            setItems(result);
        } catch (err: any) {
            setError(err.message);
        }
        setLoading(false);
    };

    const handleItemClick = (item: SpotifyApi.PlaylistObjectSimplified) => {
        navigation.navigate('Tracks', {parent: item});
    }

    useEffect(() => {
        if (isConnected) {
            fetchItems();
        }
    }, [isConnected]);

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
            ItemSeparatorComponent={separator}
            data={items}
            renderItem={({ item }) => <PlaylistListItem
                onPress={handleItemClick}
                item={item}
            />}
        />
    )
}