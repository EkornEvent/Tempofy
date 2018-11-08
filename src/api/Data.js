import actionTypes from '../constants'

const Firebase = require('firebase');
var config = {
    apiKey: "AIzaSyALdsLEkwjV47CeObve3l16_9xNZ0n4lbM",
    authDomain: "organic-poetry-135723.firebaseapp.com",
    databaseURL: "https://organic-poetry-135723.firebaseio.com",
    storageBucket: "organic-poetry-135723.appspot.com",
  };
var firebase = Firebase.initializeApp(config);

export default class Data {
  constructor(spotify) {
    this.spotify = spotify
    this.tempo = null
  }

  getTempo() {
    this.spotify.store.dispatch({ type: actionTypes.START, path: 'tempo' })
    return firebase.database().ref('/tempo').on('value', function(snapshot) {
      this.tempo = snapshot.val()
      this.spotify.store.dispatch({ type: actionTypes.SET, path: 'tempo', data: this.tempo })
    }, this)
  }

  getUserPlaylists() {
    this.spotify.store.dispatch({ type: actionTypes.START, path: 'playlists' })
    const limit = 50
    this.spotify.webApi.getUserPlaylists({limit: 1})
    .then(data => {
      return data.total
    })
    .then(total => {
      var requests = []
      const numRequests = Math.ceil(total/limit)
      var count = 0
      do {
        requests.push(
          this.spotify.webApi.getUserPlaylists({
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
      this.spotify.store.dispatch({ type: actionTypes.SET, path: 'playlists', data })
    })
    .catch(error => {
      this.spotify.store.dispatch({ type: actionTypes.SET, path: 'playlists', data: [] })
      const message = JSON.parse(error.responseText).error.message
      this.spotify.store.dispatch({ type: actionTypes.ERROR, error:message })
    })
  }

  getPlaylistTracks(playlistId) {
    this.spotify.store.dispatch({ type: actionTypes.START, path: 'tracks' })
    this.spotify.store.dispatch({ type: actionTypes.START, path: 'filteredTracks' })
    const limit = 100
    this.spotify.webApi.getPlaylistTracks(playlistId, {limit: 1})
    .then(data => {
      return data.total
    })
    .then(total => {
      var requests = []
      const numRequests = Math.ceil(total/limit)
      var count = 0
      do {
        requests.push(
          this.spotify.webApi.getPlaylistTracks(playlistId, {
            offset: count*limit,
            limit: limit
          })
          .then(data => {
            const idList = data.items.map(item => item.track.id)
            const idListString = idList.join(',')
            return this.spotify.webApi.getAudioFeaturesForTracks(idListString)
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
      return data.map(item => {
        var tempo = item.tempo
        if(this.tempo[item.track.id]) {
          tempo = this.tempo[item.track.id].tempo
        }
        return {
          ...item,
          tempo
        }
      })
    })
    .then(data => {
      this.spotify.store.dispatch({ type: actionTypes.SET, path: 'tracks', data })
      this.spotify.store.dispatch({ type: actionTypes.SET, path: 'filteredTracks', data })
    })
    .catch(error => {
      this.spotify.store.dispatch({ type: actionTypes.SET, path: 'tracks', data: [] })
      this.spotify.store.dispatch({ type: actionTypes.SET, path: 'filteredTracks', data: [] })
      const message = JSON.parse(error.responseText).error.message
      this.spotify.store.dispatch({ type: actionTypes.ERROR, error:message })
    })
  }

}
