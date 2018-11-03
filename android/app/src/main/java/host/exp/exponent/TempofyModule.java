package host.exp.exponent;

import android.util.Log;

import android.content.Intent;
import android.app.Activity;
import com.facebook.react.bridge.ActivityEventListener
        ;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.Map;
import java.util.HashMap;

import com.facebook.react.bridge.WritableMap;
import com.spotify.android.appremote.api.ConnectionParams;
import com.spotify.android.appremote.api.Connector;
import com.spotify.android.appremote.api.SpotifyAppRemote;

import com.spotify.sdk.android.authentication.AuthenticationClient;
import com.spotify.sdk.android.authentication.AuthenticationRequest;
import com.spotify.sdk.android.authentication.AuthenticationResponse;

import com.spotify.protocol.client.Subscription;
import com.spotify.protocol.types.PlayerState;
import com.spotify.protocol.types.Track;

public class TempofyModule extends ReactContextBaseJavaModule implements ActivityEventListener, LifecycleEventListener {

    private static final String TAG = "Tempofy";
    private static final String CLIENT_ID = "af12e293266d43f98e6cef548cd67197";
    private static final String REDIRECT_URI = "tempofy-login://callback";
    private static final int REQUEST_CODE = 1337;
    private SpotifyAppRemote mSpotifyAppRemote;

    private ReactContext mReactContext;

    public TempofyModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mReactContext = reactContext;
        reactContext.addActivityEventListener(this);
        reactContext.addLifecycleEventListener(this);
    }

    @Override
    public String getName() {
        return "Tempofy";
    }

    public void onNewIntent(Intent intent) { }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        // Check if result comes from the correct activity
        Log.i(TAG, "onActivityResult");
        if (requestCode == REQUEST_CODE) {
            AuthenticationResponse response = AuthenticationClient.getResponse(resultCode, data);
            if (response.getType() == AuthenticationResponse.Type.TOKEN) {
                WritableMap params = Arguments.createMap();
                params.putString("accessToken", response.getAccessToken());
                sendEvent("loginSuccessful", params);
                //onAuthenticationComplete(response);
                Log.i(TAG, "loginSuccessful");
            }
        }
    }

    @Override
    public void onHostResume() {

    }

    @Override
    public void onHostPause() {

    }

    @Override
    public void onHostDestroy() {
        //Spotify.destroyPlayer(this);
    }

    private void sendEvent(String eventName, Object params) {
        mReactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @ReactMethod
    public void updatePlayerState() {
        //Log.i(TAG, "updatePlayerState");
    }

    @ReactMethod
    public void login(){
        AuthenticationRequest.Builder builder = new AuthenticationRequest.Builder(CLIENT_ID,
                AuthenticationResponse.Type.TOKEN,
                REDIRECT_URI);
        builder.setScopes(new String[]{
                "playlist-read-private",
                "playlist-read-collaborative",
                "playlist-modify-public",
                "playlist-modify-private",
                "user-read-private",
                "streaming",
                "app-remote-control",
                "user-read-playback-state",
                "user-modify-playback-state",
                "user-read-currently-playing",
                "user-read-recently-played",
                "user-library-read",
                "user-library-modify"
        });
        AuthenticationRequest request = builder.build();
        AuthenticationClient.openLoginActivity(getCurrentActivity(), REQUEST_CODE, request);
        Log.i(TAG, "login");
    }

}