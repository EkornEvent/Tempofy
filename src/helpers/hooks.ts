import { useContext, useEffect, useRef, useState } from 'react';
import { VolumeManager } from 'react-native-volume-manager';
import { SettingsContext } from '../context/SettingsContext';

type Delay = number | null;
type TimerHandler = (...args: any[]) => void;

/**
 * Provides a declarative useInterval
 *
 * @param callback - Function that will be called every `delay` ms.
 * @param delay - Number representing the delay in ms. Set to `null` to "pause" the interval.
 */

export const useInterval = (callback: TimerHandler, delay: Delay) => {
    const savedCallbackRef = useRef<TimerHandler>();

    useEffect(() => {
        savedCallbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const handler = (...args: any[]) => savedCallbackRef.current!(...args);

        if (delay !== null) {
            const intervalId = setInterval(handler, delay);
            return () => clearInterval(intervalId);
        }
    }, [delay]);
};

export const useVolume = () => {
    const { fadeTime } = useContext(SettingsContext);
    const [isFading, setIsFading] = useState(false);
    const [deviceVolume, setDeviceVolume] = useState<number | null>(null);
    const [timerInterval, setTimerInterval] = useState<number | null>(null);
    const [increment, setIncrement] = useState(0);
    const [direction, setDirection] = useState(0);
    
    const interval: number = fadeTime / 10;

    useEffect(() => {
        storeCurrentVolume();
    },[])

    useInterval(() => {
        updateFade();
    }, timerInterval);

    const storeCurrentVolume = async () => {
        const volume = await VolumeManager.getVolume() as number;
        const setVolume = volume > 0 ? volume : 0.2;
        setDeviceVolume(setVolume);
        return setVolume;
    }
    
    const fadeDown = async () => {
        if(isFading) {
            return
        }
        await storeCurrentVolume();
        return createFade(false);
    };

    const fadeUp = async () => {
        if(isFading) {
            return
        }
        return createFade(true!);
    }

    const createFade = (fadeUp: boolean) => {
        if(!deviceVolume) {
            return;
        }
        
        const increment: number = deviceVolume / 10;
        
        setIsFading(true);
        setTimerInterval(interval);
        setDirection(fadeUp ? 1 : -1);
        setIncrement(increment);
        
        return new Promise(resolve => setTimeout(resolve, fadeTime))
    }

    const updateFade = async () => {
        if(deviceVolume == null) {
            return;
        }

        const currentVolume = await VolumeManager.getVolume() as number;
        const newVolume = currentVolume + (increment * (direction > 0 ? 1 : -1));
        
        if (direction > 0 ? (newVolume < deviceVolume) : (newVolume > 0)) {
            VolumeManager.setVolume(newVolume);
        }
        else {
            VolumeManager.setVolume(direction > 0 ? deviceVolume : 0);
            resetFade();
        }
    }

    function resetFade() {
        setIsFading(false);
        setTimerInterval(null);
    }

    return {
        fadeDown,
        fadeUp,
        resetFade,
        isFading,
        fadeTime
    }
}