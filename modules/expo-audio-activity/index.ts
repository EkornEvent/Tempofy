import { requireOptionalNativeModule } from 'expo-modules-core';

// Optional so the JS bundle keeps working on a binary that predates this native
// module (e.g. before the next dev build): the require resolves to null instead
// of throwing, and isAudioPlaying() degrades to `false` (never auto-reconnect).
const AudioActivity = requireOptionalNativeModule<{
    isAudioPlaying: () => boolean;
}>('AudioActivity');

/** True when the native module is present in the running binary. */
export const isAudioActivityAvailable = AudioActivity != null;

/**
 * Whether *another* app (e.g. Spotify) is currently producing audio on the
 * device. iOS: `AVAudioSession.isOtherAudioPlaying`; Android:
 * `AudioManager.isMusicActive()`. Synchronous and cheap — safe to poll.
 *
 * NOT app-specific: any audio (podcast, video, game) reads true. And it can
 * briefly read false in the silent gap between tracks, so debounce before
 * acting on it.
 */
export function isAudioPlaying(): boolean {
    return AudioActivity?.isAudioPlaying() ?? false;
}
