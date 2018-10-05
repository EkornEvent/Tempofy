import React from 'react';
import { connect } from 'react-redux'
import { compose, withHandlers, lifecycle } from 'recompose'
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { ListItem, Text, Button } from 'react-native-elements';
import withSpotify from '../utils/spotify'
import PlatformIcon from './PlatformIcon';

const styles = StyleSheet.create({
  container: {

  },
  playPause: {
    margin: 5
  }
});

const NowPlayingBar = ({player, togglePlayPause, onPress}) => (
  <View style={styles.container}>
    {player &&
      <ListItem
        title={player.name}
        subtitle={player.artistName}
        onPress={() => onPress()}
        rightIcon={
          <TouchableOpacity onPress={() => togglePlayPause()}>
            <PlatformIcon size={26} shortName={player.paused ? 'play' : 'pause'} style={styles.playPause}/>
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
    player: player.playerState
  })),
  withHandlers({
    togglePlayPause: props => () => {
      if(props.player.paused)
        props.spotify.resume()
      else
        props.spotify.pause()
    }
  })
)(NowPlayingBar)
