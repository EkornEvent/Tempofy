import React, {useEffect, useState, createContext} from 'react';
import {
    auth,
    remote,
    ApiConfig,
    ApiScope,
    SpotifyRemoteApi,
    PlayerState} from 'react-native-spotify-remote';

import SpotifyWebApi from 'spotify-web-api-node';
import { useInterval } from '../helpers/hooks';
const spotifyWebApi = new SpotifyWebApi();

const SPOTIFY_CLIENT_ID = "af12e293266d43f98e6cef548cd67197";
const SPOTIFY_REDIRECT_URL = "tempofy-login://callback";
const SPOTIFY_TOKEN_REFRESH_URL = "https://us-central1-organic-poetry-135723.cloudfunctions.net/endpoint/refresh/";
const SPOTIFY_TOKEN_SWAP_URL = "https://us-central1-organic-poetry-135723.cloudfunctions.net/endpoint/swap/";

interface AuthOptions {
    playURI?: string;
    showDialog?: boolean;
    autoConnect?: boolean;
    authType?: ApiConfig["authType"]
}

type Props = {
  children: React.ReactNode;
}

interface AppContext {
    authenticate: (options?: AuthOptions) => void;
    remote: SpotifyRemoteApi,
    isConnected: boolean;
    error?: string;
    playerState?: PlayerState;
    api: SpotifyWebApi,
    user: SpotifyApi.UserObjectPrivate
}

const defaultValue: AppContext = {
    authenticate: () => { },
    remote: {} as SpotifyRemoteApi,
    isConnected: false,
    api: spotifyWebApi,
    user: {} as SpotifyApi.UserObjectPrivate,
}

export const AppContext = createContext(defaultValue);

export const AppContextProvider = (props: Props) => {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [token, setToken] = useState<string | null>(null);
    const [playerState, setPlayerState] = useState<PlayerState>();
    const [user, setUser] = useState<SpotifyApi.UserObjectPrivate>({} as SpotifyApi.UserObjectPrivate);
    const [updateInterval, setUpdateInterval] = useState<number | null>(100);

    const authenticate = async () => {
        setError(undefined);
        const config: ApiConfig = {
            playURI: "",
            clientID: SPOTIFY_CLIENT_ID,
            redirectURL: SPOTIFY_REDIRECT_URL,
            tokenRefreshURL: SPOTIFY_TOKEN_REFRESH_URL,
            tokenSwapURL: SPOTIFY_TOKEN_SWAP_URL,
            scopes: [
                ApiScope.AppRemoteControlScope, 
                ApiScope.UserReadPrivateScope, 
                ApiScope.StreamingScope, 
                ApiScope.PlaylistReadPrivateScope, 
                ApiScope.PlaylistReadCollaborativeScope, 
                ApiScope.PlaylistModifyPrivateScope, 
                ApiScope.PlaylistModifyPublicScope
              ]
        };

        try {
            const { accessToken } = await auth.authorize(config);
            await remote.connect(accessToken);
            setToken(accessToken);
        } catch (err:any) {
            setError(err.message);
        }
    };

    useEffect(() => {
        if(token) {
            spotifyWebApi.setAccessToken(token);
            spotifyWebApi.getMe()
            .then(function(data) {
                setUser(data.body as SpotifyApi.UserObjectPrivate);
            }, function(err) {
                setError(err.message);
            });
        }
    },[token])

    useEffect(() => {
        remote.isConnectedAsync().then(result => {
            setIsConnected(result);
        })
        
        setError(undefined);
        remote.addListener("remoteConnected", onConnected);
        remote.addListener("remoteDisconnected", onDisconnected);
        remote.addListener("playerStateChanged", onPlayerStateChanged);
		
        auth.getSession().then((session) => {
            if (session != undefined && session.accessToken != undefined) {
                setToken(session.accessToken);
                remote.connect(session.accessToken);
            }
        });

        return () => {
            remote.removeAllListeners();
        }
    },[])

    useInterval(() => {
        setUpdateInterval(null);
        remote.getPlayerState().then(() => {
            setUpdateInterval(100);
        })
        .catch(() => {
            setUpdateInterval(1000);
        })
    }, updateInterval);

    const onConnected = () => {
        setIsConnected(true);
    }

    const onDisconnected = () => {
        setIsConnected(false);
    }

    const onPlayerStateChanged = (result: any) => {
        setPlayerState(result[0] as PlayerState);
    }

    return (
        <AppContext.Provider
            value={{
                authenticate,
                remote,
                isConnected,
                playerState,
                error,
                api: spotifyWebApi,
                user
            }}
        >
            {props.children}
        </AppContext.Provider>
    
    );
};