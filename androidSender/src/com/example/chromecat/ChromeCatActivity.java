/*
 * Copyright (C) 2013 Google Inc. All Rights Reserved. 
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at 
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and 
 * limitations under the License.
 */

package com.example.chromecat;

import java.io.IOException;

import org.json.JSONException;
import org.json.JSONObject;

import com.example.castsample.R;
import com.example.castsample.mediaroutedialog.SampleMediaRouteDialogFactory;
import com.google.cast.ApplicationChannel;
import com.google.cast.ApplicationMetadata;
import com.google.cast.ApplicationSession;
import com.google.cast.CastContext;
import com.google.cast.CastDevice;
import com.google.cast.ContentMetadata;
import com.google.cast.MediaProtocolCommand;
import com.google.cast.MediaProtocolMessageStream;
import com.google.cast.MediaRouteAdapter;
import com.google.cast.MediaRouteHelper;
import com.google.cast.MediaRouteStateChangeListener;
import com.google.cast.MessageStream;
import com.google.cast.SessionError;

import android.app.Activity;
import android.app.Fragment;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.IntentFilter.MalformedMimeTypeException;
import android.net.Uri;
import android.nfc.NfcAdapter;
import android.nfc.NfcManager;
import android.nfc.Tag;
import android.nfc.tech.NfcF;
import android.os.Bundle;
import android.support.v4.app.FragmentActivity;
import android.support.v7.app.MediaRouteButton;
import android.support.v7.media.MediaRouteSelector;
import android.support.v7.media.MediaRouter;
import android.support.v7.media.MediaRouter.RouteInfo;
import android.text.Html;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

/***
 * An activity that once played a chosen sample video on a Cast device and exposes playback and volume
 * controls in the UI. - but now sends routes messages and URLs to a custom app on a Cast Device. 
 */
public class ChromeCatActivity extends Activity implements MediaRouteAdapter {

    private static final String TAG = ChromeCatActivity.class.getSimpleName();
    
    public static final boolean ENABLE_LOGV = true;

    private CastContext mCastContext = null;
    private CastDevice mSelectedDevice;

    private ApplicationSession mSession;
   
    private MediaRouteButton mMediaRouteButton;
    private MediaRouter mMediaRouter;
    private MediaRouteSelector mMediaRouteSelector;
    private MediaRouter.Callback mMediaRouterCallback;
    
    private SampleMediaRouteDialogFactory mDialogFactory;

	protected GPMessageStream mGPMessageStream;

	private Button msgButton;
	private Button urlButton;


    /**
     * Initializes MediaRouter information and prepares for Cast device detection upon creating
     * this activity.
     */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_cast_sample);

        mCastContext = new CastContext(getApplicationContext());
        mDialogFactory = new SampleMediaRouteDialogFactory();

        MediaRouteHelper.registerMinimalMediaRouteProvider(mCastContext, this);
        mMediaRouter = MediaRouter.getInstance(getApplicationContext());
        mMediaRouteSelector = MediaRouteHelper
                .buildMediaRouteSelector(MediaRouteHelper.CATEGORY_CAST,
                        getResources().getString(R.string.cast_api_key), null);

        mMediaRouteButton = (MediaRouteButton) findViewById(R.id.media_route_button);
        mMediaRouteButton.setRouteSelector(mMediaRouteSelector);
        mMediaRouteButton.setDialogFactory(mDialogFactory);
        mMediaRouterCallback = new MyMediaRouterCallback();
       
        msgButton = (Button) findViewById(R.id.msg_button);
        urlButton = (Button) findViewById(R.id.url_button);
        
        initButtons();

        Thread myThread = null;
        Runnable runnable = new StatusRunner();
        myThread = new Thread(runnable);
        logVIfEnabled(TAG, "Starting statusRunner thread");
        myThread.start();   
    }
    
    @Override
    public void onPause() {
        super.onPause();
    }

    
    @Override
    public void onResume() {
        super.onResume();
    }
    
	/**
     * Initializes all buttons by adding user controls and listeners.
     */
    public void initButtons() {
        msgButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
            	EditText input = (EditText) findViewById(R.id.msg_text);
            	String msg_text =  input.getText().toString();
                sendMessage("message", msg_text);
            }
        });
        
        urlButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
            	EditText input = (EditText) findViewById(R.id.url_text);
            	String msg_text =  input.getText().toString();
                sendMessage("url", msg_text);
            }
        });
    }

    protected void sendMessage(String msg_type, String msg_body) {
    	JSONObject js = new JSONObject();
    	try {
    		js.put("type", msg_type);
			js.put("body", msg_body);
		} catch (Exception e) {
			e.printStackTrace();
		}
    	if (mGPMessageStream != null) {
    		mGPMessageStream.sendMessage(js);
    	} else {
    		Context context = getApplicationContext();
    		CharSequence text = "Uh oh - not connected to a chromecast?";
    		int duration = Toast.LENGTH_SHORT;

    		Toast.makeText(context, text, duration).show();
    	}
	}



   
    public void onDeviceAvailable(CastDevice device, String myString,
            MediaRouteStateChangeListener listener) {
        mSelectedDevice = device;
        logVIfEnabled(TAG, "Available device found: " + myString);
        openSession();
    }

    @Override
    public void onSetVolume(double volume) {
    	Log.i(TAG, "set Volume... doesn't do anything");
    }

    @Override
    public void onUpdateVolume(double volumeChange) {
    	Log.i(TAG, "Update Volume... doesn't do anything");
    }

    @Override
    protected void onStart() {
        super.onStart();
        mMediaRouter.addCallback(mMediaRouteSelector, mMediaRouterCallback,
                MediaRouter.CALLBACK_FLAG_REQUEST_DISCOVERY);
        logVIfEnabled(TAG, "onStart called and callback added");
    }

    /**
     * Closes a running session upon destruction of this Activity.
     */
    @Override
    protected void onStop() {
        mMediaRouter.removeCallback(mMediaRouterCallback);
        super.onStop();
        logVIfEnabled(TAG, "onStop called and callback removed");
    }

    @Override
    protected void onDestroy() {
        logVIfEnabled(TAG, "onDestroy called, ending session if session exists");
        if (mSession != null) {
            try {
                if (!mSession.hasStopped()) {
                    mSession.endSession();
                }
            } catch (IOException e) {
                Log.e(TAG, "Failed to end session.");
            }
        }
        mSession = null;
        super.onDestroy();
    }

    /**
     * A callback class which listens for route select or unselect events and processes devices
     * and sessions accordingly.
     */   
    private class MyMediaRouterCallback extends MediaRouter.Callback {
        @Override
        public void onRouteSelected(MediaRouter router, RouteInfo route) {
            MediaRouteHelper.requestCastDeviceForRoute(route);
        }

        @Override
        public void onRouteUnselected(MediaRouter router, RouteInfo route) {
            try {
                if (mSession != null) {
                    logVIfEnabled(TAG, "Ending session and stopping application");
                    mSession.setStopApplicationWhenEnding(true);
                    mSession.endSession();
                } else {
                    Log.e(TAG, "onRouteUnselected: mSession is null");
                }
            } catch (IllegalStateException e) {
                Log.e(TAG, "onRouteUnselected:");
                e.printStackTrace();
            } catch (IOException e) {
                Log.e(TAG, "onRouteUnselected:");
                e.printStackTrace();
            }
            mGPMessageStream = null;
            mSelectedDevice = null;
        }
    }

    /**
     * Starts a new video playback session with the current CastContext and selected device.
     */
    private void openSession() {
        mSession = new ApplicationSession(mCastContext, mSelectedDevice);

        // TODO: The below lines allow you to specify either that your application uses the default
        // implementations of the Notification and Lock Screens, or that you will be using your own.
        int flags = 0;

        // Comment out the below line if you are not writing your own Notification Screen.
        // flags |= ApplicationSession.FLAG_DISABLE_NOTIFICATION;

        // Comment out the below line if you are not writing your own Lock Screen.
        // flags |= ApplicationSession.FLAG_DISABLE_LOCK_SCREEN_REMOTE_CONTROL;
        mSession.setApplicationOptions(flags);

        logVIfEnabled(TAG, "Beginning session with context: " + mCastContext);
        logVIfEnabled(TAG, "The session to begin: " + mSession);
        mSession.setListener(new com.google.cast.ApplicationSession.Listener() {

            @Override
            public void onSessionStarted(ApplicationMetadata appMetadata) {
                logVIfEnabled(TAG, "Getting channel after session start");
                ApplicationChannel channel = mSession.getChannel();
                if (channel == null) {
                    Log.e(TAG, "channel = null");
                    return;
                }
                Log.i(TAG, "Creating and attaching General Purpose Message Stream");
                mGPMessageStream = new GPMessageStream("e2e");
                channel.attachMessageStream(mGPMessageStream);
               
            }

            @Override
            public void onSessionStartFailed(SessionError error) {
                Log.e(TAG, "onStartFailed " + error);
            }

            @Override
            public void onSessionEnded(SessionError error) {
                Log.i(TAG, "onEnded " + error);
            }
        });

        try {
            logVIfEnabled(TAG, "Starting session with app name " + getString(R.string.cast_api_key));
            
            // TODO: To run your own copy of the receiver, you will need to set app_name in 
            // /res/strings.xml to your own appID, and then upload the provided receiver 
            // to the url that you whitelisted for your app.
            // The current value of app_name is "YOUR_APP_ID_HERE".
            mSession.startSession(getString(R.string.cast_api_key));
        } catch (IOException e) {
            Log.e(TAG, "Failed to open session", e);
        }
    }

    /**
     * Loads the stored media object and casts it to the currently selected device.
     */
    protected void loadMedia() {
//        logVIfEnabled(TAG, "Loading selected media on device");
//        mMetaData.setTitle(mMedia.getTitle());
//        try {
//            MediaProtocolCommand cmd = mMessageStream.loadMedia(mMedia.getUrl(), mMetaData, true);
//            cmd.setListener(new MediaProtocolCommand.Listener() {
//
//                @Override
//                public void onCompleted(MediaProtocolCommand mPCommand) {
//                    logVIfEnabled(TAG, "Load completed - starting playback");
//                    mPlayPauseButton.setImageResource(R.drawable.pause_button);
//                    mPlayButtonShowsPlay = false;
//                    onSetVolume(0.5);
//                }
//
//                @Override
//                public void onCancelled(MediaProtocolCommand mPCommand) {
//                    logVIfEnabled(TAG, "Load cancelled");
//                }
//            });
//
//        } catch (IllegalStateException e) {
//            Log.e(TAG, "Problem occurred with MediaProtocolCommand during loading", e);
//        } catch (IOException e) {
//            Log.e(TAG, "Problem opening MediaProtocolCommand during loading", e);
//        }
    }

    /**
     * Stores and attempts to load the passed piece of media.
     */
    protected void mediaSelected(CastMedia media) {
//        this.mMedia = media;
//        updateCurrentlyPlaying();
//        if (mMessageStream != null) {
//            loadMedia();
//        }
    }

    /**
     * Updates the status of the currently playing video in the dedicated message view.
     */
    public void updateStatus() {
        this.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    setMediaRouteButtonVisible();
                    //updateCurrentlyPlaying();

//                    if (mMessageStream != null) {
//                        mStatus = mMessageStream.requestStatus();
//
//                        String currentStatus = "Player State: "
//                                + mMessageStream.getPlayerState() + "\n";
//                        currentStatus += "Device " + mSelectedDevice.getFriendlyName() + "\n";
//                        currentStatus += "Title " + mMessageStream.getTitle() + "\n";
//                        currentStatus += "Current Position: "
//                                + mMessageStream.getStreamPosition() + "\n";
//                        currentStatus += "Duration: "
//                                + mMessageStream.getStreamDuration() + "\n";
//                        currentStatus += "Volume set at: "
//                                + (mMessageStream.getVolume() * 100) + "%\n";
//                        currentStatus += "requestStatus: " + mStatus.getType() + "\n";
//                        mStatusText.setText(currentStatus);
//                    } else {
//                        mStatusText.setText(getResources().getString(R.string.tap_icon));
//                    }
                } catch (Exception e) {
                    Log.e(TAG, "Status request failed: " + e);
                }
            }
        });
    }

    /**
     * Sets the Cast Device Selection button to visible or not, depending on the availability of
     * devices.
     */
    protected final void setMediaRouteButtonVisible() {
        mMediaRouteButton.setVisibility(
                mMediaRouter.isRouteAvailable(mMediaRouteSelector, 0) ? View.VISIBLE : View.GONE);
    }

    /**
     * Updates a view with the title of the currently playing media.
     */
    protected void updateCurrentlyPlaying() {
//        String playing = "";
//        if (mMedia.getTitle() != null) {
//            playing = "Media Selected: " + mMedia.getTitle();
//            if (mMessageStream != null) {
//                String colorString = "<br><font color=#0066FF>";
//                colorString += "Casting to " + mSelectedDevice.getFriendlyName();
//                colorString += "</font>";
//                playing += colorString;
//            }
//            mCurrentlyPlaying.setText(Html.fromHtml(playing));
//        } else {
//            String castString = "<font color=#FF0000>";
//            castString += getResources().getString(R.string.tap_to_select);
//            castString += "</font>";
//            mCurrentlyPlaying.setText(Html.fromHtml(castString));
//        }
    }

    /**
     * A Runnable class that updates a view to display status for the currently playing media.
     */
    private class StatusRunner implements Runnable {
        @Override
        public void run() {
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    updateStatus();
                    Thread.sleep(1500);
                } catch (Exception e) {
                    Log.e(TAG, "Thread interrupted: " + e);
                }
            }
        }
    }
    
    /**
     * Logs in verbose mode with the given tag and message, if the LOCAL_LOGV tag is set.
     */
    private void logVIfEnabled(String tag, String message){
        if(ENABLE_LOGV){
            Log.v(tag, message);
        }
    }
}
