import React, { Component } from 'react'
import PropTypes from 'prop-types'
import hoistStatics from 'hoist-non-react-statics'
import { wrapDisplayName } from './index'

export const createWithSpotify = (storeKey = 'store') => WrappedComponent => {
  class withSpotify extends Component {
    static wrappedComponent = WrappedComponent
    static displayName = wrapDisplayName(WrappedComponent, 'withSpotify')
    static contextTypes = {
      [storeKey]: PropTypes.object.isRequired
    }

    store = this.context[storeKey]

    render() {
      return (
        <WrappedComponent
          {...this.props}
          {...this.state}
          dispatch={this.store.dispatch}
          spotify={this.store.spotify}
        />
      )
    }
  }

  return hoistStatics(withSpotify, WrappedComponent)
}

export default createWithSpotify()
