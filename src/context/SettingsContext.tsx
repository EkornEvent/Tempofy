import React, {useState, createContext, useEffect} from 'react';
import { AutoSkipMode } from '../helpers/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  children: React.ReactNode;
}

interface SettingsInterface {
    introSkipTime: number,
    setIntroSkipTime: (value: number) => void,
    outroSkipTime: number,
    setOutroSkipTime: (value: number) => void,
    autoSkipTime: number,
    setAutoSkipTime: (value: number) => void,
    autoSkipMode: AutoSkipMode,
    setAutoSkipMode: (value: AutoSkipMode) => void,
    fadeTime: number,
    setFadeTime: (value: number) => void,
    waitDuringPause: number,
    setWaitDuringPause: (value: number) => void,
}

const defaults = {
    introSkipTime: 15000,
    setIntroSkipTime: () => {},
    outroSkipTime: 5000,
    setOutroSkipTime: () => {},
    autoSkipTime: 30000,
    setAutoSkipTime: () => {},
    autoSkipMode: AutoSkipMode.Skip,
    setAutoSkipMode: () => {},
    fadeTime: 2000,
    setFadeTime: () => {},
    waitDuringPause: 2000,
    setWaitDuringPause: () => {},
}

export const SettingsContext = createContext<SettingsInterface>(defaults);

export const SettingsContextProvider = (props: Props) => {
    const [introSkipTime, setIntroSkipTime] = useState(defaults.introSkipTime);
    const [outroSkipTime, setOutroSkipTime] = useState(defaults.outroSkipTime);
    const [autoSkipTime, setAutoSkipTime] = useState(defaults.autoSkipTime);
    const [autoSkipMode, setAutoSkipMode] = useState(defaults.autoSkipMode);
    const [fadeTime, setFadeTime] = useState(defaults.fadeTime);
    const [waitDuringPause, setWaitDuringPause] = useState(defaults.waitDuringPause);
    const [initial, setInitial] = useState(true);

    const useStorageData = async (name: string, dispatch: any) => {
        try {
          const value = await AsyncStorage.getItem(name);
          if(value !== null) {
            dispatch(Number(value));
          }
          return value
        } catch(e) {
          // error reading value
        }
    }

    const storeData = async (name: string, value: number) => {
        try {
            await AsyncStorage.setItem(name, value.toString())
        } catch (e) {
            // saving error
        }
    }

    useEffect(() => {
        useStorageData('introSkipTime', setIntroSkipTime);
        useStorageData('outroSkipTime', setOutroSkipTime);
        useStorageData('autoSkipTime', setAutoSkipTime);
        useStorageData('autoSkipMode', setAutoSkipMode);
        useStorageData('fadeTime', setFadeTime);
        useStorageData('waitDuringPause', setWaitDuringPause);
        setInitial(false);
    },[])

    useEffect(() => {
        if(!initial) {
            storeData('introSkipTime',introSkipTime);
        }
    },[introSkipTime])

    useEffect(() => {
        if(!initial) {
            storeData('outroSkipTime',outroSkipTime);
        }
    },[outroSkipTime])

    useEffect(() => {
        if(!initial) {
            storeData('autoSkipTime',autoSkipTime);
        }
    },[autoSkipTime])

    useEffect(() => {
        if(!initial) {
            storeData('fadeTime',fadeTime);
        }
    },[fadeTime])

    useEffect(() => {
        if(!initial) {
            storeData('waitDuringPause',waitDuringPause);
        }
    },[waitDuringPause])

    return (
        <SettingsContext.Provider
            value={{
                introSkipTime,
                setIntroSkipTime,
                outroSkipTime,
                setOutroSkipTime,
                autoSkipTime,
                setAutoSkipTime,
                autoSkipMode,
                setAutoSkipMode,
                fadeTime,
                setFadeTime,
                waitDuringPause,
                setWaitDuringPause
            }}
        >
            {props.children}
        </SettingsContext.Provider>
    );
};