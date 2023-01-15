import React, {useState, createContext} from 'react';
import { AutoSkipMode } from '../helpers/types';

type Props = {
  children: React.ReactNode;
}

interface SettingsInterface {
    introSkipTime: number,
    outroSkipTime: number,
    autoSkipTime: number,
    setAutoSkipTime: (value: number) => void,
    autoSkipMode: AutoSkipMode,
    setAutoSkipMode: (value: AutoSkipMode) => void,
    fadeTime: number
}

const defaults = {
    introSkipTime: 15000,
    outroSkipTime: 5000,
    autoSkipTime: 30000,
    setAutoSkipTime: () => {},
    autoSkipMode: AutoSkipMode.Skip,
    setAutoSkipMode: () => {},
    fadeTime: 2000
}

export const SettingsContext = createContext<SettingsInterface>(defaults);

export const SettingsContextProvider = (props: Props) => {
    const [introSkipTime, setIntroSkipTime] = useState(defaults.introSkipTime);
    const [outroSkipTime, setOutroSkipTime] = useState(defaults.outroSkipTime);
    const [autoSkipTime, setAutoSkipTime] = useState(defaults.autoSkipTime);
    const [autoSkipMode, setAutoSkipMode] = useState(defaults.autoSkipMode);
    const [fadeTime, setFadeTime] = useState(defaults.fadeTime);

    return (
        <SettingsContext.Provider
            value={{
                introSkipTime,
                outroSkipTime,
                autoSkipTime,
                setAutoSkipTime,
                autoSkipMode,
                setAutoSkipMode,
                fadeTime
            }}
        >
            {props.children}
        </SettingsContext.Provider>
    
    );
};