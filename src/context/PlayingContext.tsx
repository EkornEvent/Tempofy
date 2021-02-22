import React, { useEffect, useState } from 'react';
import { usePlayBlocks } from 'hooks';

const PlayingContext = React.createContext([{}, () => {}]);

const PlayingProvider = (props: any) => {
  const [playing, setPlaying] = useState({
    playlistTracks: [],
    filteredTracks: [],
    playBlocks: [],
    currentBlock: null
  });

  const [currentBlock, playBlocks, playBlock] = usePlayBlocks();
  
  useEffect(() => {
    setPlaying(playing => ({ ...playing, playBlocks }));
  }, [playBlocks])

  useEffect(() => {
    setPlaying(playing => ({ ...playing, currentBlock }));
  }, [currentBlock])

  return (
    <PlayingContext.Provider value={[playing, setPlaying]}>
      {props.children}
    </PlayingContext.Provider>
  );
}

export { PlayingContext, PlayingProvider };