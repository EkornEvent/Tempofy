package expo.modules.audioactivity

import android.content.Context
import android.media.AudioManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AudioActivityModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AudioActivity")

    // Synchronous read of whether music/audio is active on the device. Reflects
    // any app's playback (including remote/streaming), needs no permission, and
    // is not app-specific — any other audio reads true.
    Function("isAudioPlaying") {
      val audioManager = appContext.reactContext
        ?.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
      audioManager?.isMusicActive ?: false
    }
  }
}
