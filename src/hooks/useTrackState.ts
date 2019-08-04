import React, { useState, useEffect } from 'react';
import Spotify from 'rn-spotify-sdk';
import { useInterval } from './useInterval';

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