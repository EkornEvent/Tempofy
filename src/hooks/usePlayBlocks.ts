import React, { useState, useEffect, useRef } from 'react';
import Spotify from 'rn-spotify-sdk';
import { PlayBlock, Track } from 'api/Types';
import { useMetadata, useTrackState, useSettings } from './useTempofy';
import { useVolume } from './useVolume';

export function usePlayBlocks() {
    const [blocks, setBlocks] = useState<PlayBlock[]>([]);
    const [currentBlock, setCurrentBlock] = useState<PlayBlock>(null);
    const metadata = useMetadata();
    const state = useTrackState();
    const [currentTrack, setCurrentTrack] = useState<Track>(null);
    const {introSkipTime, outroSkipTime, fadeTime, autoSkipTime} = useSettings();
    const {fadeDown, fadeUp, resetFade} = useVolume();

    useEffect(() => {
        if(metadata && (currentTrack === null || (metadata.currentTrack && (metadata.currentTrack.uri != currentTrack.uri)))) {
            setCurrentTrack(metadata.currentTrack);
        }
    },[metadata]);

    useEffect(() => {
        if(currentTrack) {
            setupPlayBlocks(autoSkipTime);
        }
    },[currentTrack]);

    useEffect(() => {
        /*
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
    */
        const playingBlock = blocks.find(block => ((state.position > block.start) && (state.position < block.end)));
        if(playingBlock) {
            if(state.position > (playingBlock.end - fadeTime)) {
                fadeDown();
            }
        }
        if(playingBlock != currentBlock) {
            setCurrentBlock(playingBlock);
        }
    },[state && state.position]);

    async function didChangePlayBlock() {
        if(currentBlock && !currentBlock.playable) {
            await Spotify.seek(currentBlock.end);
        }
        await fadeUp();
    }

    useEffect(() => {
        didChangePlayBlock();
    },[currentBlock]);

    function setupPlayBlocks(blockDuration: number) {
        var playBlocks = []
        const playableTime = currentTrack.duration - introSkipTime - outroSkipTime
        //console.log('playableTime: '+ playableTime + '/' + currentTrack.duration);
        const numBlocks = Math.floor(playableTime/blockDuration)
        //console.log('numBlocks data: ' + (playableTime/blockDuration));
        //console.log('numBlocks: '+ numBlocks);
        var count = 0
        var offset = 0

        var start = offset
        //console.log('block start: ' + offset + ' (intro)');
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
                /*
                console.log('block start: ' + offset + ' (adjust)');
                console.log('duration: '+currentTrack.duration);
                console.log('playableTime: '+playableTime);
                console.log('introSkipTime: '+introSkipTime);
                console.log('outroSkipTime: '+outroSkipTime);
                console.log('adjustment block duration: '+endBlockDuration);
                */
                offset += endBlockDuration
                end = offset
                playBlocks.push({
                    start,
                    end,
                    playable: false
                })
            }
            start = offset
            //console.log('block start: ' + offset);
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
        //console.log('block start: ' + offset + ' (outro)');
        offset += outroSkipTime
        end = offset
        playBlocks.push({
            start,
            end,
            playable: false
        })

        setBlocks(playBlocks);
        //console.log(playBlocks);
    }

    function playBlock(block: PlayBlock) {
        Spotify.setPlaying(true);
        Spotify.seek(block.start);
    }

    return [
        blocks,
        playBlock
    ];
}