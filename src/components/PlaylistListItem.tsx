import React from "react";
import { ListItem, Avatar } from '@rneui/themed'

export const PlaylistListItem: React.FC<{ onPress?: (item: SpotifyApi.PlaylistObjectSimplified) => void, onLongPress?: (item: SpotifyApi.PlaylistObjectSimplified) => void, item: SpotifyApi.PlaylistObjectSimplified }> = ({
    item,
    onPress,
    onLongPress
  }) => {
    const {
        name,
        description
    } = item;
    
    const chevron = true;
    
    return (
        <ListItem 
            onPress={() => onPress && onPress(item)} 
            onLongPress={() => onLongPress && onLongPress(item)}
            bottomDivider
        >
            <Avatar title={name}/>
            <ListItem.Content>
                <ListItem.Title>{name}</ListItem.Title>
                <ListItem.Subtitle>{description}</ListItem.Subtitle>
            </ListItem.Content>
            {chevron &&
                <ListItem.Chevron />
            }
        </ListItem>
    )
  }