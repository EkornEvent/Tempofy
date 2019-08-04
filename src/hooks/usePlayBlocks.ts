import React, { useState, useEffect, useContext } from 'react';
import Spotify from 'rn-spotify-sdk';
import { PlayBlock, Track } from 'api/Types';
import { usePlayer } from './usePlayer';
import { useSettings } from './useSettings';
import { useMetadata } from './useMetadata';
import { useTrackState } from './useTrackState';
import { useVolume } from './useVolume';
import { PlayingContext } from "context/PlayingContext";

export function usePlayBlocks() {
    const [playing, setPlaying] = useContext(PlayingContext);
    const metadata = useMetadata();
    const state = useTrackState();
    const [currentTrack, setCurrentTrack] = useState<Track>(null);
    const {introSkipTime, outroSkipTime, fadeTime, autoSkipTime, autoSkipMode} = useSettings();
    const {fadeDown, fadeUp} = useVolume();
    const { playTrack } = usePlayer();

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
        if(state && state.position) {
            const playingBlock = playing.playBlocks.find(block => ((state.position > block.start) && (state.position < block.end)));
            if(playingBlock) {
                if(state.position > (playingBlock.end - fadeTime)) {
                    willEndPlayBlock();
                }
            }
            if(playingBlock != playing.currentBlock) {
                setCurrentBlock(playingBlock);
            }    
        }
    },[state]);


    function setBlocks(playBlocks: PlayBlock[]) {
        console.log('setBlocks');
        
        setPlaying(playing => ({ ...playing, playBlocks }));
    }

    function setCurrentBlock(playBlock: PlayBlock) {
        console.log('setCurrentBlock');
        
        setPlaying(playing => ({ ...playing, currentBlock: playBlock }));
    }

    async function didChangePlayBlock() {
        console.log('didChangePlayBlock');
        
        if(playing.currentBlock && !playing.currentBlock.playable) {
            await Spotify.seek(playing.currentBlock.end);
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
    },[playing.currentBlock]);

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
        playing.playBlocks,
        playBlock
    ];
}