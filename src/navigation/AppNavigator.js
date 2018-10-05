import React from 'react';
import { ActivityIndicator } from 'react-native';
import { connect } from 'react-redux'
import { compose } from 'recompose'

import { createSwitchNavigator } from 'react-navigation';
import LoginScreen from '../screens/LoginScreen';
import ListNavigator from './ListNavigator'

const AppNavigator = createSwitchNavigator({
  // You could add another route here for authentication.
  // Read more at https://reactnavigation.org/docs/en/auth-flow.html
  Login: LoginScreen,
  List: ListNavigator
})

const RootNavigation = () => (
  <AppNavigator
    //persistenceKey={__DEV__ ? "NavigationStateDEV" : null}
    renderLoadingExperimental={() => <ActivityIndicator />}
  />
)

export default compose(
  connect((state) => ({
  }))
)(RootNavigation)
