//
//  Tempofy.m
//  tempofy
//
//  Created by Johan Ekorn on 2018-09-18.
//  Copyright © 2018 650 Industries, Inc. All rights reserved.
//

#import "Tempofy.h"

static NSString * const kSessionUserDefaultsKey = @"TempofySession";
static NSString * const kClientId = @"af12e293266d43f98e6cef548cd67197";
static NSString * const kCallbackURL = @"tempofy-login://callback";
static NSString * const kTokenSwapServiceURL = @"https://us-central1-organic-poetry-135723.cloudfunctions.net/endpoint/swap/";
static NSString * const kTokenRefreshServiceURL = @"https://us-central1-organic-poetry-135723.cloudfunctions.net/endpoint/refresh/";


@implementation Tempofy

+ (id)alloc {
    [UIApplication sharedApplication].idleTimerDisabled = YES;
    
    static Tempofy *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [super alloc];
    });
    return sharedInstance;
}

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[
         @"didFailWithError",
         @"didInitiateSession",
         @"didFailConnectionAttemptWithError",
         @"didDisconnectWithError",
         @"appRemoteDidEstablishConnection",
         @"playerStateDidChange"
     ];
}

- (void)setupSharedAuthentication {
    NSLog(@"setupSharedAuthentication");
    SPTConfiguration *configuration =
    [[SPTConfiguration alloc] initWithClientID:kClientId redirectURL:[NSURL URLWithString:kCallbackURL]];

    configuration.tokenSwapURL = [NSURL URLWithString:kTokenSwapServiceURL];
    configuration.tokenRefreshURL = [NSURL URLWithString:kTokenRefreshServiceURL];
    
    self.sessionManager = [SPTSessionManager sessionManagerWithConfiguration:configuration delegate:self];
    
    self.appRemote = [[SPTAppRemote alloc] initWithConfiguration:configuration logLevel:SPTAppRemoteLogLevelDebug];
}

RCT_EXPORT_METHOD(login)
{
    
    /*
     Scopes let you specify exactly what types of data your application wants to
     access, and the set of scopes you pass in your call determines what access
     permissions the user is asked to grant.
     For more information, see https://developer.spotify.com/web-api/using-scopes/.
     */
    SPTScope scope =
    SPTPlaylistReadPrivateScope |
    SPTPlaylistReadCollaborativeScope |
    SPTPlaylistModifyPublicScope |
    SPTPlaylistModifyPrivateScope |
    SPTUserReadPrivateScope |
    SPTStreamingScope |
    SPTAppRemoteControlScope |
    SPTUserReadPlaybackStateScope |
    SPTUserModifyPlaybackStateScope |
    SPTUserReadCurrentlyPlayingScope |
    SPTUserReadRecentlyPlayedScope |
    SPTUserLibraryReadScope |
    SPTUserLibraryModifyScope;
    
    if (@available(iOS 11, *)) {
        // Use this on iOS 11 and above to take advantage of SFAuthenticationSession
        [self.sessionManager initiateSessionWithScope:scope options:SPTDefaultAuthorizationOption];
    } else {
        // Use this on iOS versions < 11 to use SFSafariViewController
        [self.sessionManager initiateSessionWithScope:scope options:SPTDefaultAuthorizationOption presentingViewController:self];
    }
    
}

- (BOOL)openURL:(NSURL *)url app:(UIApplication *)app options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
    return [self.sessionManager application:app openURL:url options:options];
}

- (void)sessionManager:(nonnull SPTSessionManager *)manager didFailWithError:(nonnull NSError *)error {
    
    printf("\ndidFailWithError");
    [self sendEventWithName:@"didFailWithError" body:[error localizedDescription]];
}

- (void)sessionManager:(nonnull SPTSessionManager *)manager didInitiateSession:(nonnull SPTSession *)session {
    printf("\ndidInitiateSession");
    [self sendEventWithName:@"didInitiateSession" body:session.accessToken];
    self.appRemote.connectionParameters.accessToken = session.accessToken;
    dispatch_async(dispatch_get_main_queue(), ^{
        self.appRemote.delegate = self;
        [self.appRemote connect];
    });
}

- (void)appRemote:(nonnull SPTAppRemote *)appRemote didDisconnectWithError:(nullable NSError *)error {
    printf("\ndidDisconnectWithError %s", [error localizedFailureReason]);
    [self sendEventWithName:@"didDisconnectWithError" body:[error localizedFailureReason]];
}

- (void)appRemote:(nonnull SPTAppRemote *)appRemote didFailConnectionAttemptWithError:(nullable NSError *)error {
    printf("\ndidFailConnectionAttemptWithError %s", [error localizedFailureReason]);
    [self sendEventWithName:@"didFailConnectionAttemptWithError" body:[error localizedFailureReason]];
}

- (void)appRemoteDidEstablishConnection:(nonnull SPTAppRemote *)appRemote {
    printf("\nappRemoteDidEstablishConnection");
    [self sendEventWithName:@"appRemoteDidEstablishConnection" body:nil];
    self.appRemote.playerAPI.delegate = self;
    [self.appRemote.playerAPI subscribeToPlayerState:^(id  _Nullable result, NSError * _Nullable error) {
        // Handle Errors
    }];
}

- (void)playerStateDidChange:(nonnull id<SPTAppRemotePlayerState>)playerState {
    if(playerState.track.artist.name == NULL)
        return;
    
    [self sendEventWithName:@"playerStateDidChange" body:@{
        @"uri":playerState.track.URI,
        @"duration":@(playerState.track.duration),
        @"name":playerState.track.name,
        @"artistName":playerState.track.artist.name,
        @"paused": @(playerState.paused ? "true" : "false"),
        @"playbackPosition": @(playerState.playbackPosition)
    }];
}

- (void)didBecomeActive {
    printf("\ndidBecomeActive");
    if(self.appRemote.connectionParameters.accessToken) {
        [self.appRemote connect];
    }
}

- (void)willResignActive {
    if (self.appRemote.isConnected) {
        [self.appRemote disconnect];
    }
}

RCT_EXPORT_METHOD(play:(NSString *)uri)
{
    [self.appRemote.playerAPI play:uri callback:^(id  _Nullable result, NSError * _Nullable error) {
        
    }];
};

RCT_EXPORT_METHOD(authorizeAndPlayURI:(NSString *)uri)
{
    [self.appRemote authorizeAndPlayURI:uri];
};

RCT_EXPORT_METHOD(pause)
{
    [self.appRemote.playerAPI pause:^(id  _Nullable result, NSError * _Nullable error) {
        
    }];
};

RCT_EXPORT_METHOD(resume)
{
    [self.appRemote.playerAPI resume:^(id  _Nullable result, NSError * _Nullable error) {
        
    }];
};

RCT_EXPORT_METHOD(skipToNext)
{
    [self.appRemote.playerAPI skipToNext:^(id  _Nullable result, NSError * _Nullable error) {
    }];
};

RCT_EXPORT_METHOD(updatePlayerState)
{
    [self.appRemote.playerAPI getPlayerState:^(id  _Nullable result, NSError * _Nullable error) {
        [self playerStateDidChange:result];
    }];
};


RCT_REMAP_METHOD(enqueueTrackUri,
                 uri:(NSString *)uri
                 enqueueTrackUriWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    printf("\nenqueueTrackUri: %s", [uri UTF8String]);
    [self.appRemote.playerAPI enqueueTrackUri:uri callback:^(id  _Nullable result, NSError * _Nullable error) {
        
        if(error) {
            reject(@"enqueueTrackUri", [error localizedDescription], error);
        }
        else {
            resolve(result);
        }
    }];
}

RCT_REMAP_METHOD(seekToPosition,
                 position:(NSInteger *)position
                 seekToPositionWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    printf("\nseekToPosition: %ld", position);
    [self.appRemote.playerAPI seekToPosition:position callback:^(id  _Nullable result, NSError * _Nullable error) {
        
        if(error) {
            reject(@"seekToPosition", [error localizedDescription], error);
        }
        else {
            resolve(result);
        }
    }];
};

@end
