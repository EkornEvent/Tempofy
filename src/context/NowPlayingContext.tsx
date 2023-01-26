import React, {useState, createContext, useEffect, useContext} from 'react';
import { SettingsContext } from '../context/SettingsContext';
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
    playUntilPosition: number | null
}

const defaultValue: NowPlayingContext = {
    skipToNext: () => undefined,
    userSelectedTrack: () => undefined,
    playUntilPosition: null
}

export const NowPlayingContext = createContext(defaultValue);

export const NowPlayingContextProvider = (props: Props) => {

    const { playerState, remote } = useContext(AppContext);
    const { consumeNextInQueue, canSkipNext, currentTrack, setCurrentTrack } = useContext(QueueContext);
    const { fadeDown, fadeUp } = useContext(VolumeContext);
    const { autoSkipMode, autoSkipTime, fadeTime } = useContext(SettingsContext);
    const [playUntilPosition, setPlayUntilPosition] = useState(autoSkipTime);
    const [waiting, setWaiting] = useState(false);

    const waitDuringPause = fadeTime;

    useEffect(() => {
        if(!playerState) {
            return;
        }

        if(currentTrack && currentTrack.uri != playerState.track.uri) {
            playNextInQueue();
            return;
        }

        if(!waiting && playUntilPosition > 0 && playerState.playbackPosition > playUntilPosition - 1000) {
            if(autoSkipMode != AutoSkipMode.Off) {
                if(autoSkipMode == AutoSkipMode.Skip) {
                    skipToNext(true);
                } else {
                    if(playerState.playbackPosition + autoSkipMode > playerState.track.duration) {
                        // Almost reach end, not enough time for another 
                        skipToNext(true);
                    } else {
                        fadePause();
                    }
                }
            }
        }
    },[playerState]);

    const userSelectedTrack = async (item: TrackObject) => {
        console.log('userSelectedTrack');
        await playTrack(item);
    }

    const playNextInQueue = async () => {
        console.log('playNextInQueue');
        const nextItem = consumeNextInQueue();
        if(nextItem) {
            playTrack(nextItem)
        }
    }

    const playTrack = async (item: TrackObject) => {
        console.log('playTrack',item.name);
        setWaiting(true);
        setCurrentTrack(undefined);
        await remote.playUri(item.uri);
        setPlayUntilPosition(autoSkipTime);
        setCurrentTrack(item);
        setWaiting(false);
    }

    const skipToNext = async (useFade?: boolean) => {
        console.log('skipToNext');
        
        setWaiting(true);
        if(useFade) {
            await fadeDown();
            await new Promise(resolve => setTimeout(resolve, waitDuringPause));
        }
        if(canSkipNext) {
            await remote.skipToNext();
        } else {
            await remote.pause();
        }
        await fadeUp();
        setWaiting(false);
    }

    const fadePause = async () => {
        setWaiting(true);
        await fadeDown();
        await new Promise(resolve => setTimeout(resolve, waitDuringPause));
        setPlayUntilPosition(playerState!.playbackPosition+autoSkipTime+fadeTime+waitDuringPause+fadeTime);
        await fadeUp();
        setWaiting(false);
    }

    return (
        <NowPlayingContext.Provider
            value={{
                skipToNext,
                userSelectedTrack,
                playUntilPosition
            }}
        >
            {props.children}
        </NowPlayingContext.Provider>
    );
};