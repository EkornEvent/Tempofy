import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Slider, Icon, Text } from '@rneui/themed';
import { TrackObject } from "../helpers/types";

export const TrackFilterHeader: React.FC<{ data: TrackObject[], onFilterTracks: (value: number) => void, onFilterTracksComplete: (value: number) => void }> = ({
    data,
    onFilterTracks,
    onFilterTracksComplete
  }) => {
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
    
    return (
        <View style={styles.container}>
            <Text style={styles.number}>{min}</Text>
            <Slider
                maximumTrackTintColor="#ccc"
                maximumValue={max}
                minimumTrackTintColor="#222"
                minimumValue={min}
                onSlidingComplete={value =>
                    onFilterTracksComplete(value)
                }
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
    }
});
  