export interface TrackObject extends SpotifyApi.TrackObjectSimplified {
    tempo: number | null
}

export enum AutoSkipMode {
    Off,
    Skip,
    Fade,
}