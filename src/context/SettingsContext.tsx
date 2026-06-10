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
    pauseTime: number,
    setPauseTime: (value: number) => void,
    bpmRange: number,
    setBpmRange: (value: number) => void,
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
    pauseTime: 5000,
    setPauseTime: () => {},
    bpmRange: 5,
    setBpmRange: () => {},
}

export const SettingsContext = createContext<SettingsInterface>(defaults);

export const SettingsContextProvider = (props: Props) => {
    const [introSkipTime, setIntroSkipTime] = useState(defaults.introSkipTime);
    const [outroSkipTime, setOutroSkipTime] = useState(defaults.outroSkipTime);
    const [autoSkipTime, setAutoSkipTime] = useState(defaults.autoSkipTime);
    const [autoSkipMode, setAutoSkipMode] = useState(defaults.autoSkipMode);
    const [pauseTime, setPauseTime] = useState(defaults.pauseTime);
    const [bpmRange, setBpmRange] = useState(defaults.bpmRange);
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
        useStorageData('pauseTime', setPauseTime);
        useStorageData('bpmRange', setBpmRange);
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
            storeData('pauseTime',pauseTime);
        }
    },[pauseTime])

    useEffect(() => {
        if(!initial) {
            storeData('bpmRange',bpmRange);
        }
    },[bpmRange])

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
                pauseTime,
                setPauseTime,
                bpmRange,
                setBpmRange
            }}
        >
            {props.children}
        </SettingsContext.Provider>
    );
};