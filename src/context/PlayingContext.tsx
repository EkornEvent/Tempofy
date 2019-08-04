import React, { useState } from 'react';

const PlayingContext = React.createContext([{}, () => {}]);

const PlayingProvider = (props: any) => {
  const [playing, setPlaying] = useState({
    playlistTracks: [],
    filteredTracks: [],
    playBlocks: [],
    currentBlock: null
  });
  
  return (
    <PlayingContext.Provider value={[playing, setPlaying]}>
      {props.children}
    </PlayingContext.Provider>
  );
}

export { PlayingContext, PlayingProvider };