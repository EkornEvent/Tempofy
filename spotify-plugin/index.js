const { withPlugins, withAppDelegate, withDangerousMod } = require('@expo/config-plugins');
const { resolve } = require('path');
const { readFileSync, writeFileSync } = require('fs');

function withSpotifyAppDelegate(config) {
    return withAppDelegate(config, (cfg) => {
      const { modResults } = cfg;
      const { contents } = modResults;
      const lines = contents.split('\n');

      const importIndex = lines.findIndex((line) =>
	      /^#import "AppDelegate.h"/.test(line)
      );
      const didLaunchIndex = lines.findIndex((line) =>
        /\openURL/.test(line)
      );

      modResults.contents = [
        ...lines.slice(0, importIndex + 1),
        '\n#import <RNSpotifyRemote.h>',
        ...lines.slice(importIndex + 1, didLaunchIndex + 1),
        '  return [[RNSpotifyRemoteAuth sharedInstance] application:application openURL:url options:options] || [super application:application openURL:url options:options] || [RCTLinkingManager application:application openURL:url options:options];',
        ...lines.slice(didLaunchIndex + 2),
      ].join('\n');

      return cfg;
    });
}

function withSpotifyPodfileProperties(config) {
    return withDangerousMod(config, [
	    'ios',
	    (cfg) => {
	      const { platformProjectRoot } = cfg.modRequest;
	      const podfile = resolve(platformProjectRoot, 'Podfile');
	      const contents = readFileSync(podfile, 'utf-8');
	      const lines = contents.split('\n');
	      const index = lines.findIndex((line) =>
	        /\s+use_expo_modules!/.test(line)
	      );

	      writeFileSync(
	        podfile,
	        [
	          ...lines.slice(0, index),
	          `  pod 'RNSpotifyRemote', :path => '../node_modules/react-native-spotify-remote'`,
	          ...lines.slice(index),
	        ].join('\n')
	      );

	      return cfg;
 	    }
	  ]);
}

function withSpotify(config) {
    return withPlugins(config, [
    withSpotifyAppDelegate,
    withSpotifyPodfileProperties
    ]);
}

module.exports = withSpotify;