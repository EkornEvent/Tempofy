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
}

const defaultValue: QueueContext = {
    queue: [],
    setQueue: () => { },
    consumeNextInQueue: () => undefined,
    canSkipNext: false
}

export const QueueContext = createContext(defaultValue);

export const QueueContextProvider = (props: Props) => {
    const [queue, setQueue] = useState<TrackObject[]>([]);
    const [canSkipNext, setCanSkipNext] = useState(false);

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
                canSkipNext
            }}
        >
            {props.children}
        </QueueContext.Provider>
    
    );
};