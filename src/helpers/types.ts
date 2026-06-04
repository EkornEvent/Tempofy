export interface TrackObject extends SpotifyApi.TrackObjectSimplified {
    tempo: number | null
}

export enum AutoSkipMode {
    Off,
    Skip,
    Fade,
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
}