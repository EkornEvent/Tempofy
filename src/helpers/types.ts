export interface TrackObject extends SpotifyApi.TrackObjectSimplified {
    tempo: number | null
}

export enum AutoSkipMode {
    Off,
    Skip,
    Pause,
}

export interface TempoData {
    tempo: number,
    updatedAt: string,
    updatedBy: string
}

export interface PlayerState {
    isPaused: boolean;
    playbackPosition: number;
    track: {
        uri: string;
        name: string;
        duration: number;
        artist: { name: string };
    };
}

export interface PlaybackControls {
    playUri: (uri: string) => Promise<unknown>;
    pause: () => Promise<unknown>;
    resume: () => Promise<unknown>;
    skipToNext: () => Promise<unknown>;
    skipToPrevious: () => Promise<unknown>;
    seek: (positionMs: number) => Promise<unknown>;
    getPlayerState: () => Promise<PlayerState | undefined>;
    // Add a track to Spotify's own playback queue. Experiment: seeding the next
    // track gives a hardware/remote skip-next a real target, since bare-URI
    // playback otherwise leaves Spotify with nothing to skip to.
    queue: (uri: string) => Promise<unknown>;
}