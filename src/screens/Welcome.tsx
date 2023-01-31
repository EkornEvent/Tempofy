import React, { useContext } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Text, Button } from '@rneui/themed';
import { AppContext } from '../context/SpotifyContext';
import { Background } from '../components/Background';
import * as Linking from 'expo-linking';
import analytics from '@react-native-firebase/analytics';
import { TempoCounter } from '../components/TempoCounter';

export const WelcomeScreen = ({ navigation }: any) => {
  const { isConnected, user, setUserPressedConnected } = useContext(AppContext);

  const onReadMore = () => {
    Linking.openURL('https://www.patreon.com/tempofy');
    analytics().logEvent('read_more');
  }

  const handleClick = () => {
    setUserPressedConnected(true);
  }
  
  return (
    <Background style={styles.container}>
      <TempoCounter />
      {isConnected ? (
        <>
          <Text h3>Welcome {user.display_name}</Text>
          <Text>Tempofy is free to use and has been from the start. We get by from our amazing community to keep the lights on. If you love our product, please consider joining the cause!</Text>
          <Button
              title="Read more"
              type="clear"
              onPress={onReadMore}
            />
          <Button title="Show my playlists" onPress={() => navigation.navigate('Playlist')}/>
        </>
      ):(
        <Button 
            onPress={handleClick} 
            title="View Spotify platlists"
            icon={{
                name: 'spotify',
                type: 'font-awesome'
            }}
            iconRight
        />
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
