import React from 'react';
import { connect } from 'react-redux'
import { compose, withHandlers, lifecycle } from 'recompose'
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Button, Text } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { isLoaded } from '../utils'
import withSpotify from '../utils/spotify'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  textContainer: {
    padding: 30,
    alignItems: 'center'
  },
  button: {
    height: 70
  }
});

const LoginScreen = ({connecting, error, onPress, tempo}) => (
  <View style={styles.container}>
    <View style={styles.textContainer}>
      <Text h1>Tempofy</Text>
      <Text>Play music by tempo</Text>
    </View>
    <Button
      buttonStyle={styles.button}
      onPress={() => onPress()}
      loading={connecting}
      icon={
        <Icon
          name='arrow-right'
          size={15}
          color='white'
        />
      }
      title='Connect to Spotify'
    />
    <View style={styles.textContainer}>
      <Text>{error}</Text>
    </View>
    {!isLoaded(tempo) &&
    <View style={styles.textContainer}>
      <Text><ActivityIndicator /> Downloading tempo data...</Text>
    </View>
    }
  </View>
)

export default compose(
  withSpotify,
  connect(({spotify, data}) => ({
    connecting: spotify.connecting,
    connected: spotify.connected,
    error: spotify.error,
    tempo: data.tempo
  })),
  withHandlers({
    onPress: ({spotify}) => () => {
      spotify.login()
    },
    continue: props => () => {
      props.navigation.navigate('Playlists')
    }
  }),
  lifecycle({
    componentDidMount() {
      if(this.props.connected && !this.props.error)
        this.props.continue()
    },
    componentWillReceiveProps(nextProps) {
      if(nextProps.connected && !nextProps.error)
        this.props.continue()
    }
  }),
)(LoginScreen)
