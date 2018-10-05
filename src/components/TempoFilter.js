import React from 'react';
import { connect } from 'react-redux'
import { compose, withHandlers, withState, mapProps } from 'recompose'
import { StyleSheet, View } from 'react-native';
import { Slider, Text } from 'react-native-elements';
import withSpotify from '../utils/spotify'
import PlatformIcon from './PlatformIcon';
import actionTypes from '../constants'

const styles = StyleSheet.create({
  container: {

  },
  row: {
    flexDirection: 'row'
  },
  currentValue: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rangeValue: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10
  },
  slider: {
    flex: 1
  }
});

const TempoFilter = ({player, min, max, currentValue, setCurrentValue, onFilterTracks}) => (
  <View style={styles.container}>
    <View style={styles.currentValue}>
      <Text h3>{currentValue}+5</Text>
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
        onSlidingComplete={(value) => onFilterTracks(value)}
        style={styles.slider}
      />
      <View style={styles.rangeValue}>
        <Text h4>{max}</Text>
      </View>
    </View>
  </View>
)

export default compose(
  withSpotify,
  connect(({player, data}) => ({
    player: player.playerState
  })),
  withState('currentValue', 'setCurrentValue', 0),
  mapProps((props) => {
    const allTempos = props.tracks.map(item => item.tempo)
    const min = parseInt(Math.min.apply(Math, allTempos))
    const max = parseInt(Math.max.apply(Math, allTempos))
    const average = parseInt((min+max)/2)
    if(props.currentValue == 0) {
      props.setCurrentValue(average ? average : 50)
    }
    return {
      ...props,
      min: min ? min : 0,
      max: max ? max : 100
    }
  })
)(TempoFilter)
