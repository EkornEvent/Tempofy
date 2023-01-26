import React, {useState, createContext, useEffect, useContext, useRef} from 'react';
import { VolumeManager, VolumeResult } from 'react-native-volume-manager';
import { SettingsContext } from '../context/SettingsContext';
import { useInterval } from '../helpers/hooks';

type Props = {
  children: React.ReactNode;
}

interface VolumeContext {
    fadeDown: () => Promise<unknown> | true | undefined;
    fadeUp: () => Promise<unknown> | true | undefined;
    resetFade: () => void;
    isFading: boolean;
}

const defaultValue: VolumeContext = {
    fadeDown: () => undefined,
    fadeUp: () => undefined,
    resetFade: () => undefined,
    isFading: false
}

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

export const VolumeContext = createContext(defaultValue);

export const VolumeContextProvider = (props: Props) => {
    const { fadeTime } = useContext(SettingsContext);
    const [isFading, setIsFading] = useState(false);
    const [deviceVolume, setDeviceVolume] = useState<number | null>(null);
    const [timerInterval, setTimerInterval] = useState<number | null>(null);
    const [increment, setIncrement] = useState(0);
    const [direction, setDirection] = useState(0);
    const [userChangedVolume, setUserChangedVolume] = useState<number | null>(null);
    const promiseRef = useRef<Deferred | null>(null);
    const isFadingRef = useRef<boolean>(false);
    const interval: number = fadeTime / 10;

    useEffect(() => {
        resetFade();
        storeCurrentVolume();
    },[]);


    useEffect(() => {
        isFadingRef.current = isFading;
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
            setDeviceVolume(volume);
        }
    };
    
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
        return createFade(true);
    }

    const createFade = (fadeUp: boolean) => {
        if(!deviceVolume) {
            return true;
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
            await VolumeManager.setVolume(direction > 0 ? deviceVolume : 0, {showUI:false});
            resetFade();
        }
    };

    function resetFade() {
        setIsFading(false);
        setTimerInterval(null);
        if(promiseRef && promiseRef.current && promiseRef.current.resolve) {
            promiseRef.current.resolve(true);
        }
    }

    useInterval(updateFade, timerInterval);

    return (
        <VolumeContext.Provider
            value={{
                fadeDown,
                fadeUp,
                resetFade,
                isFading
            }}
        >
            {props.children}
        </VolumeContext.Provider>
    );
};