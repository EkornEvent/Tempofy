import Spotify from 'rn-spotify-sdk';
import { useSettings } from './useSettings';
import { useVolume } from './useVolume';
import { Track } from 'api/Types';

export function usePlayer() {
    const {fadeUp, resetFade} = useVolume();
    const {introSkipTime} = useSettings();

    function playTrack(item: Track) {
        resetFade();
        fadeUp();
        Spotify.playURI(item.track.uri, 0, introSkipTime);
    }

    return {
        playTrack
    }
}