import { NativeEventEmitter, NativeModules, AsyncStorage } from 'react-native';
var Tempofy = NativeModules.Tempofy;
const spotifyEmitter = new NativeEventEmitter(Tempofy);

import SpotifyWebApi from 'spotify-web-api-js'
import actionTypes from '../constants'

class Spotify {
  constructor() {
    this.namespace = "@@spotify"
    this.webApi = new SpotifyWebApi()
    this.addSubscriptions()
  }

  addSubscriptions() {
    this.subscriptions = []
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
  }

  initializeApp() {
    return AsyncStorage.getItem('accessToken')
    .then(accessToken => {
      if(accessToken) {
        //this.webApi.setAccessToken(accessToken)
        //this.store.dispatch({ type: actionTypes.CONNECT, accessToken })
      }
      return
    })
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
    const playTime = 5
    var playTimeLeft = playTime
    this.store.dispatch({ type: actionTypes.AUTO_SKIP_TIME_LEFT, value: playTimeLeft })
    clearInterval(this.timer);
    if(!state.paused) {
      var self = this
      this.timer = setInterval(() =>{
        playTimeLeft--
        self.store.dispatch({ type: actionTypes.AUTO_SKIP_TIME_LEFT, value: playTimeLeft })
        if(playTimeLeft <= 0) {
          clearInterval(self.timer)
          Tempofy.skipToNext()
        }
      },1000)
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
  }

  pause() {
    Tempofy.pause()
  }

  resume() {
    Tempofy.resume()
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
