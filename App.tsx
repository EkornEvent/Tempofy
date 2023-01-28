import { StyleSheet, SafeAreaView } from "react-native";
import { AppContextProvider} from './src/context/SpotifyContext';
import { QueueContextProvider} from './src/context/QueueContext';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
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
import { NowPlayingContextProvider } from './src/context/NowPlayingContext';
import { Button, Icon, ThemeProvider } from '@rneui/themed';
import { theme } from './src/helpers/theme';
import { useKeepAwake } from 'expo-keep-awake';
import { SettingScreen } from "./src/screens/Settings";

const Stack = createNativeStackNavigator();

const NavigationTheme = {
    ...DarkTheme,
    dark: true,
    colors: {
        ...DarkTheme.colors,
        background: theme.darkColors?.background ? theme.darkColors.background : '',
        card: theme.darkColors?.background ? theme.darkColors.background : '',
        primary: theme.darkColors?.primary ? theme.darkColors.primary : ''
    },
};

export default function App() {
    useKeepAwake();
    
    return (
        <SafeAreaView style={styles.container}>
            <Providers>
                <NavigationContainer theme={NavigationTheme}>
                    <NavigationRoutes />
                </NavigationContainer>
                <NowPlayingBar />
                <ConnectionBar />
                <AuthenticateScreen />
            </Providers>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.darkColors?.background
    }
});

type Props = {
    children: React.ReactNode;
}

const Providers = (props: Props) => (
    <ThemeProvider theme={theme}>
        <AppContextProvider>
            <QueueContextProvider>
                <SettingsContextProvider>
                    <TempoContextProvider>
                        <VolumeContextProvider>
                            <NowPlayingContextProvider>
                                {props.children}
                            </NowPlayingContextProvider>
                        </VolumeContextProvider>
                    </TempoContextProvider>
                </SettingsContextProvider>
            </QueueContextProvider>
        </AppContextProvider>
    </ThemeProvider>
)

const NavigationRoutes = () => (
    <Stack.Navigator>
        <Stack.Screen name="Home" component={WelcomeScreen} />
        <Stack.Screen name="Playlist" component={PlaylistScreen} />
        <Stack.Screen 
            name="Tracks" 
            component={TrackScreen} 
            options={({ navigation, route }) => ({
                headerRight: () => (
                    <Icon
                        name='settings'
                        onPress={() => navigation.navigate('Settings')}
                    />
                )
            })}
        />
        <Stack.Screen name="Settings" component={SettingScreen} />
    </Stack.Navigator>
)