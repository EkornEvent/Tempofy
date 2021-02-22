import React, { useState, useEffect } from 'react';
import Spotify from 'rn-spotify-sdk';

export function useEvent(eventName: string) {
    const [state, setState] = useState(null);
    
    const handleEvent = (response: any) => {
        console.log(response);
        setState(response.state);
    };
    
    useEffect(() => {
        Spotify.on(eventName, handleEvent);
        return () => {
            Spotify.removeListener(eventName, handleEvent);
        };
    },[]);

    return state;
}