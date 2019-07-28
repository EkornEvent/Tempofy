import React, { useState, useEffect, useRef, useContext } from 'react';
import Spotify from 'rn-spotify-sdk';
import { TempofyContext } from "../TempofyContext";
import { useInterval } from './useInterval';
import { Track } from 'api/Types';
import Data from 'api/Data';

export function useSettings() {
    const [state, setState] = useContext(TempofyContext);
    
    function toggleAutoSkipTime() {
        setState(state => ({ ...state, autoSkipTime: 14 }));
    }

    return {
        introSkipTime: state.introSkipTime,
        outroSkipTime: state.outroSkipTime,
        autoSkipTime: state.autoSkipTime,
        toggleAutoSkipTime,
        fadeTime: state.fadeTime as Number
    }
}

export function useContent() {
    const [state, setState] = useContext(TempofyContext);
    
    function setFilteredTracks(tracks: Track[]) {
        setState(state => ({ ...state, filteredTracks: tracks }));
    }

    async function getPlaylistTracks(playlistId: string) {
        const newList: Track[] = await Data.getPlaylistTracks(playlistId);
        setState(state => ({ ...state, playlistTracks: newList }));
        return newList;
    }

    return {
        playlistTracks: state.playlistTracks as Track[],
        filteredTracks: state.filteredTracks as Track[],
        setFilteredTracks,
        getPlaylistTracks
    }
}

export function useMetadata() {
    const [metadata, setMetadata] = useState(null);
    const {filteredTracks} = useContent();
    
    useEffect(() => {
        const handleMetadataChange = (response: any) => {
            var fullTrack = null;
            
            if(response.metadata && response.metadata.currentTrack && filteredTracks.length > 0) {
                const currentUri = response.metadata.currentTrack.uri;
                fullTrack = filteredTracks.find((item: Track) => item.track.uri === currentUri);
                response.metadata.currentTrack.tempo = fullTrack ? fullTrack.tempo : null;
                const currentPlayingIndex = filteredTracks.indexOf(fullTrack);
                response.metadata.nextTrack = filteredTracks[currentPlayingIndex+1];
                response.metadata.previousTrack = filteredTracks[currentPlayingIndex-1];
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

export function useTrackState() {
    const [state, setState] = useState(null);
    
    const handlePlaybackChange = (response: any) => {
        setState(response.state);
    };
    
    useEffect(() => {
        Spotify.on("play", handlePlaybackChange);
        Spotify.on("pause", handlePlaybackChange);
        return () => {
            Spotify.removeListener("play", handlePlaybackChange);
            Spotify.removeListener("pause", handlePlaybackChange);
        };
    },[]);

    useInterval(() => {
        const wrappedResponse = {
            state: Spotify.getPlaybackState()
        };
        handlePlaybackChange(wrappedResponse);
    }, 100);

    return state;
}