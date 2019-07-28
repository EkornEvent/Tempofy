import React, { useState } from 'react';

const TempofyContext = React.createContext([{}, () => {}]);

const TempofyProvider = (props: any) => {
  const [state, setState] = useState({
    introSkipTime: 15,
    outroSkipTime: 5,
    autoSkipTime: 30,
    fadeTime: 2,
    playlistTracks: [],
    filteredTracks: []
  });
  return (
    <TempofyContext.Provider value={[state, setState]}>
      {props.children}
    </TempofyContext.Provider>
  );
}

export { TempofyContext, TempofyProvider };