import React from 'react';
import { connect } from 'react-redux'
import { compose, withHandlers, lifecycle } from 'recompose'
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
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

const LoginScreen = ({connecting, error, onPress}) => (
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
  </View>
)

export default compose(
  withSpotify,
  connect(({spotify}) => ({
    connecting: spotify.connecting,
    connected: spotify.connected,
    error: spotify.error
  })),
  withHandlers({
    onPress: ({spotify}) => () => {
      spotify.login()
    },
    continue: props => () => {
      props.navigation.navigate('List')
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
