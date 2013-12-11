package com.example.chromecat;

import java.io.IOException;

import org.json.JSONObject;

import android.util.Log;

import com.google.cast.MessageStream;

public class GPMessageStream extends MessageStream {
    public static final boolean ENABLE_LOGV = true;
	
    public GPMessageStream(String namespace) throws IllegalArgumentException {
		super(namespace);
		// TODO Auto-generated constructor stub
	}

    @Override
    public void sendMessage(JSONObject message) {
    	//Sends a message down the channel. Any override of this method must call super.sendMessage().
    	try {
			super.sendMessage(message);
		} catch (IllegalStateException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    }
    
    
	@Override
	public void onMessageReceived(JSONObject arg0) {
		// TODO Auto-generated method stub
		logVIfEnabled("GPMessageStream", "Hey! GPMessageStream recieved a message!");
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
