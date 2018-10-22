import React from 'react';
import { connect } from 'react-redux'
import { compose, withHandlers, lifecycle, mapProps } from 'recompose'
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { ListItem, Text, Button } from 'react-native-elements';
import withSpotify from '../utils/spotify'
import PlatformIcon from './PlatformIcon';
import moment from 'moment';

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
  }
});

const NowPlayingBar = ({playerState, timer, togglePlayPause, onPress}) => (
  <View style={styles.container}>
    {playerState &&
      <ListItem
        title={playerState.name}
        subtitle={playerState.artistName}
        onPress={() => onPress()}
        rightIcon={
            <TouchableOpacity style={styles.rightIcon} onPress={() => togglePlayPause()}>
              <Text style={styles.timer}>{timer}</Text>
              <PlatformIcon size={26} shortName={playerState.paused ? 'play' : 'pause'} style={styles.playPause}/>
            </TouchableOpacity>
        }
        topDivider={true}
      />
    }
  </View>
)

export default compose(
  withSpotify,
  connect(({player, data}) => ({
    player: player,
    playerState: player.playerState
  })),
  mapProps((props) => {
    var timer = null
    if(props.player) {
      var playDuration = props.playerState.duration
    	//if(this.props.autoSkipMode > 0 && this.props.autoSkipTimeLeftPosition != null)
    		playDuration = props.player.autoSkipTimeLeftPosition;
      const timeLeft = playDuration - props.playerState.playbackPosition;
      var duration = moment.duration(timeLeft > 0 ? timeLeft : 0, 'milliseconds');
    	timer = moment(duration._data).format("m:ss");
    }
    return {
      ...props,
      timer
    }
  }),
  withHandlers({
    togglePlayPause: props => () => {
      if(props.player.paused)
        props.spotify.resume()
      else
        props.spotify.pause()
    }
  })
)(NowPlayingBar)
