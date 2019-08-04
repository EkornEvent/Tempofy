import React, { useState } from 'react';
import { AutoSkipMode } from 'api/Types';

interface SettingsInterface {
  introSkipTime: number,
  outroSkipTime: number,
  autoSkipTime: number,
  autoSkipMode: AutoSkipMode,
  fadeTime: number
}

const defaultSettings = {
  introSkipTime: 15,
  outroSkipTime: 5,
  autoSkipTime: 30,
  autoSkipMode: AutoSkipMode.Skip,
  fadeTime: 2
}
const SettingsContext = React.createContext<SettingsInterface>([defaultSettings, () => {}]);

const SettingsProvider = (props: any) => {
  const [settings, updateSettings] = useState<SettingsInterface>(defaultSettings);
  return (
    <SettingsContext.Provider value={[settings, updateSettings]}>
      {props.children}
    </SettingsContext.Provider>
  );
}

export { SettingsContext, SettingsProvider };