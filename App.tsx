import { useContext } from 'react';
import { StyleSheet, SafeAreaView } from "react-native";
import { AppContextProvider, AppContext} from './src/context/SpotifyContext';
import { QueueContextProvider, QueueContext} from './src/context/QueueContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthenticateScreen } from './src/screens/Authenticate';
import { WelcomeScreen } from './src/screens/Welcome';
import { PlaylistScreen } from './src/screens/Playlist';
import { NowPlayingBar } from './src/components/NowPlayingBar';
import { TrackScreen } from './src/screens/Tracks';
import { SettingsContextProvider } from './src/context/SettingsContext';
import { ConnectionBar } from './src/components/ConnectionBar';
import { TempoContextProvider } from './src/context/TempoContext';
import { VolumeContextProvider } from './src/context/VolumeContext';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <SafeAreaView style={styles.container}>
            <Providers>
                <NavigationContainer>
                    <NavigationRoutes />
                </NavigationContainer>
                <NowPlayingBar />
                <ConnectionBar />
            </Providers>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

type Props = {
    children: React.ReactNode;
}

const Providers = (props: Props) => (
    <AppContextProvider>
        <QueueContextProvider>
            <SettingsContextProvider>
                <TempoContextProvider>
                    <VolumeContextProvider>
                        {props.children}
                    </VolumeContextProvider>
                </TempoContextProvider>
            </SettingsContextProvider>
        </QueueContextProvider>
    </AppContextProvider>
)

const NavigationRoutes = () => {
    const { isConnected } = useContext(AppContext);
  
    return (
        <Stack.Navigator>
            {isConnected ? (
            <>
                <Stack.Screen name="Home" component={WelcomeScreen} />
                <Stack.Screen name="Playlist" component={PlaylistScreen} />
                <Stack.Screen name="Tracks" component={TrackScreen} />
            </>
        ):(
            <Stack.Screen name="Welcome" component={AuthenticateScreen} />
        )}
        </Stack.Navigator>
    )
}