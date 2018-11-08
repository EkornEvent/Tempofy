import { NativeModules } from 'react-native';
var Tempofy = NativeModules.Tempofy;

import actionTypes from '../constants'

export default class PlayBlockHandler {
  constructor(spotify) {
    this.blocks = []
    this.spotify = spotify
    this.uri = null
    this.currentBlock = null
  }

  playerStateDidChange(state, playerState) {
    this.state = state
    this.player = playerState

    // Change track, new blocks
    if(this.uri != state.uri) {
      console.log('New track found, creating blocks');
      this.setupPlayBlocks(state, playerState.autoSkipTime)
      this.playBlock(this.getPlayableBlocks()[0])
    }

    // Playing
    if(!state.paused) {
      this.didChangePosition(state.playbackPosition)
    }
  }

  didChangePosition(position) {
    console.log('didChangePosition: '+position);
    if(!this.currentBlock || this.isChangingBlock) {
      return
    }

    const autoSkipFadeTime = this.player.autoSkipFadeTime
    const autoSkipMode = this.player.autoSkipMode
    const isFading = this.spotify.store.getState().data.isFading
    if(autoSkipMode > 0) {
      const endTime = this.currentBlock.end - autoSkipFadeTime
      if(position > endTime) {
        if(!isFading) {
          this.spotify.fadeWithAction(() => {
            if(autoSkipMode == 1) {
              this.spotify.skipToNext()
            } else if(autoSkipMode == 2) {
              const playableBlocks = this.getPlayableBlocks()
              const currentBlockIndex = playableBlocks.indexOf(this.currentBlock)
              console.log('currentBlockIndex: ' + currentBlockIndex);
              const nextBlockIndex = currentBlockIndex+1
              if(nextBlockIndex <= playableBlocks.length -1) {
                this.playBlock(playableBlocks[nextBlockIndex])
              } else {
                this.spotify.skipToNext()
              }
            }
          })
        }
      }
    } else if(autoSkipMode == 2) {
      if(position > this.currentBlock.end - autoSkipFadeTime) {
        Tempofy.pause()
      }
    }

  }

  getAllBlocks() {
    return this.blocks
  }

  getPlayableBlocks() {
    return this.blocks.filter(block => block.playable)
  }

  setupPlayBlocks(state, blockDuration) {
    console.log('setupPlayBlocks');
    // Save uri for compare
    this.uri = state.uri

    var introSkipTime = 15000
    var outroSkipTime = 5000

    var playBlocks = []
    const playableTime = state.duration - introSkipTime - outroSkipTime
    console.log('playableTime: '+ playableTime + '/' + state.duration);
    const numBlocks = Math.floor(playableTime/blockDuration)
    console.log('numBlocks data: ' + (playableTime/blockDuration));
    console.log('numBlocks: '+ numBlocks);
    var count = 0
    var offset = 0

    var start = offset
    console.log('block start: ' + offset + ' (intro)');
    offset += introSkipTime
    var end = offset
    playBlocks.push({
      start,
      end,
      playable: false
    })
    do {
      if(count == numBlocks-1) {
        const endBlockDuration = playableTime - (numBlocks * blockDuration)
        start = offset
        console.log('block start: ' + offset + ' (adjust)');

        console.log('duration: '+state.duration);
        console.log('playableTime: '+playableTime);
        console.log('introSkipTime: '+introSkipTime);
        console.log('outroSkipTime: '+outroSkipTime);
        console.log('adjustment block duration: '+endBlockDuration);
        offset += endBlockDuration
        end = offset
        playBlocks.push({
          start,
          end,
          playable: false
        })
      }
      start = offset
      console.log('block start: ' + offset);
      offset += blockDuration
      end = offset
      playBlocks.push({
        start,
        end,
        playable: true
      })

      count++
    } while (count < numBlocks)

    start = offset
    console.log('block start: ' + offset + ' (outro)');
    offset += outroSkipTime
    end = offset
    playBlocks.push({
      start,
      end,
      playable: false
    })

    this.blocks = playBlocks
    console.log(playBlocks);
  }

  playBlock(block) {
    console.log('playBlock: ' + block.start);
    this.currentBlock = block

    // Delay for old duration updates
    this.isChangingBlock = true
    if(this.changeBlockTimer) {
      clearTimeout(this.changeBlockTimer)
    }
    this.changeBlockTimer = setTimeout(() => {
      this.isChangingBlock = false
    }, 1000)

    if(this.state.paused) {
      Tempofy.resume()
    }
    Tempofy.seekToPosition(block.start)

    // Set new end playback time
    this.spotify.store.dispatch({ type: actionTypes.UPDATE_TIME_LEFT_POSITION, value: block.end })
  }

}


class PlayBlock {
  play() {

  }
}
