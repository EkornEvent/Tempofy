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
    restoreVolume: () => Promise<unknown> | void;
    isFading: boolean;
}

const defaultValue: VolumeContext = {
    fadeDown: () => undefined,
    fadeUp: () => undefined,
    resetFade: () => undefined,
    cancelFade: () => undefined,
    restoreVolume: () => undefined,
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

// Connected devices (e.g. a soundbar over Spotify Connect / Bluetooth) echo our
// own setVolume() fade writes back as volume-change events with noticeable
// latency. An echo can arrive after a fade has already reset, so keep ignoring
// volume reports for this long after a fade ends — otherwise a delayed near-zero
// fade-down echo gets memorized as the device volume and the next fade-up only
// climbs back to that wrong, quiet level.
const VOLUME_SETTLE_MS = 1000;

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
    // The real device volume captured when this cycle's fade-down began, so the
    // matching fade-up restores to it rather than to the live deviceVolume,
    // which a laggy device echo can corrupt mid-cycle.
    const restoreVolumeRef = useRef<number | null>(null);
    // Timestamp of the last fade end, used to gate storeCurrentVolume against
    // delayed fade-write echoes (see VOLUME_SETTLE_MS).
    const lastFadeEndRef = useRef<number>(0);
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
        // Ignore volume reports while fading, and for a short settle window after
        // a fade ends. Our setVolume() ramp writes are echoed back as
        // volume-change events; on connected devices those echoes can land after
        // the fade reset isFading. Without this window a delayed mid-fade echo
        // (a near-zero level) would be memorized as the device volume, so the
        // next fade-up would stop short and leave playback quiet.
        if(isFadingRef.current || Date.now() - lastFadeEndRef.current < VOLUME_SETTLE_MS) {
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
        //
        // A fade-up restores to the volume snapshotted when this cycle's
        // fade-down began (restoreVolumeRef), not the live deviceVolume: a laggy
        // device volume echo can corrupt deviceVolume to a near-zero level between
        // the fade-down and fade-up, which would make the restore stop short.
        const target = fadeUp
            ? (restoreVolumeRef.current ?? deviceVolume ?? 1)
            : (deviceVolume ?? 1);

        if(!fadeUp) {
            // Remember the real pre-fade volume so the matching fade-up restores
            // to exactly this level.
            restoreVolumeRef.current = target;
        }

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

    const restoreVolume = () => {
        // Re-assert the real device volume after a pause interrupted a fade.
        // Called when playback resumes. A single setVolume() issued the instant
        // playback resumes is dropped by a connected device (e.g. a soundbar over
        // Spotify Connect) — its audio route isn't ready for a one-shot write yet
        // — which leaves the stream stuck at the faded-down floor. So restore with
        // a ramp instead: it keeps writing across the whole fade window, so the
        // level reliably climbs back even when the first writes are lost. Force
        // the ramp to start from 0 because the interrupted fade left the device
        // muted. Preempt any in-flight (paused, ignored) ramp first.
        if(isFadingRef.current) {
            resetFade();
        }
        fromVolumeRef.current = 0;
        toVolumeRef.current = restoreVolumeRef.current ?? deviceVolumeRef.current ?? 1;
        fadeStartRef.current = Date.now();
        isFadingRef.current = true;
        setIsFading(true);
        setTimerInterval(interval);

        let deferred = new Deferred();
        promiseRef.current = deferred;

        return deferred.promise;
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
        lastFadeEndRef.current = Date.now();
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
                restoreVolume,
                isFading
            }}
        >
            {props.children}
        </VolumeContext.Provider>
    );
};