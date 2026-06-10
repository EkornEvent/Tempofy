import React, {useState, createContext, useEffect, useContext, useRef} from 'react';
import { SettingsContext } from '../context/SettingsContext';
import { useInterval } from '../helpers/hooks';
import { AutoSkipMode, TrackObject } from '../helpers/types';
import { QueueContext } from './QueueContext';
import { AppContext } from './SpotifyContext';

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
    const { introSkipTime, autoSkipMode, autoSkipTime, pauseTime } = useContext(SettingsContext);
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
    // the tail of a pause/skip) can read the *current* pause state instead of
    // the value captured when they started.
    const isPausedRef = useRef(false);
    // True while we're deliberately switching tracks (manual skip / userSelected).
    // The App Remote fires transient and trailing (old-track) playerStateChange
    // events during a switch; without this guard the auto-advance below misreads
    // them as "track ended" and fires an extra, unwanted skip. The guard is held
    // until the device *confirms* our target track is playing (see the effect),
    // not just until playUri() resolves — Spotify emits those events after the
    // promise settles, so clearing it early lets a trailing old-track event slip
    // through and skip an extra track or two.
    const isTransitioningRef = useRef(false);
    // The uri we last asked the device to play. The transition guard clears only
    // once a playerState event reports this uri, so stale events for the track we
    // just left can't trigger a spurious auto-advance.
    const targetUriRef = useRef<string | null>(null);

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
        if(isTransitioningRef.current) {
            // Mid-switch. Clear the guard only when the device confirms our
            // target track is the one now playing; trailing events for the
            // previous track (uri != target) are ignored until then, so they
            // can't be misread as a natural track change and skip ahead.
            if(targetUriRef.current && playerState.track.uri === targetUriRef.current) {
                isTransitioningRef.current = false;
            }
        } else if(currentTrack && currentTrack.uri != playerState.track.uri) {
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
        const total = autoSkipTime;
        if(isPausedRef.current) {
            // Playback is paused (manually, or by Pause mode). Don't start
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
        if(autoSkipMode == AutoSkipMode.Skip) {
            skipToNext(true);
        } else if(autoSkipMode == AutoSkipMode.Pause) {
            pausePlayback();
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
        isTransitioningRef.current = true;
        targetUriRef.current = item.uri;
        setWaiting(true);
        setCurrentTrack(undefined);
        try {
            await remote.playUri(item.uri);
            setCurrentTrack(item);
            resetCountDown();
            // Leave isTransitioningRef set; the playerState effect clears it once
            // the device confirms this track is playing. Clearing it here (before
            // Spotify emits its events) lets trailing old-track events trigger a
            // spurious auto-advance.
        } catch (err) {
            // Playback couldn't start (e.g. Spotify unreachable). Surface it for
            // logs rather than crashing with an uncaught rejection; the UI drops
            // out of the waiting state below so the user can retry.
            console.log('playTrack failed', err);
            isTransitioningRef.current = false;
        } finally {
            setWaiting(false);
        }
    }

    const skipToNext = async (pauseBeforeStart?: boolean) => {
        console.log('skipToNext');

        const nextItem = consumeNextInQueue();
        if(!nextItem) {
            // Queue is exhausted. There's no next track to play, and Spotify's
            // native skipNext() can't help here because we play tracks by bare
            // URI (no playlist/album context), so it just fails. Stop the
            // auto-skip instead of looping on a doomed skip every cycle, and
            // pause playback so the last track doesn't keep playing on.
            console.log('queue empty, stopping playback');
            setUpdateInterval(null);
            endTimeRef.current = null;
            pausedRemainingRef.current = null;
            setWaiting(false);
            try {
                await remote.pause();
            } catch (err) {
                console.error('pause on empty queue failed', err);
            }
            return;
        }

        isTransitioningRef.current = true;
        targetUriRef.current = nextItem.uri;
        setWaiting(true);

        try {
            setCurrentTrack(undefined);
            // The SDK can only play a track from 0 (no play-from-offset), so
            // play → seek would briefly play the intro before jumping. Instead,
            // start the track, pause it immediately, and seek to the intro offset
            // while it's silent — the listener never hears the 0→intro region.
            await remote.playUri(nextItem.uri);
            await remote.pause();
            // The device rejects a seek issued immediately after play, so let it
            // settle first. This wait now happens while paused (silent), so it
            // doesn't reintroduce the audible intro it's here to avoid.
            await new Promise(resolve => setTimeout(resolve, 50));
            await remote.seek(introSkipTime);
            setCurrentTrack(nextItem);
            // Auto-skip holds a silent gap (pauseTime) before the next track
            // actually starts; a manual skip resumes immediately.
            if(pauseBeforeStart) {
                await new Promise(resolve => setTimeout(resolve, pauseTime));
            }
            await remote.resume();
            // Leave isTransitioningRef set; the playerState effect clears it once
            // the device confirms this track is playing, so trailing old-track
            // events during the switch don't trigger a spurious auto-advance.
        } catch (err) {
            console.error('skip failed', err);
            isTransitioningRef.current = false;
        }

        resetCountDown();
        setWaiting(false);
    }

    const pausePlayback = async () => {
        // Pause mode: when the countdown ends, pause playback, hold for the
        // configured pauseTime, then resume automatically.
        setWaiting(true);
        try {
            await remote.pause();
        } catch (err) {
            console.error('pause failed', err);
        }
        await new Promise(resolve => setTimeout(resolve, pauseTime));
        // The user may have resumed manually during the hold. Re-read the live
        // state and only auto-resume if playback is still paused, so we don't
        // fight a user who already pressed play.
        let response;
        try {
            response = await remote.getPlayerState();
        } catch (err) {
            console.error('pausePlayback getPlayerState failed', err);
        }
        const paused = response ? response.isPaused : isPausedRef.current;
        if(paused) {
            try {
                await remote.resume();
            } catch (err) {
                console.error('resume failed', err);
            }
        }
        // Re-arm the countdown so the pause repeats every autoSkipTime of
        // playback. While paused resetCountDown parks the fresh countdown and
        // the resume handler relaunches it once playback resumes.
        resetCountDown();
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