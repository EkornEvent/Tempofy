import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '@rneui/themed';
import { AppContext } from '../context/SpotifyContext';
import { Text } from '@rneui/themed';

export const WelcomeScreen = ({ navigation }: any) => {
  const { user } = useContext(AppContext);

  return (
    <View style={styles.container}>
      <Text>Welcome {user.display_name}</Text>
      <Button title="Show my playlists" onPress={() => navigation.navigate('Playlist')}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
