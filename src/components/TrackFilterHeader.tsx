import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Slider, Icon, Text } from '@rneui/themed';
import { TrackObject } from "../helpers/types";
import { SettingsContext } from "../context/SettingsContext";

export const TrackFilterHeader: React.FC<{ data: TrackObject[], onFilterTracks: (value: number) => void, onShuffle: () => void }> = ({
    data,
    onFilterTracks,
    onShuffle
  }) => {
    const { autoSkipMode, setAutoSkipMode, autoSkipTime, setAutoSkipTime } = useContext(SettingsContext);
    
    const [currentValue, setCurrentValue] = useState<number>(50);
    const [min, setMin] = useState<number>(0);
    const [max, setMax] = useState<number>(100);

    useEffect(() => {
        const allTempos: number[] = data.map(item => item.tempo ? item.tempo : 0).filter(tempo => tempo > 0);
        if(allTempos.length > 0) {
          const foundMin: number = Math.min(...allTempos);
          const foundMax: number = Math.max(...allTempos);
          const average: number = ((foundMin+foundMax)/2);
          setMin(foundMin);
          setMax(foundMax);
          setCurrentValue(Math.floor(average));
        }
    },[data]);

    const toggleAutoSkipMode = () => {
        setAutoSkipMode(autoSkipMode == 2 ? 0 : autoSkipMode+1);
    }

    const toggleAutoSkipTime = () => {
        const step = 15000;
        const newValue = autoSkipTime + step
        setAutoSkipTime(newValue > 120000 ? step : newValue);
    }
    
    return (
        <>
        <View style={styles.container}>
            <Text style={styles.number}>{min}</Text>
            <Slider
                maximumTrackTintColor="#ccc"
                maximumValue={max}
                minimumTrackTintColor="#222"
                minimumValue={min}
                onValueChange={value => {
                    setCurrentValue(value);
                    onFilterTracks(value);
                }}
                orientation="horizontal"
                step={1}
                thumbStyle={{ height: 20, width: 20 }}
                style={{flex: 1}}
                thumbProps={{
                    children: (
                    <Icon
                        name="heartbeat"
                        type="font-awesome"
                        size={20}
                        reverse
                        containerStyle={{ bottom: 20, right: 20 }}
                        color="#f50"
                    />
                    )
                }}
                thumbTintColor="#0c0"
                thumbTouchSize={{ width: 40, height: 40 }}
                trackStyle={{ height: 10, borderRadius: 20 }}
                value={currentValue}
            />
            <Text style={styles.number}>{max}</Text>
        </View>
        <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={() => toggleAutoSkipMode()}>
                <View>
                <Icon size={40} name={autoSkipMode > 0 ? (autoSkipMode == 1 ? 'timer' : 'volume-down') : 'timer-off'}/>
                <Text>{autoSkipMode > 0 ? (autoSkipMode == 1 ? 'Skip timer' : 'Fade timer') : 'Play track'}</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shuffle} onPress={onShuffle}>
                <Icon name='shuffle-variant' type='material-community'/>
                <Text>Play shuffle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => toggleAutoSkipTime()}>
                <View>
                <Text h4>{autoSkipTime/1000}</Text>
                <Text>sec</Text>
                </View>
            </TouchableOpacity>
        </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 20,
        paddingBottom: 20,
        backgroundColor: 'lightgreen',
        flexDirection: 'row',
        flex: 1
    },
    number: {
        padding: 14
    },
    actions: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        alignSelf: 'center'
    },
    shuffle: {
        flex: 2,
        alignItems: 'center',
        backgroundColor: 'lightblue'
    },
    button: {
        flex: 1,
        alignItems: 'center'
    }
});
  