import { NativeEventEmitter, NativeModules, AsyncStorage } from 'react-native';
var Tempofy = NativeModules.Tempofy;
const spotifyEmitter = new NativeEventEmitter(Tempofy);

import SpotifyWebApi from 'spotify-web-api-js'
import actionTypes from '../constants'

class Spotify {
  constructor() {
    this.subscriptions = []
    this.namespace = "@@spotify"
    this.webApi = new SpotifyWebApi()
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
      Tempofy.updatePlayerState()
    },100)
  }

  didInitiateSession(accessToken) {
    this.webApi.setAccessToken(accessToken);
    this.store.dispatch({ type: actionTypes.CONNECT, accessToken })
    AsyncStorage.setItem('accessToken', accessToken)
  }

  playerStateDidChange(state) {
    state = {
      ...state,
      paused: state.paused === 'true'
    }
    const autoSkipPauseTime = this.store.getState().player.autoSkipPauseTime
    const autoSkipFadeTime = this.store.getState().player.autoSkipFadeTime
    const autoSkipMode = this.store.getState().player.autoSkipMode
    const autoSkipTime = this.store.getState().player.autoSkipTime
    var autoSkipTimeLeftPosition = this.store.getState().player.autoSkipTimeLeftPosition
    if(autoSkipTimeLeftPosition == 0) {
      this.store.dispatch({ type: actionTypes.UPDATE_TIME_LEFT_POSITION, value: autoSkipTime })
      autoSkipTimeLeftPosition = autoSkipTime
    }
    const playTimeLeft = autoSkipTimeLeftPosition - state.playbackPosition
    if(!state.paused) {
      if(autoSkipMode > 0) {
        if(playTimeLeft <= autoSkipFadeTime) {
          if(!this.isFading) {
            this.fadeWithAction(() => {
              if(autoSkipMode == 1) {
                this.skipToNext()
              } else {
                autoSkipTimeLeftPosition = state.playbackPosition + autoSkipTime + autoSkipPauseTime + 1
                this.store.dispatch({ type: actionTypes.UPDATE_TIME_LEFT_POSITION, value: autoSkipTimeLeftPosition })
              }
            })
          }
        }
      } else {
        if(playTimeLeft <= 0) {
          autoSkipTimeLeftPosition = state.playbackPosition + autoSkipTime
          this.store.dispatch({ type: actionTypes.UPDATE_TIME_LEFT_POSITION, value: autoSkipTimeLeftPosition })
        }
      }
    }
    this.store.dispatch({ type: actionTypes.PLAYER_STATE_DID_CHANGE, state })
  }

  getUserPlaylists() {
    this.store.dispatch({ type: actionTypes.START, path: 'playlists' })
    const limit = 50
    this.webApi.getUserPlaylists({limit: 1})
    .then(data => {
      return data.total
    })
    .then(total => {
      var requests = []
      const numRequests = Math.ceil(total/limit)
      var count = 0
      do {
        requests.push(
          this.webApi.getUserPlaylists({
            offset: count*limit,
            limit: limit
          })
        )
        count++
      } while (count < numRequests)
      return Promise.all(requests)
    })
    .then(responses => {
      return responses.map(data => data.items).flat()
    })
    .then(data => {
      this.store.dispatch({ type: actionTypes.SET, path: 'playlists', data })
    })
    .catch(error => {
      this.store.dispatch({ type: actionTypes.SET, path: 'playlists', data: [] })
      const message = JSON.parse(error.responseText).error.message
      this.store.dispatch({ type: actionTypes.ERROR, error:message })
    })
  }

  getPlaylistTracks(playlistId) {
    this.store.dispatch({ type: actionTypes.START, path: 'tracks' })
    this.store.dispatch({ type: actionTypes.START, path: 'filteredTracks' })
    const limit = 100
    this.webApi.getPlaylistTracks(playlistId, {limit: 1})
    .then(data => {
      return data.total
    })
    .then(total => {
      var requests = []
      const numRequests = Math.ceil(total/limit)
      var count = 0
      do {
        requests.push(
          this.webApi.getPlaylistTracks(playlistId, {
            offset: count*limit,
            limit: limit
          })
          .then(data => {
            const idList = data.items.map(item => item.track.id)
            const idListString = idList.join(',')
            return this.webApi.getAudioFeaturesForTracks(idListString)
            .then(audioData => {
              const newItems = data.items.map((item, index) => {
                const tempo = audioData.audio_features[index] ? audioData.audio_features[index].tempo : null
                return {
                  ...item,
                  tempo
                }
              })
              data.items = newItems
              return data
            })
          })
        )
        count++
      } while (count < numRequests)
      return Promise.all(requests)
    })
    .then(responses => {
      return responses.map(data => data.items).flat()
    })
    .then(data => {
      this.store.dispatch({ type: actionTypes.SET, path: 'tracks', data })
      this.store.dispatch({ type: actionTypes.SET, path: 'filteredTracks', data })
    })
    .catch(error => {
      this.store.dispatch({ type: actionTypes.SET, path: 'tracks', data: [] })
      this.store.dispatch({ type: actionTypes.SET, path: 'filteredTracks', data: [] })
      const message = JSON.parse(error.responseText).error.message
      this.store.dispatch({ type: actionTypes.ERROR, error:message })
    })
  }

  playTrack(uri) {
    Tempofy.play(uri)
    this.restoreVolume()
  }

  playQueueIndex(index) {
    const filteredTracks = this.store.getState().data.filteredTracks
    if(index >= 0 && index < filteredTracks.length ) {
      this.store.dispatch({ type: actionTypes.SET, path: 'currentTrackIndex', data: index })
      Tempofy.play(filteredTracks[index].track.uri)
    }
  }

  pause() {
    Tempofy.pause()
  }

  resume() {
    Tempofy.resume()
  }

  resetTimeLeft() {
    const autoSkipTime = this.store.getState().player.autoSkipTime
    this.store.dispatch({ type: actionTypes.UPDATE_TIME_LEFT_POSITION, value: autoSkipTime })
  }

  canSkipPrevious() {
    const currentTrackIndex = this.store.getState().data.currentTrackIndex
    const filteredTracks = this.store.getState().data.filteredTracks
    const tryIndex = currentTrackIndex - 1
    return tryIndex >= 0 && filteredTracks.length
  }

  canSkipNext() {
    const currentTrackIndex = this.store.getState().data.currentTrackIndex
    const filteredTracks = this.store.getState().data.filteredTracks
    const tryIndex = currentTrackIndex + 1
    return tryIndex < filteredTracks.length
  }

  skipToPrevious() {
    const currentTrackIndex = this.store.getState().data.currentTrackIndex
    this.playQueueIndex(currentTrackIndex - 1)
    this.resetTimeLeft()
    this.restoreVolume()
  }

  skipToNext() {
    const currentTrackIndex = this.store.getState().data.currentTrackIndex
    this.playQueueIndex(currentTrackIndex + 1)
    this.resetTimeLeft()
    this.restoreVolume()
  }

  seekToPosition(position) {
    const autoSkipTime = this.store.getState().player.autoSkipTime
    const autoSkipTimeLeftPosition = position + autoSkipTime
    this.store.dispatch({ type: actionTypes.UPDATE_TIME_LEFT_POSITION, value: autoSkipTimeLeftPosition })
    Tempofy.seekToPosition(position)
  }

  restoreVolume() {
    const targetVolume = this.currentVolume ? this.currentVolume : 100
    this.webApi.setVolume(targetVolume, {})
  }

  fadeWithAction(callback) {
    this.webApi.getMyCurrentPlaybackState().then(result => {
      this.currentVolume = result.device.volume_percent
      this.isFading = true
      this.fadeTarget(this.currentVolume, 0).then(() => {
        callback()
        return
      }).then(() => {
        this.pause()
        return new Promise((resolve) => setTimeout(resolve, 2000))
      }).then(() => {
        this.resume()
        return this.fadeTarget(0, this.currentVolume)
      }).then(() => {
        this.isFading = false
      })
    })
  }

  fadeTarget(from, to) {
    return new Promise(resolve => {
      setTimeout(() => {
        const partVolume = Math.abs((to-from)/2)
        this.webApi.setVolume(partVolume, {})
      }, 1000)
      setTimeout(() => {
        this.webApi.setVolume(to, {})
        resolve()
      }, 2000)
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
