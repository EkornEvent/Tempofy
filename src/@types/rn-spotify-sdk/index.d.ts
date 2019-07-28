/// <reference types="node" />

import { bool } from "prop-types";

declare module 'rn-spotify-sdk' {

    export interface Spotify {
	
    }
    
    export function initialize(options: object): object;
    export function isInitializedAsync(): object;
    export function isLoggedInAsync(): boolean;
    export function login(): boolean;
    export function playURI(track: string, first: number, second: number): object;
    export function setPlaying(value: boolean): boolean;
}

