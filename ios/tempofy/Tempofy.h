//
//  Tempofy.h
//  tempofy
//
//  Created by Johan Ekorn on 2018-09-18.
//  Copyright © 2018 650 Industries, Inc. All rights reserved.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <Foundation/Foundation.h>
#import <SpotifyiOS/SpotifyiOS.h>

NS_ASSUME_NONNULL_BEGIN

@interface Tempofy : RCTEventEmitter <RCTBridgeModule, SPTSessionManagerDelegate, SPTAppRemoteDelegate, SPTAppRemotePlayerStateDelegate>

@property (strong, nonatomic) SPTSessionManager *sessionManager;
@property (strong, nonatomic) SPTAppRemote *appRemote;

- (void)setupSharedAuthentication;
- (BOOL)openURL:(NSURL *)url app:(UIApplication *)app options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options;
- (void)didBecomeActive;
- (void)willResignActive;

@end

NS_ASSUME_NONNULL_END
