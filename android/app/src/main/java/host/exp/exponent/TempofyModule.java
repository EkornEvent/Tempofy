package host.exp.exponent;

import android.content.BroadcastReceiver;
import android.content.Intent;
import android.os.Looper;
import android.util.Log;
import android.os.Bundle;
import android.app.Activity;
import android.media.AudioManager;
import android.content.Context;
import android.net.NetworkInfo;
import android.net.ConnectivityManager;
import android.content.Intent;
import android.content.IntentFilter;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.spotify.sdk.android.authentication.AuthenticationClient;
import com.spotify.sdk.android.authentication.AuthenticationRequest;
import com.spotify.sdk.android.authentication.AuthenticationResponse;

import android.os.Handler;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

public class TempofyModule extends ReactContextBaseJavaModule implements ActivityEventListener, LifecycleEventListener {

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

    private static final String CLIENT_ID = "af12e293266d43f98e6cef548cd67197";
    private static final String REDIRECT_URI = "tempofy-login://callback";
    private static final int REQUEST_CODE = 1337;

    public static final String TAG = "Tempofy";

    @Override
    public void onHostPause() {

    }

    @Override
    public void onHostResume() {

    }

    @Override
    public void onHostDestroy() {

    }

    @ReactMethod
    public void updatePlayerState(){

    }

    @ReactMethod
    public void login(){
        AuthenticationRequest.Builder builder = new AuthenticationRequest.Builder(CLIENT_ID,
                AuthenticationResponse.Type.TOKEN,
                REDIRECT_URI);
        builder.setScopes(new String[]{
                "user-modify-playback-state",
                "user-read-currently-playing",
                "user-read-playback-state",
                "user-library-modify",
                "user-library-read",
                "streaming",
                "app-remote-control",
                "user-read-email",
                "user-read-private",
                "user-read-birthdate",
                "user-follow-read",
                "user-follow-modify",
                "playlist-read-private",
                "playlist-read-collaborative",
                "playlist-modify-public",
                "playlist-modify-private",
                "user-read-recently-played",
                "user-top-read"
        });

        AuthenticationRequest request = builder.build();
        AuthenticationClient.openLoginActivity(getCurrentActivity(), REQUEST_CODE, request);

        logStatus("login");
    }

    private void sendEvent(String eventName, Object params) {
        mReactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    private void logStatus(String status) {
        Log.i(TAG, status);
    }

    public void onNewIntent(Intent intent) { }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        Log.i(TAG, "onActivityResult");
        // Check if result comes from the correct activity
        if (requestCode == REQUEST_CODE) {
            AuthenticationResponse response = AuthenticationClient.getResponse(resultCode, data);
            switch (response.getType()) {
                // Response was successful and contains auth token
                case TOKEN:
                    // Handle successful response
                    WritableMap params = Arguments.createMap();
                    params.putString("accessToken", response.getAccessToken());
                    sendEvent("loginSuccessful", params);
                    onAuthenticationComplete(response);
                    logStatus("loginSuccessful");
                    break;

                // Auth flow returned an error
                case ERROR:
                    // Handle error response
                    logStatus("loginError: " + response.getError());
                    break;

                // Most likely auth flow was cancelled
                default:
                    // Handle other cases
                    logStatus("cancelled");
            }
        }
    }

    private void onAuthenticationComplete(AuthenticationResponse authResponse) {
        // Once we have obtained an authorization token, we can proceed with creating a Player.
        logStatus("onAuthenticationComplete");

    }

}
