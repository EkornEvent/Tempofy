import React from 'react';
import { connect } from 'react-redux'
import { compose, withHandlers, lifecycle } from 'recompose'
import { ScrollView, StyleSheet, View, SafeAreaView } from 'react-native';
import { ListItem, Text, Button } from 'react-native-elements';
import withSpotify from '../utils/spotify'
import { spinnerWhileLoading } from '../utils'

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

const PlaylistScreen = ({playlists, onPress, onRefresh}) => (
  <SafeAreaView style={styles.container}>
    <ScrollView>
    {
      playlists.map((item, i) => (
        <ListItem
          key={i}
          onPress={() => onPress(item)}
          title={item.name}
          badge={{ value: item.tracks.total }}
        />
      ))
    }
    </ScrollView>
  </SafeAreaView>
)

export default compose(
  withSpotify,
  connect(({spotify, data}) => ({
    playlists: data.playlists
  })),
  withHandlers({
    onPress: ({navigation}) => (item) => {
      navigation.navigate('Tracks', {playlistId: item.id, title: item.name})
    },
    onRefresh: props => () => {
      props.spotify.getUserPlaylists()
    }
  }),
  lifecycle({
    componentDidMount() {
      this.props.onRefresh()
    }
  }),
  spinnerWhileLoading(['playlists'])
)(PlaylistScreen)
