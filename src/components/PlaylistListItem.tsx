import React from "react";
import { ListItem, Avatar } from '@rneui/themed'

export const PlaylistListItem: React.FC<{ onPress?: (item: SpotifyApi.PlaylistObjectSimplified) => void, onLongPress?: (item: SpotifyApi.PlaylistObjectSimplified) => void, item: SpotifyApi.PlaylistObjectSimplified }> = ({
    item,
    onPress,
    onLongPress
  }) => {
    const {
        name,
        description,
        images
    } = item;
    const previewImage = images ? images[images.length-1] : null;
    return (
        <ListItem 
            onPress={() => onPress && onPress(item)} 
            onLongPress={() => onLongPress && onLongPress(item)}
            bottomDivider
        >
            {previewImage &&
                <Avatar
                    source={{ uri: previewImage.url }}
                />
            }
            <ListItem.Content>
                <ListItem.Title>{name}</ListItem.Title>
                <ListItem.Subtitle>{description}</ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron />
        </ListItem>
    )
  }