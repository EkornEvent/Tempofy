import React, {useState, createContext, useEffect} from 'react';
import { TrackObject } from '../helpers/types';

type Props = {
  children: React.ReactNode;
}

interface QueueContext {
    queue: TrackObject[],
    setQueue: (items: TrackObject[]) => void;
    consumeNextInQueue: () => TrackObject | undefined;
    canSkipNext: boolean;
    currentTrack: TrackObject | undefined;
    setCurrentTrack: (item: TrackObject | undefined) => void;
}

const defaultValue: QueueContext = {
    queue: [],
    setQueue: () => { },
    consumeNextInQueue: () => undefined,
    canSkipNext: false,
    currentTrack: undefined,
    setCurrentTrack: () => undefined
}

export const QueueContext = createContext(defaultValue);

export const QueueContextProvider = (props: Props) => {
    const [queue, setQueue] = useState<TrackObject[]>([]);
    const [canSkipNext, setCanSkipNext] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<TrackObject>();

    const consumeNextInQueue = () => {
        return queue.shift();
    }

    useEffect(() => {
        setCanSkipNext(queue.length > 0);
    },[queue])

    return (
        <QueueContext.Provider
            value={{
                queue,
                setQueue,
                consumeNextInQueue,
                canSkipNext,
                currentTrack,
                setCurrentTrack
            }}
        >
            {props.children}
        </QueueContext.Provider>
    );
};