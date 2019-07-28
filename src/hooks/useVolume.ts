import React, { useState, useEffect } from 'react';
import Spotify from 'rn-spotify-sdk';
import { useSettings } from "./useTempofy";
import { useInterval } from "./useInterval";

export function useVolume() {
    const { fadeTime } = useSettings();
    const [volume, setVolume] = useState<number>(0);
    const [targetVolume, setTargetVolume] = useState<number>(1);
    const [isFading, setIsFading] = useState(false);
    const fadeTimeInMilliseconds = fadeTime*1000;
    
    function fadeDown() {
        setVolume(1);
        setTargetVolume(0);
        setIsFading(true);
    };

    function fadeUp() {
        setVolume(0);
        setTargetVolume(1);
        setIsFading(true);
    }

    function resetFade() {
        setIsFading(false);
    }

    useEffect(() => {
        //Spotify.setVolume(volume);
    },[volume])

    useInterval(() => {
        const incrementVolume = targetVolume == 1 ? 0.1 : -0.1;
        var newVolume = volume + incrementVolume;
        setVolume(newVolume);

        // Fading completed
        if(targetVolume == 1) {
            if (newVolume >= targetVolume) {
                setVolume(targetVolume);
                setIsFading(false);
            }
        } else if(targetVolume == 0) {
            if (newVolume <= targetVolume) {
                setVolume(targetVolume);
                setIsFading(false);
            }
        }
        
    }, isFading ? fadeTimeInMilliseconds/10 : null);

    return {
        fadeDown,
        fadeUp,
        resetFade
    }
}
