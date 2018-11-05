import React from 'react';
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { StyleSheet, View, Dimensions } from 'react-native';
import { Text } from 'react-native-elements';
import { Constants } from 'expo';
const { width } = Dimensions.get('window');
import { Header } from 'react-navigation';

import withSpotify from '../utils/spotify'

const styles = StyleSheet.create({
  container: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width,
    position: 'absolute',
    top: (Header.HEIGHT + Constants.statusBarHeight - 30)
  },
  offlineContainer: {
    backgroundColor: '#b52424'
  },
  offlineText: {
    color: '#fff'
  },
  connectingContainer: {
    backgroundColor: 'orange'
  },
});

const ConnectionBar = ({ connecting, connected, error }) => {
  if(connected)
    return null

  if(connecting)
    return (
      <View style={[styles.container, styles.connectingContainer]}>
        <Text style={styles.offlineText}>{'Connecting'}</Text>
      </View>
    )

  if(error)
    return (
      <View style={[styles.container, styles.offlineContainer]}>
        <Text style={styles.offlineText}>{error}</Text>
      </View>
    )

  return (
    <View style={[styles.container, styles.offlineContainer]}>
      <Text style={styles.offlineText}>{'Disconnected'}</Text>
    </View>
  )

}

export default compose(
  withSpotify,
  connect(({spotify}) => ({
    connecting: spotify.connecting,
    connected: spotify.connected,
    error: spotify.error
  }))
)(ConnectionBar)
