import React, { useContext } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Text, Button } from '@rneui/themed';
import { AppContext } from '../context/SpotifyContext';
import { Background } from '../components/Background';

export const WelcomeScreen = ({ navigation }: any) => {
  const { user } = useContext(AppContext);
  const { isConnected} = useContext(AppContext);

  return (
    <Background style={styles.container}>
      {isConnected ? (
        <>
          <Text>Welcome {user.display_name}</Text>
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
    justifyContent: 'center',
  },
});
