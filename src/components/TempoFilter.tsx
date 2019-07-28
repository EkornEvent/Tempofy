import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Slider, Text } from 'react-native-elements';
import { Track } from 'api/Types';

interface TempoFilterProps {
  tracks: Track[],
  onFilterTracks: Function
}

const TempoFilter = (props: TempoFilterProps) => {
  const [currentValue, setCurrentValue] = useState<number>(50);
  const [min, setMin] = useState<number>(0);
  const [max, setMax] = useState<number>(100);

  useEffect(() => {
    const allTempos: number[] = props.tracks.map((item: Track) => item.tempo ? item.tempo.toFixed(0) : null).filter(tempo => tempo > 0 && tempo != null);
    if(allTempos.length > 0) {
      const foundMin: number = Math.min(...allTempos);
      const foundMax: number = Math.max(...allTempos);
      const average: number = ((foundMin+foundMax)/2);
      setMin(foundMin);
      setMax(foundMax);
      setCurrentValue(Math.floor(average));
    }
  },[props.tracks]);

  function incrementValue(value: number) {
    setCurrentValue(currentValue+value);
    props.onFilterTracks(currentValue+value);
  }

  return (
    <View style={styles.container}>
      <View style={styles.currentValue}>
        <TouchableOpacity onPress={() => incrementValue(-1)}>
          <Text h3 style={styles.controlIcon}>-</Text>
        </TouchableOpacity>

        <Text h3>{currentValue}+5</Text>
        <TouchableOpacity onPress={() => incrementValue(+1)}>
          <Text h3 style={styles.controlIcon}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <View style={styles.rangeValue}>
          <Text h4>{min}</Text>
        </View>
        <Slider
          minimumValue={min}
          maximumValue={max}
          value={currentValue}
          step={1}
          onValueChange={(value) => setCurrentValue(value)}
          onSlidingComplete={(value) => props.onFilterTracks(value)}
          style={styles.slider}
        />
        <View style={styles.rangeValue}>
          <Text h4>{max}</Text>
        </View>
      </View>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {

  },
  row: {
    flexDirection: 'row'
  },
  currentValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangeValue: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10
  },
  slider: {
    flex: 1
  },
  controlIcon: {
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 20,
    marginRight: 20
  }
});

export default TempoFilter;