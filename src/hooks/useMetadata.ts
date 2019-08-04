import React, { useState, useEffect, useContext } from 'react';
import Spotify from 'rn-spotify-sdk';
import { PlayingContext } from "context/PlayingContext";
import { Track } from 'api/Types';

export function useMetadata() {
    const [metadata, setMetadata] = useState(null);
    const [playing] = useContext(PlayingContext);
    
    useEffect(() => {
        const handleMetadataChange = (response: any) => {
            var fullTrack = null;
            
            if(response.metadata && response.metadata.currentTrack && playing.filteredTracks.length > 0) {
                const currentUri = response.metadata.currentTrack.uri;
                fullTrack = playing.filteredTracks.find((item: Track) => item.track.uri === currentUri);
                response.metadata.currentTrack.tempo = fullTrack ? fullTrack.tempo : null;
                const currentPlayingIndex = playing.filteredTracks.indexOf(fullTrack);
                response.metadata.nextTrack = playing.filteredTracks[currentPlayingIndex+1];
                response.metadata.previousTrack = playing.filteredTracks[currentPlayingIndex-1];
            }
            setMetadata(response.metadata);
        };
        const wrappedResponse = {
            metadata: Spotify.getPlaybackMetadata()
        };
        handleMetadataChange(wrappedResponse);
        Spotify.on("metadataChange", handleMetadataChange);
        return () => {
            Spotify.removeListener("metadataChange", handleMetadataChange);
        };
    },[]);

    return metadata;
}