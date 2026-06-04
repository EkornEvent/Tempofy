import React, {useState, createContext, useEffect, useContext, useRef} from 'react';
import { SettingsContext } from '../context/SettingsContext';
import { useInterval } from '../helpers/hooks';
import { AutoSkipMode, TrackObject } from '../helpers/types';
import { QueueContext } from './QueueContext';
import { AppContext } from './SpotifyContext';
import { VolumeContext } from './VolumeContext';

type Props = {
  children: React.ReactNode;
}

interface NowPlayingContext {
    skipToNext: () => void;
    userSelectedTrack: (track: TrackObject) => void;
    timeLeft: number | null
}

const defaultValue: NowPlayingContext = {
    skipToNext: () => undefined,
    userSelectedTrack: () => undefined,
    timeLeft: null
}

export const NowPlayingContext = createContext(defaultValue);

export const NowPlayingContextProvider = (props: Props) => {
    const { playerState, remote } = useContext(AppContext);
    const { consumeNextInQueue, canSkipNext, currentTrack, setCurrentTrack } = useContext(QueueContext);
    const { fadeDown, fadeUp, cancelFade } = useContext(VolumeContext);
    const { introSkipTime, outroSkipTime, autoSkipMode, autoSkipTime, fadeTime, waitDuringPause } = useContext(SettingsContext);
    const [timeLeft, setTimeLeft] = useState<number | null>(autoSkipTime);
    const [waiting, setWaiting] = useState(false);
    // Only whole seconds are ever displayed, so a 1s tick is enough. A faster
    // interval re-renders every NowPlayingContext consumer 10×/sec for no
    // visible change, which keeps the CPU (and device) hot during playback.
    const timerInterval = 1000;
    const [updateInterval, setUpdateInterval] = useState<number | null>(null);
    const endTimeRef = useRef<number | null>(null);
    const pausedRemainingRef = useRef<number | null>(null);
    // Mirrors playerState.isPaused so async callbacks (e.g. resetCountDown at
    // the tail of a fade) can read the *current* pause state instead of the
    // value captured when they started.
    const isPausedRef = useRef(false);
    // True while we're deliberately switching tracks (manual skip / userSelected).
    // The App Remote fires transient and trailing (old-track) playerStateChange
    // events during a switch; without this guard the auto-advance below misreads
    // them as "track ended" and fires an extra, unwanted skip.
    const isTransitioningRef = useRef(false);

    useEffect(() => {
        if(!playerState) {
            return;
        }
        isPausedRef.current = playerState.isPaused;
        if(playerState.isPaused) {
            if(endTimeRef.current !== null) {
                pausedRemainingRef.current = Math.max(0, endTimeRef.current - Date.now());
                endTimeRef.current = null;
            }
            setUpdateInterval(null);
        } else {
            if(pausedRemainingRef.current !== null) {
                endTimeRef.current = Date.now() + pausedRemainingRef.current;
                pausedRemainingRef.current = null;
            }
            setUpdateInterval(timerInterval);
        }
        if(!isTransitioningRef.current && currentTrack && currentTrack.uri != playerState.track.uri) {
            playNextInQueue();
        }
    },[playerState]);

    useInterval(() => {
        if(endTimeRef.current === null) return;
        const remaining = endTimeRef.current - Date.now();
        if(remaining <= 1000) {
            endTimeRef.current = null;
            setTimeLeft(null);
        } else {
            setTimeLeft(remaining);
        }
    }, updateInterval);

    useEffect(() => {
        if(timeLeft === null) {
            onCountDownFinished();
        }
    }, [timeLeft]);

    const resetCountDown = () => {
        console.log('resetCountDown');
        console.log('autoSkipTime',fadeTime);
        const total = autoSkipTime + waitDuringPause;
        if(isPausedRef.current) {
            // Playback is paused (e.g. the user paused mid-fade). Don't start
            // ticking against wall-clock time — park the fresh countdown in the
            // paused-remaining slot so the resume handler launches it only once
            // playback actually resumes. Otherwise the timer would count down
            // while the music is stopped.
            pausedRemainingRef.current = total;
            endTimeRef.current = null;
            setTimeLeft(total);
            setUpdateInterval(null);
            return;
        }
        endTimeRef.current = Date.now() + total;
        pausedRemainingRef.current = null;
        setTimeLeft(total);
        setUpdateInterval(timerInterval);
    }

    const onCountDownFinished = () => {
        console.log('onCountDownFinished');
        console.log('waiting',waiting);
        setUpdateInterval(null);
        if(autoSkipMode != AutoSkipMode.Off) {
            if(autoSkipMode == AutoSkipMode.Skip) {
                skipToNext(true);
            } else {
                fadePause();
            }
        }
    }

    const userSelectedTrack = async (item: TrackObject) => {
        console.log('userSelectedTrack');
        await playTrack(item);
    }

    const playNextInQueue = async () => {
        console.log('playNextInQueue');
        const nextItem = consumeNextInQueue();
        if(nextItem) {
            playTrack(nextItem);
        }
    }

    const playTrack = async (item: TrackObject) => {
        console.log('playTrack',item.name);
        // Manual selection — kill any auto-fade in progress so it doesn't keep
        // ramping the volume on the track we're about to play.
        cancelFade();
        isTransitioningRef.current = true;
        setWaiting(true);
        setCurrentTrack(undefined);
        try {
            await remote.playUri(item.uri);
            setCurrentTrack(item);
            resetCountDown();
        } catch (err) {
            // Playback couldn't start (e.g. Spotify unreachable). Surface it for
            // logs rather than crashing with an uncaught rejection; the UI drops
            // out of the waiting state below so the user can retry.
            console.log('playTrack failed', err);
        } finally {
            setWaiting(false);
            isTransitioningRef.current = false;
        }
    }

    const skipToNext = async (useFade?: boolean) => {
        console.log('skipToNext');

        const nextItem = consumeNextInQueue();
        if(!nextItem) {
            // Queue is exhausted. There's no next track to play, and Spotify's
            // native skipNext() can't help here because we play tracks by bare
            // URI (no playlist/album context), so it just fails. Stop the
            // auto-skip instead of looping on a doomed skip every cycle.
            console.log('queue empty, stopping auto-skip');
            setUpdateInterval(null);
            endTimeRef.current = null;
            pausedRemainingRef.current = null;
            setWaiting(false);
            return;
        }

        if(!useFade) {
            // Manual skip — cancel any in-flight auto-fade so its remaining ramp
            // doesn't carry onto the next track and produce a jarring dip/swell.
            cancelFade();
        }

        isTransitioningRef.current = true;
        setWaiting(true);
        if(useFade) {
            await fadeDown();
            await new Promise(resolve => setTimeout(resolve, waitDuringPause));
            // Honour a pause made during the fade/wait. This is an *auto* skip,
            // not a deliberate one. Check the event-driven ref and, because that
            // event can lag, re-read the live player state too. If paused,
            // restore the faded-down volume, re-park the countdown (resetCountDown
            // leaves it parked while paused, so a resume re-triggers the skip) and
            // bail out before touching playback.
            const livePaused = await remote.getPlayerState()
                .then(s => s ? s.isPaused : false)
                .catch(() => false);
            if(isPausedRef.current || livePaused) {
                await fadeUp();
                resetCountDown();
                setWaiting(false);
                isTransitioningRef.current = false;
                return;
            }
        }
        console.log('fade down complete');

        try {
            setCurrentTrack(undefined);
            // Player.play() already starts playback, so there's no need to
            // resume() afterwards — doing so makes the App Remote reject with
            // "The request failed." because nothing is paused. We only seek to
            // the intro-skip offset once the new track is playing.
            await remote.playUri(nextItem.uri);
            setCurrentTrack(nextItem);
            await new Promise(resolve => setTimeout(resolve, 50));
            await remote.seek(introSkipTime);
        } catch (err) {
            console.error('skip failed', err);
        }

        resetCountDown();
        if(useFade) {
            // Only ramp back up when we actually faded down. A manual skip
            // leaves the volume untouched, so calling fadeUp() here would snap
            // it to 0 and ramp back up for no reason — an audible, jarring dip.
            await fadeUp();
        }
        console.log('fade up complete');
        setWaiting(false);
        isTransitioningRef.current = false;
    }

    const fadePause = async () => {
        setWaiting(true);
        await fadeDown();
        await new Promise(resolve => setTimeout(resolve, waitDuringPause));
        // Read the *live* player state after the fade+wait, not a snapshot taken
        // before it. The user can pause during the fade, and the App Remote's
        // pause event reaches our isPausedRef asynchronously (sometimes after
        // this point) — so consult the fresh state too. If playback is paused,
        // the pause was deliberate (Fade mode advances *before* the natural end,
        // while still playing), so defer to the user and don't auto-advance.
        let response;
        try {
            response = await remote.getPlayerState();
        } catch (err) {
            console.error('fadePause getPlayerState failed', err);
        }
        const paused = isPausedRef.current || (response ? response.isPaused : false);
        if(!paused && response && response.playbackPosition + autoSkipTime + outroSkipTime > response.track.duration) {
            playNextInQueue();
        }
        resetCountDown();
        await fadeUp();
        setWaiting(false);
    }

    return (
        <NowPlayingContext.Provider
            value={{
                skipToNext,
                userSelectedTrack,
                timeLeft
            }}
        >
            {props.children}
        </NowPlayingContext.Provider>
    );
};