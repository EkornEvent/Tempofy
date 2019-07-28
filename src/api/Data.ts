import Spotify from 'rn-spotify-sdk';
import { Track } from './Types';

const Firebase = require('firebase');
var config = {
    apiKey: "AIzaSyALdsLEkwjV47CeObve3l16_9xNZ0n4lbM",
    authDomain: "organic-poetry-135723.firebaseapp.com",
    databaseURL: "https://organic-poetry-135723.firebaseio.com",
    storageBucket: "organic-poetry-135723.appspot.com",
  };
var firebase = Firebase.initializeApp(config);

class Data {
  tempoSnapshot: any;
  constructor() {
    this.tempoSnapshot = null;
  }
  
  getTempo() {
    if(this.tempoSnapshot) {
      return this.tempoSnapshot
    } else {
      return firebase.database().ref('/tempo').once('value').then(function(this: Data, snapshot: any) {
        this.tempoSnapshot = snapshot.val();
        return this.tempoSnapshot;
      })
    }
  }
  
  async getUserPlaylists(offset: number, limit: number) {
    const options: any = {
      offset,
      limit,
      fields: 'total,items(id,name)'
    };
    return Spotify.sendRequest('v1/me/playlists', 'GET', options, true);
  }

  async getPlaylistTracks(playlistId: string) {
    const infoOptions: any = {
      fields: 'total,limit'
    };
    const info: any = await Spotify.sendRequest(`v1/playlists/${playlistId}/tracks`, 'GET', infoOptions, true);
    
    var requests = []
    const numRequests = Math.ceil(info.total/info.limit)
    var count = 0
    do {
      requests.push(
        Spotify.sendRequest(`v1/playlists/${playlistId}/tracks`, 'GET', {
          offset: count*parseInt(info.limit),
          limit: info.limit,
          fields: 'total,items(track(id,name,uri,artists(name)))'
        }, true)
        .then((data: any) => {
          const idList = data.items.map((item: any) => item.track.id)
          return Spotify.getTracksAudioFeatures(idList)
          .then((audioData: any) => {
            const newItems: any[] = data.items.map((item: any, index: number) => {
              const tempo = audioData.audio_features[index] ? audioData.audio_features[index].tempo : null;
              return {
                ...item,
                tempo
              };
            });
            return newItems;
          })
        })
      )
      count++
    } while (count < numRequests)
    const responses: any = await Promise.all(requests);
    const allResponses = responses.map((data: any) => data).flat();
    const allTempos = await this.getTempo();
    if(allTempos) {
      const responseWithUserTempo = allResponses.map((item: Track) => {
        var tempo = item.tempo
        if(allTempos[item.track.id]) {
          tempo = allTempos[item.track.id].tempo
        }
        return {
          ...item,
          tempo
        }
      });
      return responseWithUserTempo;
    } else {
      return allResponses;
    }
  }
}

export default new Data();