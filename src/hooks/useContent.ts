import React, { useContext } from 'react';
import { PlayingContext } from "context/PlayingContext";
import { Track } from 'api/Types';
import Data from 'api/Data';

export function useContent() {
    const [playing, setPlaying] = useContext(PlayingContext);
    
    function setFilteredTracks(tracks: Track[]) {
        setPlaying((playing: any) => ({ ...playing, filteredTracks: tracks }));
    }

    async function getPlaylistTracks(playlistId: string) {
        const newList: Track[] = await Data.getPlaylistTracks(playlistId);
        setPlaying((playing: any) => ({ ...playing, playlistTracks: newList }));
        return newList;
    }
    
    return {
        playlistTracks: playing.playlistTracks as Track[],
        filteredTracks: playing.filteredTracks as Track[],
        setFilteredTracks,
        getPlaylistTracks
    }
}