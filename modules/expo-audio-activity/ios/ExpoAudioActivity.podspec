Pod::Spec.new do |s|
  s.name           = 'ExpoAudioActivity'
  s.version        = '1.0.0'
  s.summary        = 'Detect whether other apps are playing audio'
  s.description    = 'Local Expo module exposing AVAudioSession.isOtherAudioPlaying.'
  s.license        = 'MIT'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platform       = :ios, '15.1'
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,swift}"
end
