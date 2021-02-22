import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, View, SafeAreaView, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { Text, Icon } from 'react-native-elements';
import { Track, PlayBlock } from 'api/Types';
import moment from 'moment';
import { useMetadata, useTrackState, useContent, useSettings, usePlayer } from 'hooks';
import { PlayingContext } from "context/PlayingContext";
import Spotify from 'rn-spotify-sdk';

const FullScreen = () => {
  const { autoSkipTime, autoSkipMode, toggleAutoSkipTime, toggleAutoSkipMode } = useSettings();
  const state = useTrackState();
  const metadata = useMetadata();
  const { playTrack } = usePlayer();
  
  const [playing, setPlaying] = useContext(PlayingContext);
  const {playlistTracks} = useContent();
  const isFading = false;
  const [canSkipPrevious, setCanSkipPrevious] = useState(false);
  const [canSkipNext, setCanSkipNext] = useState(false);

  useEffect(() => {
    setCanSkipNext(metadata && metadata.nextTrack);
    setCanSkipPrevious(metadata && metadata.previousTrack);
  }, [metadata])

  function togglePlayPause() {
    Spotify.setPlaying(!state.playing);
  }

  function onSkipPrevious() {
    playTrack(metadata.previousTrack);
  }

  function onSkipNext() {
    playTrack(metadata.nextTrack);
  }

  function onPlayBlock(block: PlayBlock) {
    playing.playBlock(block);
  }
  
  
  if(metadata && metadata.currentTrack && state) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.coverContainer}>
          <View>
            {metadata.currentTrack.tempo > 0 && 
              <Text h4 style={styles.coverText}>{metadata.currentTrack.tempo.toString()} BPM</Text>
            }
            <Text h4 style={styles.coverText}>{metadata.currentTrack.name}</Text>
            <Text h5 style={styles.coverText}>{metadata.currentTrack.artistName}</Text>
            <Text h5 style={styles.coverText}>{state.position} / {metadata.currentTrack.duration}</Text>
          </View>
        </View>
        <View style={styles.controlButtons}>
          <TouchableOpacity style={[styles.controlIcon,{opacity: canSkipPrevious ? 1 : 0.2}]} disabled={!canSkipPrevious} onPress={() => onSkipPrevious()}>
            <Icon size={40} name={'skip-previous'}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlIcon} onPress={() => togglePlayPause()}>
            <Icon size={40} name={state.playing ? 'pause' : 'play-arrow'}/>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlIcon,{opacity: canSkipNext ? 1 : 0.2}]} disabled={!canSkipNext} onPress={() => onSkipNext()}>
            <Icon size={40} name={'skip-next'}/>
          </TouchableOpacity>
        </View>
        <View style={styles.controlButtons}>
          <View style={styles.controlIcon}>
            <Text h4>{state.position}</Text>
          </View>
          <TouchableOpacity style={styles.controlIcon} onPress={() => toggleAutoSkipMode()}>
            <View>
              <Icon size={40} name={autoSkipMode > 0 ? (autoSkipMode == 1 ? 'timer' : 'volume-down') : 'timer-off'}/>
              <Text>{autoSkipMode > 0 ? (autoSkipMode == 1 ? 'Skip timer' : 'Fade timer') : 'Play track'}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlIcon} onPress={() => toggleAutoSkipTime()}>
            <View>
              <Text h4>{autoSkipTime}</Text>
              <Text>sec</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressDone, {flex: Spotify.getVolume()}]} />
          <View style={[styles.progressLeft, {flex: 1 - Spotify.getVolume()}]} />
        </View>
        <View style={styles.blocksContainer}>
        {
          playing.playBlocks.map((block: PlayBlock, index: number) => (
            block.playable ? (
              <TouchableOpacity
                key={index}
                style={[
                  styles.blockItem,
                  {
                    flex: block.end-block.start
                  }
                ]}
                onPress={() => onPlayBlock(block)}
              >
                <Icon size={30} name={'play-arrow'}/>
              </TouchableOpacity>
            ) : (
              <View
                key={index}
                style={[
                  styles.blockItem,
                  {
                    flex: block.end-block.start,
                    backgroundColor: 'blue'
                  }
                ]} />
            )
          ))
        }
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressDone, {flex: state.position}]} />
          <View style={[styles.progressLeft, {flex: metadata.currentTrack.duration - state.position}]} />
        </View>
      </SafeAreaView>
    )
  } else {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.coverContainer}>
          <Text h4 style={styles.coverText}>Nothing playing...</Text>
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  coverContainer: {
    flex: 0
  },
  coverImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width
  },
  coverText: {
    color: 'black'
  },
  controlButtons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  controlIcon: {
    alignSelf: 'center',
    alignItems: 'center',
    padding: 10,
    width: 100
  },
  blocksContainer: {
    flex: 0,
    flexDirection: 'row'
  },
  blockItem: {
    borderWidth: 1,
    borderColor: 'red'
  },
  progressContainer: {
    flex: 0,
    flexDirection: 'row',
  },
  progressDone: {
    backgroundColor: 'green',
    height: 10
  },
  progressLeft: {
    backgroundColor: 'white',
    height: 10
  }
});

export default FullScreen;