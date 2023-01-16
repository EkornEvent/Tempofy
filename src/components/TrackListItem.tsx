import React, { useContext } from "react";
import { ListItem } from '@rneui/themed'
import { TrackObject } from "../helpers/types";
import { Text } from '@rneui/themed';
import { AppContext } from "../context/SpotifyContext";
import { TouchableOpacity } from "react-native";

export const TrackListItem: React.FC<{ 
    onPress?: (item: TrackObject) => void, 
    item: TrackObject
 }> = ({
    item,
    onPress
  }) => {
    const {
        name,
        artists,
        tempo
    } = item;

    const { playerState } = useContext(AppContext);

    const isPlaying = playerState && playerState.track.uri == item.uri;
    
    return (
        <TouchableOpacity onPress={() => onPress && onPress(item)}>
            <ListItem bottomDivider>
                <Text>{tempo}</Text>
                <ListItem.Content>
                    <ListItem.Title style={{fontWeight: isPlaying ? 'bold' : undefined}}>{name}</ListItem.Title>
                    <ListItem.Subtitle>{artists && artists.map(artist => artist.name).join(' - ')}</ListItem.Subtitle>
                </ListItem.Content>
            </ListItem>
        </TouchableOpacity>
    )
  }