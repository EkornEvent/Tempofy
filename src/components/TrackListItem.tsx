import React, { useContext } from "react";
import { ListItem, makeStyles } from '@rneui/themed'
import { TrackObject } from "../helpers/types";
import { Text } from '@rneui/themed';
import { AppContext } from "../context/SpotifyContext";
import { TouchableOpacity } from "react-native";

export const TrackListItem: React.FC<{ 
    onPress?: (item: TrackObject) => void, 
    onPressTempo?: (item: TrackObject) => void, 
    item: TrackObject
 }> = ({
    item,
    onPress,
    onPressTempo
  }) => {
    const {
        name,
        artists,
        tempo
    } = item;

    const { playerState } = useContext(AppContext);
    const styles = useStyles();
    
    const isPlaying = playerState && playerState.track.uri == item.uri;
    
    return (
        <TouchableOpacity onPress={() => onPress && onPress(item)}>
            <ListItem bottomDivider>
                <ListItem.Content>
                    <ListItem.Title style={isPlaying ? styles.playingText : styles.defaultText}>{name}</ListItem.Title>
                    <ListItem.Subtitle>{artists && artists.map(artist => artist.name).join(' - ')}</ListItem.Subtitle>
                </ListItem.Content>
                <TouchableOpacity onPress={() => onPressTempo && onPressTempo(item)} style={{padding: 10}}>
                    <Text>{tempo}</Text>
                </TouchableOpacity>
            </ListItem>
        </TouchableOpacity>
    )
}


const useStyles = makeStyles((theme) => ({
    defaultText: {
        color: theme.colors.black
    },
    playingText: {
        color: theme.colors.primary,
        fontWeight: 'bold'
    }
}));