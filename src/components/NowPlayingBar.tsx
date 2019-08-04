import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ListItem, Text, Icon } from 'react-native-elements';
//import PlatformIcon from './PlatformIcon';
//<PlatformIcon size={26} shortName={playerState.paused ? 'play' : 'pause'} style={styles.playPause}/>
import moment from 'moment';
import { useMetadata, useTrackState } from 'hooks';
import Spotify from 'rn-spotify-sdk';

interface NowPlayingBarProps {
  onPress: Function
}

const NowPlayingBar = (props: NowPlayingBarProps) => {
  const state = useTrackState();
  const metadata = useMetadata();
  
  function togglePlayPause() {
    Spotify.setPlaying(!state.playing);
  }

  function getTimeLeft() {
    if(metadata && metadata.currentTrack && state) {
      var playDuration = metadata.currentTrack.duration;
      //if(this.props.autoSkipMode > 0 && this.props.autoSkipTimeLeftPosition != null)
        //playDuration = props.player.autoSkipTimeLeftPosition;
      const timeLeft = playDuration - state.position;
      var duration = moment.duration(timeLeft > 0 ? timeLeft : 0, 'seconds');
      const seconds = moment(duration.seconds(),'seconds');
      return `${duration.minutes()}:${seconds.format('ss')}`;
    } else {
      return '';
    }
  }

  const currentTrack = metadata ? metadata.currentTrack : null;
  return (
    <View style={styles.container}>
    {currentTrack && state &&
      <View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressDone, {flex: Spotify.getVolume()}]} />
          <View style={[styles.progressLeft, {flex: 1 - Spotify.getVolume()}]} />
        </View>
        <ListItem
          title={currentTrack.name}
          subtitle={currentTrack.artistName}
          onPress={() => props.onPress()}
          rightIcon={
              <TouchableOpacity style={styles.rightIcon} onPress={() => togglePlayPause()}>
                <Text style={styles.timer}>{getTimeLeft()}</Text>
                <Icon name={state.playing ? 'pause-circle-outline' : 'play-circle-outline'} />
              </TouchableOpacity>
          }
          topDivider={true}
        />
        <View style={styles.progressContainer}>
          <View style={[styles.progressDone, {flex: state.position}]} />
          <View style={[styles.progressLeft, {flex: metadata.currentTrack.duration - state.position}]} />
        </View>
      </View>
    }
  </View>
  )
}

const styles = StyleSheet.create({
  container: {

  },
  rightIcon: {
    flexDirection: 'row'
  },
  playPause: {
    margin: 5
  },
  timer: {
    alignSelf:'center'
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

export default NowPlayingBar;