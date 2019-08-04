import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, View, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { ListItem, Button } from 'react-native-elements';
import { useNavigationParam, useNavigation } from 'react-navigation-hooks';
import { Track } from 'api/Types';
import TempoFilter from 'components/TempoFilter';
import NowPlayingBar from 'components/NowPlayingBar';
import { useContent, usePlayer } from 'hooks';

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  shuffle: {
    height: 80
  },
  footer: {

  }
});



const TrackScreen = () => {
  const { navigate } = useNavigation();
  const playlistId = useNavigationParam("playlistId");
  const { playTrack } = usePlayer();
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);
  const {playlistTracks, filteredTracks, getPlaylistTracks, setFilteredTracks} = useContent();

  useEffect(() => {
    loadTracks();
  },[offset]);

  useEffect(() => {
    setFilteredTracks(playlistTracks);
  },[playlistTracks]);

  async function loadTracks() {
    setIsFetching(true);
    await getPlaylistTracks(playlistId);
    setIsFetching(false);
  };

  function filterTracksWithTempo(tempo: number) {
    const newFilteredTracks: Track[] = playlistTracks.filter((track: Track) => {
      const minTempo = tempo;
      const maxTempo = minTempo + 5;
      return (track.tempo > minTempo) && (track.tempo < maxTempo)
    })
    setFilteredTracks(newFilteredTracks);
  }

  function onPressShuffle() {
    var currentIndex = filteredTracks.length, temporaryValue, randomIndex;
    const filterTracksShuffled: Track[]  = Object.assign([], filteredTracks);

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = filterTracksShuffled[currentIndex];
      filterTracksShuffled[currentIndex] = filterTracksShuffled[randomIndex];
      filterTracksShuffled[randomIndex] = temporaryValue;
    }
    setFilteredTracks(filterTracksShuffled);
    playTrack(filterTracksShuffled[0]);
  }

  function onPressTrack(item: Track) {
    playTrack(item);
  };

  function onPressNowPlaying() {
    navigate('Fullscreen');
  }

  const _keyExtractor = (item: Track, index: number) => index.toString();
  const _renderItem = ({ item }: { item: Track }) => (
    <ListItem 
      title={(item && item.track) ? item.track.name : null} 
      badge={item.tempo ? { value: Math.floor(item.tempo) } : undefined}
      onPress={() => onPressTrack(item)}
    />
  );
  const _renderFooter = () => (
    <View style={styles.footer}>
      {isFetching ? (
        <ActivityIndicator />
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <TempoFilter tracks={playlistTracks} onFilterTracks={(value: number) => filterTracksWithTempo(value)}/>
        <Button title="Play Shuffle" buttonStyle={styles.shuffle} onPress={() => onPressShuffle()}/>
      </View>
      <FlatList
        data={filteredTracks}
        keyExtractor={_keyExtractor}
        renderItem={_renderItem}
        ListFooterComponent={_renderFooter}
      />
      <NowPlayingBar onPress={() => onPressNowPlaying()}/>
    </SafeAreaView>
  )
}

export default TrackScreen;