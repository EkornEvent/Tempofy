import React, { useContext } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Text, Button } from '@rneui/themed';
import { AppContext } from '../context/SpotifyContext';
import { Background } from '../components/Background';
import * as Linking from 'expo-linking';
import analytics from '@react-native-firebase/analytics';

export const WelcomeScreen = ({ navigation }: any) => {
  const { user } = useContext(AppContext);
  const { isConnected} = useContext(AppContext);

  const onReadMore = () => {
    Linking.openURL('https://www.patreon.com/tempofy');
    analytics().logEvent('read_more');
  }
  
  return (
    <Background style={styles.container}>
      {isConnected ? (
        <>
          <Text h3>Welcome {user.display_name}</Text>
          <Text>Tempofy is free to use and has been from the start. We get by on donations from our amazing community to keep the lights on. If you love our product, please consider joining the cause!</Text>
          <Button
              title="Read more"
              type="clear"
              onPress={onReadMore}
            />
          <Button title="Show my playlists" onPress={() => navigation.navigate('Playlist')}/>
        </>
      ):(
        <ActivityIndicator/>
      )}
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 50,
    justifyContent: 'space-evenly'
  },
});
