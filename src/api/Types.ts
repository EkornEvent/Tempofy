export interface Track {
    name: string;
    id: string;
    track: any;
    tempo: number;
}

export interface Playlist {
    id: string;
    name: string;
    tracks: Track[];
}

export interface PlayBlock {
    start: number;
    end: number;
    playable: boolean;
}