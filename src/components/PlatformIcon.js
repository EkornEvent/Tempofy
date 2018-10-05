import React from 'react';
import { Platform, View, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

export default class PlatformIcon extends React.Component {
  constructor () {
    super()
    this.spinValue = new Animated.Value(0)
    this.spinning = true
  }

  componentDidMount() {
    if(this.props.spinning) {
      this.spinning = true
      this.spin()
    }
    else {
      this.spinning = false
    }
  }

  componentWillReceiveProps(newProps) {
    if(newProps.spinning) {
      this.spinning = true
      this.spin()
    }
    else {
      this.spinning = false
    }

  }

  spin () {
    this.spinValue.setValue(0)
    Animated.timing(
      this.spinValue,
      {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear
      }
    ).start(() => {
      if(this.spinning) {
        this.spin()
      }
    })
  }

  render() {
    const spin = this.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    })
    return (
      <View style={{justifyContent:'center', alignItems: 'center'}}>
        <Animated.View style={{transform: [{rotate: this.props.spinning ? spin : '0 deg'}]}}>
          <Ionicons
            name={Platform.OS === 'ios' ? `ios-${this.props.shortName}` : `md-${this.props.shortName}`}
            {...this.props}
            style={[{color: Colors.tintText}, this.props.style]}
          />
        </Animated.View>
      </View>
    )
  }
}
