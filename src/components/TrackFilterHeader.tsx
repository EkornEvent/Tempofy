import React, { useContext, useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Slider, Icon, Text, makeStyles } from '@rneui/themed';
import { TrackObject } from "../helpers/types";
import { SettingsContext } from "../context/SettingsContext";
import { Background } from "./Background";

export const TrackFilterHeader: React.FC<{ data: TrackObject[], onValueChange: (value: number) => void, onSlidingComplete: (value: number) => void, onShuffle: () => void }> = ({
    data,
    onValueChange,
    onSlidingComplete,
    onShuffle
  }) => {
    const { autoSkipMode, setAutoSkipMode, autoSkipTime, setAutoSkipTime } = useContext(SettingsContext);
    const styles = useStyles();
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

    const incrementValue = (increment: number) => {
        const newValue = currentValue + increment;
        onValueChange(newValue);
        setCurrentValue(newValue);
    }

    const toggleAutoSkipMode = () => {
        setAutoSkipMode(autoSkipMode == 2 ? 0 : autoSkipMode+1);
    }

    const toggleAutoSkipTime = () => {
        const step = 15000;
        const newValue = autoSkipTime + step
        setAutoSkipTime(newValue > 120000 ? step : newValue);
    }
    
    return (
        <Background>
        <View style={styles.container}>
            <TouchableOpacity onPress={() => incrementValue(-1)}>
                <Text style={styles.number}>{min} (-)</Text>
            </TouchableOpacity>
            <Slider
                maximumValue={max}
                minimumValue={min}
                onValueChange={value => {
                    onValueChange(value);
                    setCurrentValue(value);
                }}
                onSlidingComplete={value => {
                    onSlidingComplete(value);
                    setCurrentValue(value);
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
                    />
                    )
                }}
                thumbTouchSize={{ width: 40, height: 40 }}
                trackStyle={{ height: 10, borderRadius: 20 }}
                value={currentValue}
            />
            <TouchableOpacity onPress={() => incrementValue(1)}>
                <Text style={styles.number}>{max} (+)</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={() => toggleAutoSkipMode()}>
                <View>
                <Icon size={30} name={autoSkipMode > 0 ? (autoSkipMode == 1 ? 'timer' : 'volume-down') : 'timer-off'}/>
                <Text>{autoSkipMode > 0 ? (autoSkipMode == 1 ? 'Skip' : 'Fade') : 'Play'}</Text>
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
        </Background>
    )
}

const useStyles = makeStyles((theme) => ({
    container: {
        paddingTop: 20,
        paddingBottom: 20,
        flexDirection: 'row'
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
        backgroundColor: theme.colors.primary
    },
    button: {
        flex: 1,
        alignItems: 'center',
        padding: 5
    }
}));
  