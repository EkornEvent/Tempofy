import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { VolumeManager, VolumeResult } from 'react-native-volume-manager';
import { SettingsContext } from '../context/SettingsContext';

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
