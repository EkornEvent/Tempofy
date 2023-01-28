import React, { useContext } from "react";
import { FlatList } from "react-native";
import { ListItem } from '@rneui/themed';
import { SettingsContext } from "../context/SettingsContext";

export const SettingScreen = () => {
    const { 
        introSkipTime, setIntroSkipTime, 
        outroSkipTime, setOutroSkipTime, 
        fadeTime, setFadeTime, 
        waitDuringPause, setWaitDuringPause
    } = useContext(SettingsContext);

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
        <FlatList
            data={settings}
            renderItem={renderItem}
        />
    )
}