import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { Icon } from 'react-native-elements'
import Spotify from 'rn-spotify-sdk';
import { useNavigation } from 'react-navigation-hooks';
import Data from 'api/Data';

const LoginScreen = () => {
  const [spotifyInitialized, setSpotifyInitialized] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const { navigate } = useNavigation();

  useEffect(() => {
    initializeIfNeeded();
  }, []);


  async function initializeIfNeeded() {
    setIsFetching(true);
    await Data.getTempo();
    setIsFetching(false);

		// initialize Spotify if it hasn't been initialized yet
		if(!await Spotify.isInitializedAsync()) {
			// initialize spotify
			const spotifyOptions = {
				"clientID":"af12e293266d43f98e6cef548cd67197",
				"sessionUserDefaultsKey":"TempofySession",
				"redirectURL":"tempofy-login://callback",
        "scopes":["user-read-private", "streaming", "playlist-read-private", "playlist-read-collaborative", "playlist-modify-private", "playlist-modify-public"],
        "android": {"useCustomTrackController": true},
        "tokenSwapURL": "https://us-central1-organic-poetry-135723.cloudfunctions.net/endpoint/swap/",
        "tokenRefreshURL": "https://us-central1-organic-poetry-135723.cloudfunctions.net/endpoint/refresh/"
			};
      await Spotify.initialize(spotifyOptions);
      const loggedIn = await Spotify.isLoggedInAsync();
      
			// update UI state
      setSpotifyInitialized(true);
      
			// handle initialization
			if(loggedIn) {
				goToPlayer();
			}
		}
		else {
			// update UI state
      setSpotifyInitialized(true);
      
			// handle logged in
			if(await Spotify.isLoggedInAsync()) {
				goToPlayer();
			}
		}
	}

  function onPress() {
    // log into Spotify
		Spotify.login().then((loggedIn: boolean) => {
			if(loggedIn) {
				// logged in
				goToPlayer();
			}
			else {
				// cancelled
			}
		}).catch((error: Error) => {
			// error
			Alert.alert("Error", error.message);
		});
  }

  function goToPlayer() {
    navigate("Playlists");
  }

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text h1>Tempofy</Text>
        <Text>Play music by tempo</Text>
      </View>
      <Button
        buttonStyle={styles.button}
        onPress={() => onPress()}
        loading={!spotifyInitialized}
        icon={
          <Icon
            name='arrow-upward'
            size={15}
            color='white'
          />
        }
        title='Sign in with Spotify'
      />
      <View style={styles.textContainer}>
        {isFetching && 
          <Text>Downloading tempo: {isFetching.toString()}</Text>
        }
        <Text>Initialized: {Spotify.isInitialized().toString()}</Text>
        <Text>Signed in: {Spotify.isLoggedIn().toString()}</Text>
      </View>
    </View>
  )
}

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

export default LoginScreen;