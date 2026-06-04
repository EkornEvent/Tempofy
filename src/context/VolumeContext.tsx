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
    cancelFade: () => void;
    isFading: boolean;
}

const defaultValue: VolumeContext = {
    fadeDown: () => undefined,
    fadeUp: () => undefined,
    resetFade: () => undefined,
    cancelFade: () => undefined,
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
    const [userChangedVolume, setUserChangedVolume] = useState<number | null>(null);
    const promiseRef = useRef<Deferred | null>(null);
    const isFadingRef = useRef<boolean>(false);
    const deviceVolumeRef = useRef<number | null>(null);
    const fromVolumeRef = useRef<number | null>(null);
    const toVolumeRef = useRef<number | null>(null);
    const fadeStartRef = useRef<number | null>(null);
    const interval: number = fadeTime / 10;

    useEffect(() => {
        resetFade();
        storeCurrentVolume();
    },[]);


    useEffect(() => {
        isFadingRef.current = isFading;
    },[isFading]);

    useEffect(() => {
        deviceVolumeRef.current = deviceVolume;
    },[deviceVolume]);

    useEffect(() => {
        const volumeListener = VolumeManager.addVolumeListener(storeCurrentVolume);
        return () => {
            volumeListener.remove();
        }
    }, []);

    useEffect(() => {
        // If the provider unmounts mid-fade (app reload, navigation teardown),
        // the OS media volume is left wherever the fade stalled — possibly at or
        // near 0. Snap it back to the known device volume so playback is never
        // left silenced with no way to recover.
        return () => {
            if(isFadingRef.current) {
                VolumeManager.setVolume(deviceVolumeRef.current ?? 1, {showUI:false});
            }
        };
    }, []);

    const storeCurrentVolume = async (input?: VolumeResult) => {
        if(isFadingRef.current) {
            return;
        }
        
        const volume = input ? input.volume : (await VolumeManager.getVolume()).volume;
        if(volume > 0) {
            setDeviceVolume(volume);
        }
    };
    
    const fadeDown = () => {
        if(isFadingRef.current) {
            return
        }
        return createFade(false);
    };

    const fadeUp = () => {
        if(isFadingRef.current) {
            return
        }
        return createFade(true);
    }

    const createFade = (fadeUp: boolean) => {
        // Fall back to full volume when we never learned a real device volume.
        // storeCurrentVolume refuses to memorize 0, so an interrupted fade that
        // left the stream at 0 would otherwise keep deviceVolume null forever and
        // a fade-up could never restore audio — leaving playback permanently mute.
        const target = deviceVolume ?? 1;

        // Drive the fade from elapsed time toward an absolute target rather than
        // accumulating relative increments read back from getVolume(). Android
        // quantizes the music stream to a handful of discrete steps, so reading
        // the volume back and adding small increments stalls or jumps; computing
        // the absolute volume from elapsed time is immune to that rounding.
        fromVolumeRef.current = fadeUp ? 0 : target;
        toVolumeRef.current = fadeUp ? target : 0;
        fadeStartRef.current = Date.now();
        isFadingRef.current = true;
        setIsFading(true);
        setTimerInterval(interval);

        let deferred = new Deferred();
        promiseRef.current = deferred;

        return deferred.promise
    }

    const updateFade = () => {
        const from = fromVolumeRef.current;
        const to = toVolumeRef.current;
        const start = fadeStartRef.current;
        if(from == null || to == null || start == null) {
            return;
        }

        const elapsed = Date.now() - start;
        const fraction = fadeTime > 0 ? Math.min(elapsed / fadeTime, 1) : 1;
        const newVolume = from + (to - from) * fraction;

        VolumeManager.setVolume(newVolume, {showUI:false});

        if(fraction >= 1) {
            resetFade();
        }
    };

    const cancelFade = () => {
        // Abort an in-flight fade and snap the volume back to the real device
        // volume. Used when the user manually skips/selects a track mid-fade so
        // a lingering auto-fade ramp doesn't bleed onto the newly playing track.
        if(!isFadingRef.current) {
            return;
        }
        VolumeManager.setVolume(deviceVolumeRef.current ?? 1, {showUI:false});
        resetFade();
    };

    function resetFade() {
        isFadingRef.current = false;
        fromVolumeRef.current = null;
        toVolumeRef.current = null;
        fadeStartRef.current = null;
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
                cancelFade,
                isFading
            }}
        >
            {props.children}
        </VolumeContext.Provider>
    );
};