import ExpoModulesCore
import AVFoundation

public class AudioActivityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AudioActivity")

    // Synchronous read of whether another app (e.g. Spotify) is producing
    // audio. `isOtherAudioPlaying` reflects the system mix state and needs no
    // permission. It is not app-specific — any other audio reads true.
    Function("isAudioPlaying") { () -> Bool in
      AVAudioSession.sharedInstance().isOtherAudioPlaying
    }
  }
}
