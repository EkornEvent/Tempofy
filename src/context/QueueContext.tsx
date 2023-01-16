import React, {useState, createContext} from 'react';
import { TrackObject } from '../helpers/types';

type Props = {
  children: React.ReactNode;
}

interface QueueContext {
    queue: TrackObject[],
    setQueue: (items: TrackObject[]) => void;
    consumeNextInQueue: () => TrackObject | undefined;
}

const defaultValue: QueueContext = {
    queue: [],
    setQueue: () => { },
    consumeNextInQueue: () => undefined
}

export const QueueContext = createContext(defaultValue);

export const QueueContextProvider = (props: Props) => {
    const [queue, setQueue] = useState<TrackObject[]>([]);

    const consumeNextInQueue = () => {
        return queue.shift();
    }

    return (
        <QueueContext.Provider
            value={{
                queue,
                setQueue,
                consumeNextInQueue
            }}
        >
            {props.children}
        </QueueContext.Provider>
    
    );
};