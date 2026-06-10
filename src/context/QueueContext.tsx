import React, {useState, createContext, useRef} from 'react';
import { TrackObject } from '../helpers/types';

type Props = {
  children: React.ReactNode;
}

interface QueueContext {
    queue: TrackObject[],
    setQueue: (items: TrackObject[]) => void;
    // Forward: pop the next track, pushing the current one onto history.
    consumeNextInQueue: () => TrackObject | undefined;
    // Backward: pop the most recently played track, pushing the current one
    // back onto the front of the queue. Returns undefined when history is empty.
    goPrevious: () => TrackObject | undefined;
    peekNext: () => TrackObject | undefined;
    peekPrevious: () => TrackObject | undefined;
    canSkipNext: boolean;
    canSkipPrevious: boolean;
    currentTrack: TrackObject | undefined;
    setCurrentTrack: (item: TrackObject | undefined) => void;
}

const defaultValue: QueueContext = {
    queue: [],
    setQueue: () => { },
    consumeNextInQueue: () => undefined,
    goPrevious: () => undefined,
    peekNext: () => undefined,
    peekPrevious: () => undefined,
    canSkipNext: false,
    canSkipPrevious: false,
    currentTrack: undefined,
    setCurrentTrack: () => undefined
}

export const QueueContext = createContext(defaultValue);

export const QueueContextProvider = (props: Props) => {
    // Queue/history/current are mirrored into refs so navigation can read and
    // mutate them synchronously — these are driven from async playback flows and
    // playerState effects where reading React state would see stale values.
    const [queue, setQueueState] = useState<TrackObject[]>([]);
    const queueRef = useRef<TrackObject[]>([]);
    const historyRef = useRef<TrackObject[]>([]);
    const [canSkipNext, setCanSkipNext] = useState(false);
    const [canSkipPrevious, setCanSkipPrevious] = useState(false);
    const [currentTrack, setCurrentTrackState] = useState<TrackObject>();
    const currentRef = useRef<TrackObject | undefined>(undefined);

    const syncFlags = () => {
        setCanSkipNext(queueRef.current.length > 0);
        setCanSkipPrevious(historyRef.current.length > 0);
    };

    const applyQueue = (items: TrackObject[]) => {
        queueRef.current = items;
        setQueueState(items);
        syncFlags();
    };

    const setQueue = (items: TrackObject[]) => {
        // A fresh queue means a new playback context (shuffle / track pick), so
        // start its history empty — there's nowhere to skip back to yet.
        historyRef.current = [];
        applyQueue(items);
    };

    const setCurrentTrack = (item: TrackObject | undefined) => {
        currentRef.current = item;
        setCurrentTrackState(item);
    };

    const consumeNextInQueue = () => {
        if(queueRef.current.length === 0) return undefined;
        const [next, ...rest] = queueRef.current;
        if(currentRef.current) {
            historyRef.current = [...historyRef.current, currentRef.current];
        }
        applyQueue(rest);
        return next;
    };

    const goPrevious = () => {
        if(historyRef.current.length === 0) return undefined;
        const prev = historyRef.current[historyRef.current.length - 1];
        historyRef.current = historyRef.current.slice(0, -1);
        // Put the current track back at the front so a following skip-next
        // returns to it.
        applyQueue(currentRef.current ? [currentRef.current, ...queueRef.current] : queueRef.current);
        return prev;
    };

    const peekNext = () => queueRef.current.length > 0 ? queueRef.current[0] : undefined;
    const peekPrevious = () => historyRef.current.length > 0 ? historyRef.current[historyRef.current.length - 1] : undefined;

    return (
        <QueueContext.Provider
            value={{
                queue,
                setQueue,
                consumeNextInQueue,
                goPrevious,
                peekNext,
                peekPrevious,
                canSkipNext,
                canSkipPrevious,
                currentTrack,
                setCurrentTrack
            }}
        >
            {props.children}
        </QueueContext.Provider>
    );
};
