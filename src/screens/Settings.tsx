import React, { useContext } from "react";
import { FlatList, View, Alert } from "react-native";
import { ListItem, Button } from '@rneui/themed';
import { SettingsContext } from "../context/SettingsContext";
import { AppContext } from "../context/SpotifyContext";

export const SettingScreen = () => {
    const {
        introSkipTime, setIntroSkipTime,
        outroSkipTime, setOutroSkipTime,
        fadeTime, setFadeTime,
        waitDuringPause, setWaitDuringPause
    } = useContext(SettingsContext);
    const { isConnected, authenticate, disconnect } = useContext(AppContext);

    const onDisconnect = () => {
        Alert.alert(
            'Disconnect Spotify?',
            'You will need to reconnect to keep using Tempofy.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Disconnect', style: 'destructive', onPress: () => { disconnect(); } },
            ],
        );
    };

    const settings = [
        {
            key: 'introSkipTime',
            name: 'Intro skip time',
            value: introSkipTime,
            dispatch: setIntroSkipTime
        },
        {
            key: 'outroSkipTime',
            name: 'Outro skip time',
            value: outroSkipTime,
            dispatch: setOutroSkipTime
        },
        {
            key: 'fadeTime',
            name: 'Fade time',
            value: fadeTime,
            dispatch: setFadeTime
        },
        {
            key: 'waitDuringPause',
            name: 'Wait during pause',
            value: waitDuringPause,
            dispatch: setWaitDuringPause
        }
    ];

    function numberWithCommas(input: string) {
        return parseFloat(input.replace(/,/g, '.'))
    }

    const onChange = (setting: any, input: string) => {
        const value = numberWithCommas(input)*1000;
        setting.dispatch(value);
    }

    const renderItem = ({ item }:any) => (
        <ListItem bottomDivider >
            <ListItem.Content>
                <ListItem.Title>{item.name}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Input 
                keyboardType="decimal-pad"
                placeholder={(item.value/1000).toString()} 
                onChangeText={(value: any) => onChange(item, value)}
            />
        </ListItem>
    )

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={settings}
                renderItem={renderItem}
            />
            {isConnected ? (
                <Button
                    title="Disconnect Spotify"
                    type="outline"
                    onPress={onDisconnect}
                    containerStyle={{ margin: 16 }}
                />
            ) : (
                <Button
                    title="Connect to Spotify"
                    onPress={() => authenticate()}
                    icon={{ name: 'spotify', type: 'font-awesome' }}
                    iconRight
                    containerStyle={{ margin: 16 }}
                />
            )}
        </View>
    )
}