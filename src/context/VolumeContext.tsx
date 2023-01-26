import React, {useState, createContext, useEffect, useContext, useRef} from 'react';
import { VolumeManager, VolumeResult } from 'react-native-volume-manager';
import { SettingsContext } from '../context/SettingsContext';
import { DeferredPromise, useDeferredPromise, useInterval } from '../helpers/hooks';

type Props = {
  children: React.ReactNode;
}

interface VolumeContext {
    fadeDown: () => Promise<unknown>;
    fadeUp: () => Promise<unknown>;
    abortFade: () => void;
    isFading: boolean;
}

const defaultValue: VolumeContext = {
    fadeDown: () => new Promise<unknown>(resolve => resolve),
    fadeUp: () => new Promise<unknown>(resolve => resolve),
    abortFade: () => undefined,
    isFading: false
}

export const VolumeContext = createContext(defaultValue);

export const VolumeContextProvider = (props: Props) => {
    const { fadeTime } = useContext(SettingsContext);
    const [isFading, setIsFading] = useState(false);
    const [deviceVolume, setDeviceVolume] = useState<number | null>(null);
    const [timerInterval, setTimerInterval] = useState<number | null>(null);
    const [increment, setIncrement] = useState(0);
    const [direction, setDirection] = useState(0);
    const { defer, deferRef } = useDeferredPromise<boolean>();
    const isFadingRef = useRef<boolean>(false);
    const interval: number = fadeTime / 10;

    useEffect(() => {
        resetFade();
        storeCurrentVolume();
    },[]);


    useEffect(() => {
        setTimeout(() => {
            isFadingRef.current = isFading
        }, 100);
    },[isFading]);

    useEffect(() => {
        const volumeListener = VolumeManager.addVolumeListener(storeCurrentVolume);
        return () => {
            volumeListener.remove();
        }
    }, []);

    const storeCurrentVolume = async (input?: VolumeResult) => {
        if(isFadingRef.current) {
            return;
        }
        
        const volume = input ? input.volume : await VolumeManager.getVolume() as number;
        if(volume > 0) {
            console.log('storeCurrentVolume', volume);
            setDeviceVolume(volume);
        }
    };
    
    const fadeDown = () => {
        if(isFading) {
            return new Promise<void>(resolve => resolve());
        }
        return createFade(false);
    };

    const fadeUp = () => {
        if(isFading) {
            return new Promise<void>(resolve => resolve());
        }
        return createFade(true);
    }

    const createFade = (fadeUp: boolean) => {
        if(!deviceVolume) {
            return new Promise<void>(resolve => resolve());
        }
        
        const increment: number = deviceVolume / 10;
        
        setIsFading(true);
        setTimerInterval(interval);
        setDirection(fadeUp ? 1 : -1);
        setIncrement(increment);
        
        return defer().promise;
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
            await VolumeManager.setVolume(direction > 0 ? deviceVolume : 0, {showUI:false});
            resetFade();
            completedFade();
        }
    };

    function resetFade() {
        setIsFading(false);
        setTimerInterval(null);
    }

    function abortFade() {
        resetFade();
        if(deviceVolume != null) {
            VolumeManager.setVolume(deviceVolume, {showUI:false});
        }
        deferRef?.reject('aborted');
    }

    function completedFade() {
        deferRef?.resolve(true);
    }

    useInterval(updateFade, timerInterval);

    return (
        <VolumeContext.Provider
            value={{
                fadeDown,
                fadeUp,
                abortFade,
                isFading
            }}
        >
            {props.children}
        </VolumeContext.Provider>
    );
};