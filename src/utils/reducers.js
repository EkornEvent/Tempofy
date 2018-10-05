import {
  get,
  replace,
  size,
} from 'lodash'
import { unset } from 'lodash/fp'

export const combineReducers = reducers => (state = {}, action) =>
  Object.keys(reducers).reduce((nextState, key) => {
    nextState[key] = reducers[key](
      // eslint-disable-line no-param-reassign
      state[key],
      action
    )
    return nextState
  }, {})

export const recursiveUnset = (path, obj, isRecursiveCall = false) => {
  if (!path) {
    return obj
  }

  if (size(get(obj, path)) > 0 && isRecursiveCall) {
    return obj
  }
  // The object does not have any other properties at this level.  Remove the
  // property.
  const objectWithRemovedKey = unset(path, obj)
  const newPath = path.match(/\./) ? replace(path, /\.[^.]*$/, '') : ''
  return recursiveUnset(newPath, objectWithRemovedKey, true)
}
