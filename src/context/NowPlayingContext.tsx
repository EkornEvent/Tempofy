import React, {useState, createContext, useEffect, useContext} from 'react';
import { PlayerState } from 'react-native-spotify-remote';
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
    const { fadeDown, fadeUp } = useContext(VolumeContext);
    const { introSkipTime, outroSkipTime, autoSkipMode, autoSkipTime, fadeTime, waitDuringPause } = useContext(SettingsContext);
    const [timeLeft, setTimeLeft] = useState<number | null>(autoSkipTime);
    const [waiting, setWaiting] = useState(false);
    const timerInterval = 100;
    const [updateInterval, setUpdateInterval] = useState<number | null>(timerInterval);

    useEffect(() => {
        if(!playerState) {
            return;
        }
        setUpdateInterval(playerState.isPaused ? null : timerInterval);
        if(currentTrack && currentTrack.uri != playerState.track.uri) {
            console.log('currentTrack',currentTrack?.name, playerState.track.name);
            playNextInQueue();
        }
    },[playerState]);

    useInterval(() => {
        if(timeLeft == null) {
            return;
        }
        setTimeLeft(value => {
            let newValue = value;
            if(value != null) {
                newValue = value - timerInterval;
                if(value <= 1000) {
                    onCountDownFinished();
                    newValue = null;
                }
            }
            return newValue;
        });
    }, updateInterval);

    const resetCountDown = () => {
        console.log('resetCountDown');
        console.log('autoSkipTime',fadeTime);
        setTimeLeft(autoSkipTime+waitDuringPause);
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
        setWaiting(true);
        setCurrentTrack(undefined);
        await remote.playUri(item.uri);
        setCurrentTrack(item);
        setWaiting(false);
        resetCountDown();
    }

    const skipToNext = async (useFade?: boolean) => {
        console.log('skipToNext');
        
        setWaiting(true);
        if(useFade) {
            await fadeDown();
            await new Promise(resolve => setTimeout(resolve, waitDuringPause));
        }
        console.log('fade down complete');
        
        if(canSkipNext) {
            await remote.skipToNext();
            try {
                await new Promise(resolve => setTimeout(resolve, 50));
                await remote.seek(introSkipTime);
            } catch {
                // could not seek
                console.error('could not seek')
            }
        } else {
            await remote.pause();
        }

        resetCountDown();
        await fadeUp();
        console.log('fade up complete');
        setWaiting(false);
    }

    const fadePause = async () => {
        setWaiting(true);
        await fadeDown();
        const fadePlayerState = remote.getPlayerState();
        await new Promise(resolve => setTimeout(resolve, waitDuringPause));
        fadePlayerState.then(response => {
            if(response.playbackPosition + autoSkipTime + outroSkipTime > response.track.duration) {
                playNextInQueue();
            }
        });
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