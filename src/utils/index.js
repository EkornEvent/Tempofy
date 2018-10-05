import React from 'react';
import {
  compose,
  branch,
  renderComponent,
} from 'recompose'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  isFunction,
  get,
  every,
  some
} from 'lodash'

/**
 * @private
 * @description Create a function if not already one
 * @param {Function|Object|Array|String} Callable function or value of return for new function
 */
export const createCallable = f => (isFunction(f) ? f : () => f)

export const getDisplayName = Component => {
  if (typeof Component === 'string') {
    return Component
  }

  if (!Component) {
    return undefined
  }

  return Component.displayName || Component.name || 'Component'
}

export const wrapDisplayName = (BaseComponent, hocName) =>
  `${hocName}(${getDisplayName(BaseComponent)})`

export const stringToDate = strInput => {
  try {
    return new Date(JSON.parse(strInput))
  } catch (err) {
    console.error('Error parsing string to date:', err.message || err) // eslint-disable-line no-console
    return strInput
  }
}

export const shuffleArray = arr => arr
  .map(a => [Math.random(), a])
  .sort((a, b) => a[0] - b[0])
  .map(a => a[1]);

export const isLoaded = (...args) =>
  !args || !args.length
    ? true
    : every(args, arg => arg !== undefined && get(arg, 'isLoaded') !== false)

export const spinnerWhile = condition =>
  branch(condition, renderComponent(LoadingSpinner))

export const spinnerWhileLoading = propNames =>
  spinnerWhile(props => some(propNames, name => !isLoaded(props[name])))
