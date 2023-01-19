import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { VolumeManager, VolumeResult } from 'react-native-volume-manager';
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

class Deferred {
    promise: Promise<unknown>;
    resolve: ((value: unknown) => void) | undefined;
    reject: ((reason?: any) => void) | undefined;
    constructor() {
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    }
  }
  
export const useVolume = () => {
    const { fadeTime } = useContext(SettingsContext);
    const [isFading, setIsFading] = useState(false);
    const [deviceVolume, setDeviceVolume] = useState<number | null>(null);
    const [timerInterval, setTimerInterval] = useState<number | null>(null);
    const [increment, setIncrement] = useState(0);
    const [direction, setDirection] = useState(0);
    const promiseRef = useRef<Deferred | null>(null);

    const interval: number = fadeTime / 10;

    useEffect(() => {
        storeCurrentVolume();
    },[]);

    const storeCurrentVolume = async (input?: VolumeResult) => {
        if(!isFading) {
            const volume = input ? input.volume : await VolumeManager.getVolume() as number;
            if(volume > 0) {
                setDeviceVolume(volume);
            }
        }
    };

    // listen to volume changes (example)
    useEffect(() => {
        const volumeListener = VolumeManager.addVolumeListener(storeCurrentVolume);
        return () => {
            volumeListener.remove();
        }
    }, [isFading]);


    const fadeDown = () => {
        if(isFading) {
            return
        }
        return createFade(false);
    };

    const fadeUp = () => {
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
        
        let deferred = new Deferred();
        promiseRef.current = deferred;

        return deferred.promise
    }


    const updateFade = async () => {
        if(deviceVolume == null) {
            return;
        }

        const currentVolume = await VolumeManager.getVolume() as number;
        const newVolume = currentVolume + (increment * (direction > 0 ? 1 : -1));
        
        if (direction > 0 ? (newVolume < deviceVolume) : (newVolume > 0)) {
            VolumeManager.setVolume(newVolume, {showUI:false});
        }
        else {
            VolumeManager.setVolume(direction > 0 ? deviceVolume : 0, {showUI:false});
            resetFade();
        }
    }

    function resetFade() {
        setIsFading(false);
        setTimerInterval(null);
        if(promiseRef && promiseRef.current && promiseRef.current.resolve) {
            promiseRef.current.resolve(true);
        }
    }

    useInterval(updateFade, timerInterval);

    return {
        fadeDown,
        fadeUp,
        resetFade,
        isFading,
        fadeTime
    }
}