import { useEffect, useRef, useState } from 'react';

type Delay = number | null;
type TimerHandler = (...args: any[]) => void;

/**
 * Provides a declarative useInterval
 *
 * @param callback - Function that will be called every `delay` ms.
 * @param delay - Number representing the delay in ms. Set to `null` to "pause" the interval.
 */

export const useInterval = (callback: TimerHandler, delay: Delay) => {
    const savedCallbackRef = useRef<TimerHandler>();

    useEffect(() => {
        savedCallbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const handler = (...args: any[]) => savedCallbackRef.current!(...args);

        if (delay !== null) {
            const intervalId = setInterval(handler, delay);
            return () => clearInterval(intervalId);
        }
    }, [delay]);
};

export type DeferredPromise<DeferType> = {
  resolve: (value: DeferType) => void;
  reject: (value: unknown) => void;
  promise: Promise<DeferType>;
};

export function useDeferredPromise<DeferType>() {
  const deferRef = useRef<DeferredPromise<DeferType>|null>(null);

  const defer = () => {
    const deferred = {} as DeferredPromise<DeferType>;

    const promise = new Promise<DeferType>((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });

    deferred.promise = promise;
    deferRef.current = deferred;
    return deferRef.current;
  };

  return { defer, deferRef: deferRef.current };
}

export const useTempoCounter = () => {
    const [count, setCount] = useState(0) ;
    const [timeFirst, setTimeFirst] = useState(0);
    const [timePrevious, setTimePrevious] = useState(0);
    const [bpm, setBpm] = useState(0);

    const tap = () => {
        console.log('tap');
        
        const timeSeconds = new Date();
        const time = timeSeconds.getTime();
    
        //if its been 3 seconds since last click reset the counter & previous time
        if (timePrevious !== 0 && time - timePrevious > 3000) {
            setCount(0);
            setTimePrevious(time);
            return false;
        }
        //if first click set the initial time and count 
        if (count === 0) {
            setTimeFirst(time);
            setCount(a => a+1);
        } else {
            const bpmAvg = (60000 * count) / (time - timeFirst);
            let newBpm = Math.round(bpmAvg * 100) / 100;
            setBpm(newBpm);
            setCount(a => a+1);
            setTimePrevious(time);
        }
    };
  
    return {bpm, tap}
  }
  