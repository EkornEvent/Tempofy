import React from 'react';
import { ActivityIndicator } from 'react-native';

import { createAppContainer } from 'react-navigation';
import ListNavigator from './ListNavigator';

export default createAppContainer(ListNavigator);