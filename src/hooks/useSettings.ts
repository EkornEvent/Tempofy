import React, { useContext } from 'react';
import { SettingsContext } from "context/SettingsContext";

export function useSettings() {
    const [settings, updateSettings] = useContext(SettingsContext);
    
    function toggleAutoSkipTime() {
        updateSettings((settings: any) => ({ ...settings, autoSkipTime: 14 }));
    }

    function toggleAutoSkipMode() {
        var newMode = settings.autoSkipMode+1;
        if(settings.autoSkipMode > 1) {
            newMode = 0;
        }
        updateSettings((settings: any) => ({ ...settings, autoSkipMode: newMode }));
    }

    return {
        introSkipTime: settings.introSkipTime,
        outroSkipTime: settings.outroSkipTime,
        autoSkipTime: settings.autoSkipTime,
        autoSkipMode: settings.autoSkipMode,
        toggleAutoSkipTime,
        toggleAutoSkipMode,
        fadeTime: settings.fadeTime as Number
    }
}