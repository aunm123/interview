package com.voicecall_rn.CallModule;

import android.Manifest;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.content.res.ColorStateList;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.os.Build;
import android.util.Log;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.twilio.voice.Call;
import com.twilio.voice.CallException;
import com.twilio.voice.CallInvite;
import com.twilio.voice.CancelledCallInvite;
import com.twilio.voice.MessageListener;
import com.twilio.voice.RegistrationException;
import com.twilio.voice.RegistrationListener;
import com.twilio.voice.Voice;
import com.voicecall_rn.R;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

public class CallKitCallModule extends ReactContextBaseJavaModule {

    private static final String EvemtVoiceCallComingStart = "EvemtVoiceCallComingStart";
    private static final String EventCallComing = "EventCallComing";
    private static final String EventCallComingStart = "EventCallComingStart";
    private static final String EventCallDidStartRinging = "EventCallDidStartRinging";
    private static final String EventCallDidConnect = "EventCallDidConnect";
    private static final String EventCallReconnecting = "EventCallReconnecting";
    private static final String EventCallReconnected = "EventCallReconnected";
    private static final String EventCallDidFailed = "EventCallDidFailed";
    private static final String EventCallDisconnected = "EventCallDisconnected";
    private static final String EventNoPermission = "EventNoPermission";
    private static final String EvemtEndCallAction = "EvemtEndCallAction";
    private static final String EventErrorMessage = "EventErrorMessage";
    private static final String EventTokenGet = "EventTokenGet";
    private static final String EventCallReject = "EventCallReject";

    public static final String INCOMING_CALL_INVITE = "INCOMING_CALL_INVITE";
    public static final String CANCELLED_CALL_INVITE = "CANCELLED_CALL_INVITE";
    public static final String INCOMING_CALL_NOTIFICATION_ID = "INCOMING_CALL_NOTIFICATION_ID";
    public static final String ACTION_INCOMING_CALL = "ACTION_INCOMING_CALL";
    public static final String ACTION_CANCEL_CALL = "ACTION_CANCEL_CALL";
    public static final String ACTION_FCM_TOKEN = "ACTION_FCM_TOKEN";

    private static final String TAG = "CallKitCallModule";

    private String accessToken;
    private AudioManager audioManager;
    private SoundPoolManager soundPoolManager;
    private int savedAudioMode = AudioManager.MODE_INVALID;

    private NotificationManager notificationManager;
    private CallInvite activeCallInvite;
    private Call activeCall;
    private int activeCallNotificationId;

    private boolean isReceiverRegistered = false;
    private VoiceBroadcastReceiver voiceBroadcastReceiver;

    RegistrationListener registrationListener = registrationListener();
    Call.Listener callListener = callListener();

    public CallKitCallModule(@Nonnull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Nonnull
    @Override
    public String getName() {
        return "CallKitCallModule";
    }

    private void sendEvent(ReactContext reactContext,
                           String eventName,
                           @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @ReactMethod
    public void registeNotificition(String accessToken) {

//        callActionFab.setOnClickListener(callActionFabClickListener());
//        hangupActionFab.setOnClickListener(hangupActionFabClickListener());
//        holdActionFab.setOnClickListener(holdActionFabClickListener());
//        muteActionFab.setOnClickListener(muteActionFabClickListener());

        notificationManager = (NotificationManager) this.getReactApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);

        soundPoolManager = SoundPoolManager.getInstance(this.getReactApplicationContext());

        /*
         * Setup the broadcast receiver to be notified of FCM Token updates
         * or incoming call invite in this Activity.
         */
        voiceBroadcastReceiver = new VoiceBroadcastReceiver();
        registerReceiver();

        /*
         * Needed for setting/abandoning audio focus during a call
         */

        audioManager = (AudioManager) getReactApplicationContext().getSystemService(Context.AUDIO_SERVICE);
        audioManager.setSpeakerphoneOn(true);

        /*
         * Enable changing the volume using the up/down keys during a conversation
         */
        getCurrentActivity().setVolumeControlStream(AudioManager.STREAM_VOICE_CALL);

        /*
         * Displays a call dialog if the intent contains a call invite
         */
        handleIncomingCallIntent(getCurrentActivity().getIntent());

        /*
         * Ensure the microphone permission is enabled
         */
        this.accessToken = accessToken;
        registerForCallInvites();

    }

    @ReactMethod
    public void onMessageReceived(ReadableMap remoteMessage) {
        Log.d(TAG, "Received onMessageReceived()");


        // Check if message contains a data payload.
        if (remoteMessage.toHashMap().size() > 0) {
            Map<String, String> data = new HashMap<String, String>();

//            for (Iterable<String, String> in remoteMessage.toHashMap()){
//
//            }

            final int notificationId = (int) System.currentTimeMillis();

            boolean valid = (boolean) Voice.handleMessage(data, new MessageListener() {


                @Override
                public void onCallInvite(@NonNull CallInvite callInvite) {

                }

                @Override
                public void onCancelledCallInvite(@NonNull CancelledCallInvite cancelledCallInvite) {

                }
            });

            if (!valid) {
                Log.e(TAG, "The message was not a valid Twilio Voice SDK payload: " +
                        remoteMessage.toString());
            }

        }
    }

    /*
     * Register your FCM token with Twilio to receive incoming call invites
     *
     * If a valid google-services.json has not been provided or the FirebaseInstanceId has not been
     * initialized the fcmToken will be null.
     *
     * In the case where the FirebaseInstanceId has not yet been initialized the
     * VoiceFirebaseInstanceIDService.onTokenRefresh should result in a LocalBroadcast to this
     * activity which will attempt registerForCallInvites again.
     *
     */
    private void registerForCallInvites() {
//        final String fcmToken = FirebaseInstanceId.getInstance().getToken();
//        if (fcmToken != null) {
//            Voice.register(accessToken, Voice.RegistrationChannel.FCM, fcmToken, registrationListener);
//        }
    }

    private RegistrationListener registrationListener() {
        return new RegistrationListener() {
            @Override
            public void onRegistered(String accessToken, String fcmToken) {
                Log.d(TAG, "Successfully registered FCM " + fcmToken);
            }

            @Override
            public void onError(RegistrationException error, String accessToken, String fcmToken) {
                String message = String.format("Registration Error: %d, %s", error.getErrorCode(), error.getMessage());
                Log.e(TAG, message);
            }
        };
    }

    private Call.Listener callListener() {
        return new Call.Listener() {
            /*
             * This callback is emitted once before the Call.Listener.onConnected() callback when
             * the callee is being alerted of a Call. The behavior of this callback is determined by
             * the answerOnBridge flag provided in the Dial verb of your TwiML application
             * associated with this client. If the answerOnBridge flag is false, which is the
             * default, the Call.Listener.onConnected() callback will be emitted immediately after
             * Call.Listener.onRinging(). If the answerOnBridge flag is true, this will cause the
             * call to emit the onConnected callback only after the call is answered.
             * See answeronbridge for more details on how to use it with the Dial TwiML verb. If the
             * twiML response contains a Say verb, then the call will emit the
             * Call.Listener.onConnected callback immediately after Call.Listener.onRinging() is
             * raised, irrespective of the value of answerOnBridge being set to true or false
             */
            @Override
            public void onRinging(Call call) {
                Log.d(TAG, "Ringing");
            }

            @Override
            public void onConnectFailure(Call call, CallException error) {
                setAudioFocus(false);
                Log.d(TAG, "Connect failure");
                String message = String.format("Call Error: %d, %s", error.getErrorCode(), error.getMessage());
                Log.e(TAG, message);
            }

            @Override
            public void onConnected(Call call) {
                setAudioFocus(true);
                Log.d(TAG, "Connected");
                activeCall = call;
            }

            @Override
            public void onReconnecting(@NonNull Call call, @NonNull CallException callException) {
                Log.d(TAG, "onReconnecting");
            }

            @Override
            public void onReconnected(@NonNull Call call) {
                Log.d(TAG, "onReconnected");
            }

            @Override
            public void onDisconnected(Call call, CallException error) {
                setAudioFocus(false);
                Log.d(TAG, "Disconnected");
                if (error != null) {
                    String message = String.format("Call Error: %d, %s", error.getErrorCode(), error.getMessage());
                    Log.e(TAG, message);
                }
            }
        };
    }


    private View.OnClickListener callActionFabClickListener() {
        return new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.d(TAG, " callActionFabClickListener");
            }
        };
    }

    private View.OnClickListener hangupActionFabClickListener() {
        return new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                soundPoolManager.playDisconnect();
                Log.d(TAG, " hangupActionFabClickListener");
                disconnect();
            }
        };
    }

    private View.OnClickListener holdActionFabClickListener() {
        return new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.d(TAG, " holdActionFabClickListener");
                hold();
            }
        };
    }

    private View.OnClickListener muteActionFabClickListener() {
        return new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.d(TAG, " muteActionFabClickListener");
                mute();
            }
        };
    }

    /*
     * Accept an incoming Call
     */
    private void answer() {
        activeCallInvite.accept(getReactApplicationContext(), callListener);
        notificationManager.cancel(activeCallNotificationId);
    }

    /*
     * Disconnect from Call
     */
    private void disconnect() {
        if (activeCall != null) {
            activeCall.disconnect();
            activeCall = null;
        }
    }

    private void hold() {
        if (activeCall != null) {
            boolean hold = !activeCall.isOnHold();
            activeCall.hold(hold);

            // Set fab as pressed when call is on hold
            Log.d(TAG, "callActionFabClickListener muteActionFabClickListener");
        }
    }

    private void mute() {
        if (activeCall != null) {
            boolean mute = !activeCall.isMuted();
            activeCall.mute(mute);
            if (mute) {
                Log.d(TAG, "mute true");
            } else {
                Log.d(TAG, "mute false");
            }
        }
    }

    private void setAudioFocus(boolean setFocus) {
        if (audioManager != null) {
            if (setFocus) {
                savedAudioMode = audioManager.getMode();
                // Request audio focus before making any device switch.
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    AudioAttributes playbackAttributes = new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                            .build();
                    AudioFocusRequest focusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
                            .setAudioAttributes(playbackAttributes)
                            .setAcceptsDelayedFocusGain(true)
                            .setOnAudioFocusChangeListener(new AudioManager.OnAudioFocusChangeListener() {
                                @Override
                                public void onAudioFocusChange(int i) {
                                }
                            })
                            .build();
                    audioManager.requestAudioFocus(focusRequest);
                } else {
                    int focusRequestResult = audioManager.requestAudioFocus(new AudioManager.OnAudioFocusChangeListener() {

                                                                                @Override
                                                                                public void onAudioFocusChange(int focusChange) {
                                                                                }
                                                                            }, AudioManager.STREAM_VOICE_CALL,
                            AudioManager.AUDIOFOCUS_GAIN_TRANSIENT);
                }
                /*
                 * Start by setting MODE_IN_COMMUNICATION as default audio mode. It is
                 * required to be in this mode when playout and/or recording starts for
                 * best possible VoIP performance. Some devices have difficulties with speaker mode
                 * if this is not set.
                 */
                audioManager.setMode(AudioManager.MODE_IN_COMMUNICATION);
            } else {
                audioManager.setMode(savedAudioMode);
                audioManager.abandonAudioFocus(null);
            }
        }
    }


    private void handleIncomingCallIntent(Intent intent) {
        if (intent != null && intent.getAction() != null) {
            if (intent.getAction().equals(ACTION_INCOMING_CALL)) {
                activeCallInvite = intent.getParcelableExtra(INCOMING_CALL_INVITE);
                if (activeCallInvite != null) {
                    soundPoolManager.playRinging();
                    activeCallNotificationId = intent.getIntExtra(INCOMING_CALL_NOTIFICATION_ID, 0);

                    Log.d(TAG, " playRinging");
                } else {

                }
            } else if (intent.getAction().equals(ACTION_CANCEL_CALL)) {
                soundPoolManager.stopRinging();

                Log.d(TAG, " stopRinging");
            } else if (intent.getAction().equals(ACTION_FCM_TOKEN)) {
                Log.d(TAG, " ACTION_FCM_TOKEN");
            }
        }
    }

    private void registerReceiver() {
        if (!isReceiverRegistered) {
            IntentFilter intentFilter = new IntentFilter();
            intentFilter.addAction(ACTION_INCOMING_CALL);
            intentFilter.addAction(ACTION_CANCEL_CALL);
            intentFilter.addAction(ACTION_FCM_TOKEN);
            LocalBroadcastManager.getInstance(getReactApplicationContext()).registerReceiver(
                    voiceBroadcastReceiver, intentFilter);
            isReceiverRegistered = true;
        }
    }

    private void unregisterReceiver() {
        if (isReceiverRegistered) {
            LocalBroadcastManager.getInstance(getReactApplicationContext()).unregisterReceiver(voiceBroadcastReceiver);
            isReceiverRegistered = false;
        }
    }

    private class VoiceBroadcastReceiver extends BroadcastReceiver {

        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (action.equals(ACTION_INCOMING_CALL) || action.equals(ACTION_CANCEL_CALL)) {
                /*
                 * Handle the incoming or cancelled call invite
                 */
                handleIncomingCallIntent(intent);
            }
        }
    }
}
