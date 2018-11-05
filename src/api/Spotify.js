import { NativeEventEmitter, NativeModules, AsyncStorage } from 'react-native';
var Tempofy = NativeModules.Tempofy;
const spotifyEmitter = new NativeEventEmitter(Tempofy);

import SpotifyWebApi from 'spotify-web-api-js'
import actionTypes from '../constants'
import Data from './Data'
import PlayBlockHandler from './PlayBlocks'

class Spotify {
  constructor() {
    this.subscriptions = []
    this.namespace = "@@spotify"
    this.webApi = new SpotifyWebApi()
    this.playBlockHandler = new PlayBlockHandler(this)
    this.data = new Data(this)
  }

  initializeApp() {
    this.removeSubscriptions()
    this.addSubscriptions()
    return AsyncStorage.getItem('accessToken')
    .then(accessToken => {
      if(accessToken) {
        //this.webApi.setAccessToken(accessToken)
        //this.store.dispatch({ type: actionTypes.CONNECT, accessToken })
      }
      return
    })
  }

  removeSubscriptions() {
    this.subscriptions.forEach(subscription => {
      subscription.remove()
    })
  }

  addSubscriptions() {
    this.subscriptions.push(spotifyEmitter.addListener(
      'didFailWithError',
      (error) => this.store.dispatch({ type: actionTypes.ERROR, error })
    ))
    this.subscriptions.push(spotifyEmitter.addListener(
      'didInitiateSession',
      (accessToken) => this.didInitiateSession(accessToken)
    ))
    this.subscriptions.push(spotifyEmitter.addListener(
      'didFailConnectionAttemptWithError',
      (error) => this.store.dispatch({ type: actionTypes.ERROR, error })
    ))
    this.subscriptions.push(spotifyEmitter.addListener(
      'didDisconnectWithError',
      (error) => this.store.dispatch({ type: actionTypes.DISCONNECT, error })
    ))
    this.subscriptions.push(spotifyEmitter.addListener(
      'appRemoteDidEstablishConnection',
      () => this.store.dispatch({ type: actionTypes.CONNECT })
    ))
    this.subscriptions.push(spotifyEmitter.addListener(
      'playerStateDidChange',
      (state) => this.playerStateDidChange(state)
    ))

    if(this.stateTimer) {
      clearInterval(this.stateTimer);
    }
    this.stateTimer = setInterval(() =>{
      if(this.store.getState().spotify.connected) {
        Tempofy.updatePlayerState()
      }
    },100)
  }

  didInitiateSession(accessToken) {
    this.webApi.setAccessToken(accessToken);
    this.store.dispatch({ type: actionTypes.CONNECT, accessToken })
    AsyncStorage.setItem('accessToken', accessToken)
    this.resetPlayer()
  }

  playerStateDidChange(state) {
    state = {
      ...state,
      paused: state.paused === 'true'
    }
    this.store.dispatch({ type: actionTypes.PLAYER_STATE_DID_CHANGE, state })

    const playerState = this.store.getState().player

    // Blocks position update
    this.playBlockHandler.playerStateDidChange(state, playerState)
  }

  getUserPlaylists() {
    return this.data.getUserPlaylists()
  }

  getPlaylistTracks(playlistId) {
    return this.data.getPlaylistTracks(playlistId)
  }

  setupPlayBlocks(state, blockDuration) {
    return this.playBlockHandler.setupPlayBlocks(state, blockDuration)
  }

  getAllBlocks() {
    return this.playBlockHandler.getAllBlocks()
  }

  playBlock(block) {
    this.playBlockHandler.playBlock(block)
  }

  authorizeAndPlayURI(uri, index) {
    console.log('authorizeAndPlayURI');
    this.store.dispatch({ type: actionTypes.SET, path: 'currentTrackIndex', data: index })
    this.resetPlayer()
    Tempofy.authorizeAndPlayURI(uri)
  }

  playTrack(uri, index) {
    console.log('playTrack');
    this.store.dispatch({ type: actionTypes.SET, path: 'currentTrackIndex', data: index })
    this.resetPlayer()
    Tempofy.play(uri)
  }

  playQueueIndex(index) {
    console.log('playQueueIndex');
    const filteredTracks = this.store.getState().data.filteredTracks
    if(index >= 0 && index < filteredTracks.length ) {
      this.store.dispatch({ type: actionTypes.SET, path: 'currentTrackIndex', data: index })
      Tempofy.play(filteredTracks[index].track.uri)
      this.resetTimeLeft()
    }
  }

  pause() {
    Tempofy.pause()
    const isFading = this.store.getState().data.isFading
    if(isFading) {
      this.resetFadeTimer()
      this.restoreVolume()
    }
  }

  resume() {
    Tempofy.resume()
  }

  canSkipPrevious() {
    const currentTrackIndex = this.store.getState().data.currentTrackIndex
    const filteredTracks = this.store.getState().data.filteredTracks
    const tryIndex = currentTrackIndex - 1
    return tryIndex >= 0 && filteredTracks && filteredTracks.length
  }

  canSkipNext() {
    const currentTrackIndex = this.store.getState().data.currentTrackIndex
    const filteredTracks = this.store.getState().data.filteredTracks
    const tryIndex = currentTrackIndex + 1
    return filteredTracks && tryIndex < filteredTracks.length
  }

  skipToPrevious() {
    const currentTrackIndex = this.store.getState().data.currentTrackIndex
    this.playQueueIndex(currentTrackIndex - 1)
  }

  skipToNext() {
    console.log('skipToNext');
    const currentTrackIndex = this.store.getState().data.currentTrackIndex
    this.playQueueIndex(currentTrackIndex + 1)
  }

  seekToPosition(position) {
    const autoSkipTime = this.store.getState().player.autoSkipTime
    const autoSkipTimeLeftPosition = position + autoSkipTime
    this.store.dispatch({ type: actionTypes.UPDATE_TIME_LEFT_POSITION, value: autoSkipTimeLeftPosition })
    Tempofy.seekToPosition(position)
  }


  resetPlayer() {
    console.log('resetPlayer');
    // TODO: Get volume from device
    //this.webApi.getMyCurrentPlaybackState().then(result => {
      this.store.dispatch({ type: actionTypes.SET, path: 'currentVolume', data: 100/*result.device.volume_percent*/ })
    //})
    this.resetTimeLeft()
    this.resetFadeTimer()
    this.restoreVolume()
  }

  resetTimeLeft() {
    console.log('resetTimeLeft');
    this.store.dispatch({ type: actionTypes.UPDATE_TIME_LEFT_POSITION, value: null })
  }

  resetFadeTimer() {
    console.log('resetFadeTimer');
    if(this.fadeTimer) {
      clearInterval(this.fadeTimer)
    }
    this.store.dispatch({ type: actionTypes.SET, path: 'isFading', data: false })
  }

  restoreVolume() {
    console.log('restoreVolume');
    const currentVolume = this.store.getState().data.currentVolume
    const targetVolume = Number.isInteger(currentVolume) ? currentVolume : 100
    this.webApi.setVolume(targetVolume, {})
  }

  fadeWithAction(callback) {
    console.log('fadeWithAction');
    const currentVolume = this.store.getState().data.currentVolume
    const autoSkipPauseTime = this.store.getState().player.autoSkipPauseTime
    this.store.dispatch({ type: actionTypes.SET, path: 'isFading', data: true })
    this.fadeTarget(currentVolume, 0).then(() => {
      console.log('pause time: '+autoSkipPauseTime);
      Tempofy.pause()
      return new Promise((resolve) => setTimeout(resolve, autoSkipPauseTime))
    }).then(() => {
      console.log('resume fade');
      Tempofy.resume()
      callback()
      return
    }).then(() => {
      return this.fadeTarget(0, currentVolume)
    }).then(() => {
      this.store.dispatch({ type: actionTypes.SET, path: 'isFading', data: false })
    })
  }

  fadeTarget(from, to) {
    return new Promise(resolve => {
      var current = from
      const step = Math.abs((to-from)/10)
      const autoSkipFadeTime = this.store.getState().player.autoSkipFadeTime
      const interval = autoSkipFadeTime / 10

      if(this.fadeTimer) {
        clearInterval(this.fadeTimer)
      }

      this.fadeTimer = setInterval(() => {
        console.log('fade volume: '+current);
        if(to == 0) {
          current -= step
          if(current > to) {
            this.webApi.setVolume(current, {})
          } else {
            this.webApi.setVolume(to, {})
            clearInterval(this.fadeTimer);
            resolve()
          }
        } else {
          current += step
          if(current < to) {
            this.webApi.setVolume(current, {})
    			} else {
            this.webApi.setVolume(to, {})
            clearInterval(this.fadeTimer);
            resolve()
    			}
        }
      }, interval)
    })
  }

  spotifyListener = () => next => (
    reducer,
    initialState,
    middleware
  ) => {

    const store = next(reducer, initialState, middleware)
    this.store = store
    store.spotify = this
    return store
  }

  login = () => {
    this.store.dispatch({ type: actionTypes.LOGIN })
    Tempofy.login()
  }

}

export default new Spotify()
