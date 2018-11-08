import React from 'react';
import { connect } from 'react-redux'
import { compose, withHandlers, withState, mapProps } from 'recompose'
import { StyleSheet, View, TouchableOpacity } from 'react-native';
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

const TempoFilter = ({player, min, max, currentValue, setCurrentValue, incrementValue, onFilterTracks}) => (
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
  withHandlers({
    incrementValue: props => (value) => {
      props.setCurrentValue(props.currentValue+value)
      props.onFilterTracks(props.currentValue+value)
    }
  }),
  mapProps((props) => {
    const allTempos = props.tracks.map(item => item.tempo).filter(tempo => tempo > 0 && tempo != null)
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
