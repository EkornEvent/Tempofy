import React from 'react';
import { connect } from 'react-redux'
import { compose, withHandlers, mapProps } from 'recompose'
import { StyleSheet, View, SafeAreaView, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { ListItem, Text, Button } from 'react-native-elements';
import { LinearGradient } from 'expo';
import withSpotify from '../utils/spotify'
import PlatformIcon from '../components/PlatformIcon';
import moment from 'moment';
import actionTypes from '../constants'

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
    color: 'white'
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

const FullScreen = ({trackDurationTime, trackPositionTime, position, timer, url, playBlocks, player, playerState, onPlayBlock, canSkipPrevious, canSkipNext, onSkipPrevious, togglePlayPause, onSkipNext, toggleAutoSkipMode, toggleAutoSkipTime, isFading}) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.coverContainer}>
      <ImageBackground
        style={styles.coverImage}
        source={
          url ? (
          {uri: url}
          ):(
          require('../assets/images/cover-placeholder.png')
        )}
      >
      <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 200,
          }}
        />
      <View style={{flex: 1}} />
      <View>
        <Text h4 style={styles.coverText}>{playerState.name}</Text>
        <Text h5 style={styles.coverText}>{playerState.artistName}</Text>
        <Text h5 style={styles.coverText}>{trackPositionTime} / {trackDurationTime}</Text>
      </View>
      </ImageBackground>
    </View>
    <View style={styles.controlButtons}>
      <TouchableOpacity style={[styles.controlIcon,{opacity: canSkipPrevious ? 1 : 0.2}]} disabled={!canSkipPrevious} onPress={() => onSkipPrevious()}>
        <PlatformIcon size={40} shortName={'skip-backward'}/>
      </TouchableOpacity>
      <TouchableOpacity style={styles.controlIcon} onPress={() => togglePlayPause()}>
        <PlatformIcon size={40} shortName={playerState.paused ? isFading ? 'pause' : 'play' : 'pause'}/>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.controlIcon,{opacity: canSkipNext ? 1 : 0.2}]} disabled={!canSkipNext} onPress={() => onSkipNext()}>
        <PlatformIcon size={40} shortName={'skip-forward'}/>
      </TouchableOpacity>
    </View>
    <View style={styles.controlButtons}>
      <View style={styles.controlIcon}>
        <Text h4>{timer}</Text>
      </View>
      <TouchableOpacity style={styles.controlIcon} onPress={() => toggleAutoSkipMode()}>
        <View>
          <PlatformIcon size={40} shortName={player.autoSkipMode > 0 ? (player.autoSkipMode == 1 ? 'redo' : 'megaphone') : 'infinite'}/>
          <Text>{player.autoSkipMode > 0 ? (player.autoSkipMode == 1 ? 'Skip timer' : 'Fade timer') : 'Play track'}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.controlIcon} onPress={() => toggleAutoSkipTime()}>
        <View>
          <Text h4>{player.autoSkipTime/1000}</Text>
          <Text>sec</Text>
        </View>
      </TouchableOpacity>
    </View>
    <View style={styles.blocksContainer}>
      {
        playBlocks.map((block, index) => (
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
              <PlatformIcon size={30} shortName={'play'}/>
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
      <View style={[styles.progressDone, {flex: playerState.playbackPosition}]} />
      <View style={[styles.progressLeft, {flex: playerState.duration - playerState.playbackPosition}]} />
    </View>
  </SafeAreaView>
)

export default compose(
  withSpotify,
  connect(({spotify, player, data}) => ({
    connected: spotify.connected,
    player: player,
    playerState: player.playerState,
    filteredTracks: data.filteredTracks,
    isFading: data.isFading,
    currentTrackIndex: data.currentTrackIndex
  })),
  mapProps((props) => {
    const fullTrack = props.filteredTracks && props.filteredTracks.find(item => item.track.uri === props.playerState.uri)
    const url = fullTrack ? fullTrack.track.album.images[0].url : null

    // Total track duration
    const trackDuration = props.playerState.duration
    var trackDurationTime = moment.duration(trackDuration, 'milliseconds');
    trackDurationTime = moment(trackDurationTime._data).format("m:ss");

    // Current playback positionconst trackDuration = props.playerState.duration
    var trackPositionTime = moment.duration(props.playerState.playbackPosition, 'milliseconds');
    trackPositionTime = moment(trackPositionTime._data).format("m:ss");

    // Count down timer
    var timer = null
    var playDuration = trackDuration
  	//if(this.props.autoSkipMode > 0 && this.props.autoSkipTimeLeftPosition != null)
  		playDuration = props.player.autoSkipTimeLeftPosition;
    const timeLeft = playDuration - props.playerState.playbackPosition;
    var duration = moment.duration(timeLeft > 0 ? timeLeft : 0, 'milliseconds');
  	timer = moment(duration._data).format("m:ss");

    const autoSkipTime = props.player.autoSkipTime
    var playBlocks = props.spotify.getAllBlocks()

    return {
      ...props,
      timer,
      trackDurationTime,
      trackPositionTime,
      url,
      playBlocks,
      canSkipPrevious: props.spotify.canSkipPrevious(),
      canSkipNext: props.spotify.canSkipNext()
    }
  }),
  withHandlers({
    onSkipPrevious: props => () => {
      props.spotify.skipToPrevious()
    },
    onSkipNext: props => () => {
      props.spotify.skipToNext()
    },
    togglePlayPause: props => () => {
      if(props.player.playerState.paused && !props.isFading) {
        if(props.connected) {
          props.spotify.resume()
        } else {
          props.spotify.authorizeAndPlayURI(props.playerState.uri, props.currentTrackIndex)
        }
      } else {
        props.spotify.pause()
      }
    },
    onPlayBlock: props => (block) => {
      props.spotify.playBlock(block)
    },
    toggleAutoSkipMode: props => () => {
      props.dispatch({ type: actionTypes.TOGGLE_SKIP_MODE })
    },
    toggleAutoSkipTime: props => () => {
      props.dispatch({ type: actionTypes.TOGGLE_SKIP_TIME })
      const autoSkipTime = props.spotify.store.getState().player.autoSkipTime
      const playerState = props.spotify.store.getState().player.playerState
      props.spotify.setupPlayBlocks(playerState, autoSkipTime)
    }
  })
)(FullScreen)
