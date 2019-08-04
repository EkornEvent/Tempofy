import React, { useState, useEffect } from 'react';
import Spotify from 'rn-spotify-sdk';
import { useSettings } from './useSettings';

export function useVolume() {
    const { fadeTime } = useSettings();
    const [volume, setVolume] = useState<number>(0);
    const [targetVolume, setTargetVolume] = useState<number>(1);
    const [isFading, setIsFading] = useState(false);
    const fadeTimeInMilliseconds = fadeTime*1000;
    
    function fadeDown() {
        return createFade(false);
    };

    function fadeUp() {
        return createFade(true);
    }

    function createFade(fadeUp: boolean) {
        if(isFading) {
            return
        }
        return new Promise(resolve => {
            var volume: number = fadeUp ? 0 : 1;
            const factor: number = 0.1;
            const interval: number = fadeTimeInMilliseconds * factor;

            setIsFading(true);
            var fadeout = setInterval(function() {
                if (fadeUp ? (volume < 1) : (volume > 0)) {
                    volume += (factor * (fadeUp ? 1 : -1));
                    Spotify.setVolume(volume);
                }
                else {
                    // Stop the setInterval when 0 is reached
                    Spotify.setVolume(fadeUp ? 1 : 0);
                    clearInterval(fadeout);
                    setIsFading(false);
                    resolve();
                }
            }, interval);
        })
    }

    function resetFade() {
        setIsFading(false);
    }
/*
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
*/
    return {
        fadeDown,
        fadeUp,
        resetFade
    }
}
