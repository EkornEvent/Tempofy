import React, { useContext } from "react";
import { FlatList, View, Alert } from "react-native";
import { ListItem, Button } from '@rneui/themed';
import { SettingsContext } from "../context/SettingsContext";
import { AppContext } from "../context/SpotifyContext";

export const SettingScreen = () => {
    const {
        introSkipTime, setIntroSkipTime,
        outroSkipTime, setOutroSkipTime,
        pauseTime, setPauseTime,
        bpmRange, setBpmRange
    } = useContext(SettingsContext);
    const { isConnected, remoteConnected, authenticate, disconnect, reconnect } = useContext(AppContext);

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

    // `scale` is the multiplier between the value shown in the input and the
    // stored value. Times are entered in seconds but stored in ms (scale 1000);
    // the BPM range is a raw number (scale 1).
    const settings = [
        {
            key: 'introSkipTime',
            name: 'Intro skip time',
            value: introSkipTime,
            dispatch: setIntroSkipTime,
            scale: 1000,
            unit: 'sec'
        },
        {
            key: 'outroSkipTime',
            name: 'Outro skip time',
            value: outroSkipTime,
            dispatch: setOutroSkipTime,
            scale: 1000,
            unit: 'sec'
        },
        {
            key: 'pauseTime',
            name: 'Pause time',
            value: pauseTime,
            dispatch: setPauseTime,
            scale: 1000,
            unit: 'sec'
        },
        {
            key: 'bpmRange',
            name: 'BPM range',
            value: bpmRange,
            dispatch: setBpmRange,
            scale: 1,
            unit: 'bpm'
        }
    ];

    function numberWithCommas(input: string) {
        return parseFloat(input.replace(/,/g, '.'))
    }

    const onChange = (setting: any, input: string) => {
        const value = numberWithCommas(input)*setting.scale;
        setting.dispatch(value);
    }

    const renderItem = ({ item }:any) => (
        <ListItem bottomDivider >
            <ListItem.Content>
                <ListItem.Title>{item.name}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Input
                keyboardType="decimal-pad"
                placeholder={(item.value/item.scale).toString()}
                onChangeText={(value: any) => onChange(item, value)}
            />
            <ListItem.Subtitle>{item.unit}</ListItem.Subtitle>
        </ListItem>
    )

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={settings}
                renderItem={renderItem}
            />
            {!isConnected ? (
                // No token at all: log in.
                <Button
                    title="Connect to Spotify"
                    onPress={() => authenticate()}
                    icon={{ name: 'spotify', type: 'font-awesome' }}
                    iconRight
                    containerStyle={{ margin: 16 }}
                />
            ) : remoteConnected ? (
                // Logged in and App Remote attached: the only action left is logout.
                <Button
                    title="Disconnect Spotify"
                    type="outline"
                    onPress={onDisconnect}
                    containerStyle={{ margin: 16 }}
                />
            ) : (
                // Logged in but App Remote dropped — the user reads this as
                // "disconnected", so offer to reconnect, and keep logout reachable.
                <View style={{ margin: 16 }}>
                    <Button
                        title="Reconnect Spotify"
                        onPress={() => reconnect()}
                        icon={{ name: 'spotify', type: 'font-awesome' }}
                        iconRight
                    />
                    <Button
                        title="Disconnect Spotify"
                        type="clear"
                        onPress={onDisconnect}
                        containerStyle={{ marginTop: 8 }}
                    />
                </View>
            )}
        </View>
    )
}