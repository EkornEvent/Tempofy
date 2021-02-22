import React, { useState, useEffect, useContext } from 'react';
import Spotify from 'rn-spotify-sdk';
import { PlayBlock, Track } from 'api/Types';
import { usePlayer } from './usePlayer';
import { useSettings } from './useSettings';
import { useMetadata } from './useMetadata';
import { useTrackState } from './useTrackState';
import { useVolume } from './useVolume';

export function usePlayBlocks() {
    const metadata = useMetadata();
    const state = useTrackState();
    const [currentBlock, setCurrentBlock] = useState<PlayBlock>(null);
    const [currentTrack, setCurrentTrack] = useState<Track>(null);
    const [playBlocks, setPlayBlocks] = useState<PlayBlock>(null);
    const {introSkipTime, outroSkipTime, fadeTime, autoSkipTime, autoSkipMode} = useSettings();
    const {fadeDown, fadeUp} = useVolume();
    const { playTrack } = usePlayer();

    useEffect(() => {
        if(metadata && (metadata.currentTrack != currentTrack)) {
            setCurrentTrack(metadata.currentTrack);
        }
    },[metadata]);

    useEffect(() => {
        if(currentTrack) {
            setupPlayBlocks(autoSkipTime);
        }
    },[currentTrack]);

    useEffect(() => {
        if(state && state.position && playBlocks) {
            const playingBlock = playBlocks.find(block => ((state.position > block.start) && (state.position < block.end)));
            if(playingBlock) {
                if(state.position > (playingBlock.end - fadeTime)) {
                    willEndPlayBlock();
                }
            }
            if(playingBlock != currentBlock) {
                setCurrentBlock(playingBlock);
            }    
        }
    },[state]);

    async function didChangePlayBlock() {
        console.log('didChangePlayBlock');
        
        if(currentBlock && !currentBlock.playable) {
            await Spotify.seek(currentBlock.end);
        }
        await fadeUp();
    }

    async function willEndPlayBlock() {
        await fadeDown();
        if(autoSkipMode > 0) {
            if(autoSkipMode == 1) {
                playTrack(metadata.nextTrack);
            } else if(autoSkipMode == 2) {
                    
            }
        }
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

        setPlayBlocks(playBlocks);
        //console.log(playBlocks);
    }

    function playBlock(block: PlayBlock) {
        Spotify.setPlaying(true);
        Spotify.seek(block.start);
    }

    return [
        currentBlock,
        playBlocks,
        playBlock
    ];
}