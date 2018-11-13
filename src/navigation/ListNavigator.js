import { createStackNavigator } from 'react-navigation';
import LoginScreen from '../screens/LoginScreen';
import PlaylistScreen from '../screens/PlaylistScreen';
import TrackScreen from '../screens/TrackScreen';
import FullScreen from '../screens/FullScreen';

const ListStack = createStackNavigator({
  Login: {
    screen: LoginScreen,
    navigationOptions: ({ navigation }) => ({
      title: 'Login',
    }),
  },
  Playlists: {
    screen: PlaylistScreen,
    navigationOptions: ({ navigation }) => ({
      title: 'Playlists',
    }),
  },
  Tracks: {
    screen: TrackScreen,
    navigationOptions: ({ navigation }) => ({
      title: navigation.state.params.title,
    }),
  },
  Fullscreen: {
    screen: FullScreen,
    navigationOptions: ({ navigation }) => ({
      title: 'Tempofy',
    }),
  }
})

export default ListStack
