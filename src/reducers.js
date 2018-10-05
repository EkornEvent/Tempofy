import { get } from 'lodash'
import { setWith, assign } from 'lodash/fp'
import actionTypes from './constants'

export const requestingReducer = (state = {}, { type, path }) => {
  switch (type) {
    case actionTypes.START:
      return {
        ...state,
        [path]: true
      }
    case actionTypes.NO_VALUE:
    case actionTypes.SET:
      return {
        ...state,
        [path]: false
      }
    default:
      return state
  }
}

export const requestedReducer = (state = {}, { type, path }) => {
  switch (type) {
    case actionTypes.START:
      return {
        ...state,
        [path]: false
      }
    case actionTypes.NO_VALUE:
    case actionTypes.SET:
      return {
        ...state,
        [path]: true
      }
    default:
      return state
  }
}

export const spotifyReducer = (state = {connecting: false}, action) => {
  switch (action.type) {
    case actionTypes.LOGIN:
      return {
        ...state,
        connecting: true,
        connected: false,
        error: null
      }
    case actionTypes.CONNECT:
      return {
        ...state,
        connecting: false,
        connected: true,
        accessToken: action.accessToken
      }
    case actionTypes.DISCONNECT:
      return {
        ...state,
        connecting: false,
        connected: false,
        error: action.error
      }
    case actionTypes.ERROR:
      return {
        ...state,
        connecting: false,
        error: action.error
      }
    default:
      return state
  }
}
export const playerReducer = (state = {}, action) => {
  console.log(action);
  switch (action.type) {
    case actionTypes.TEMPO_SELECTED:
      return {
        ...state,
        tempoSelected: action.data
      }
    case actionTypes.PLAYER_STATE_DID_CHANGE:
      return {
        ...state,
        playerState: action.state
      }
    case actionTypes.AUTO_SKIP_TIME_LEFT:
      return {
        ...state,
        autoSkipTimeLeft: action.value
      }
    default:
      return state
  }
}

const createDataReducer = (actionKey = 'data') => (state = {}, action) => {
  switch (action.type) {
    case actionTypes.SET:
      return setWith(
        Object,
        action.path,
        action[actionKey],
        state
      )
    case actionTypes.MERGE:
      const previousData = get(state, action.path, {})
      const mergedData = assign(previousData, action[actionKey])
      return setWith(Object, action.path, mergedData, state)
    case actionTypes.NO_VALUE:
      return setWith(Object, action.path, null, state)
    case actionTypes.REMOVE:
      if (actionKey === 'data') {
        return recursiveUnset(action.path, state)
      }
      return state
    default:
      return state
  }
}
export const dataReducer = createDataReducer()
