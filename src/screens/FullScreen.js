import React from 'react';
import { connect } from 'react-redux'
import { compose, withHandlers, lifecycle, mapProps, withState } from 'recompose'
import { ScrollView, StyleSheet, View, SafeAreaView } from 'react-native';
import { ListItem, Text, Button } from 'react-native-elements';
import withSpotify from '../utils/spotify'
import { spinnerWhileLoading, shuffleArray } from '../utils'
import NowPlayingBar from '../components/NowPlayingBar'
import TempoFilter from '../components/TempoFilter'
import PlatformIcon from '../components/PlatformIcon';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10
  }
});

const FullScreen = ({error, player}) => (
  <SafeAreaView style={styles.container}>
    {error &&
      <View>
        <Text h4>{error}</Text>
      </View>
    }
    <View>
      <Text h4>{player.playerState.name}</Text>
      <Text h4>Time left: {player.autoSkipTimeLeft} seconds</Text>
    </View>
  </SafeAreaView>
)

export default compose(
  withSpotify,
  connect(({spotify, player, data}) => ({
    error: spotify.error,
    player: player
  })),
  withHandlers({
  })
)(FullScreen)
