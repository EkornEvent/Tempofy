import { createStackNavigator } from 'react-navigation';
import LoginScreen from '../screens/LoginScreen';
import PlaylistScreen from '../screens/PlaylistScreen';
import TrackScreen from '../screens/TrackScreen';
import FullScreen from '../screens/FullScreen';

const ListStack = createStackNavigator({
  Login: {
    screen: LoginScreen,
    navigationOptions: () => ({
      title: 'Login',
    })
  },
  Playlists: {
    screen: PlaylistScreen,
    navigationOptions: () => ({
      title: 'Playlists',
    })
  },
  Tracks: {
    screen: TrackScreen,
    navigationOptions: (props: any) => ({
      title: props.navigation.state.params.title,
    })
  },
  Fullscreen: {
    screen: FullScreen,
    navigationOptions: (props: any) => ({
      title: 'Tempofy',
    })
  }
});

export default ListStack;
