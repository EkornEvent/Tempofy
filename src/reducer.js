import { combineReducers } from './utils/reducers'
import {
  requestingReducer,
  requestedReducer,
  spotifyReducer,
  playerReducer,
  dataReducer
} from './reducers'

export default combineReducers({
  requesting: requestingReducer,
  requested: requestedReducer,
  spotify: spotifyReducer,
  player: playerReducer,
  data: dataReducer
})
