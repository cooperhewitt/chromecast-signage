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

package com.example.castsample.mediaroutedialog;

import android.content.Context;
import android.os.Bundle;
import android.support.v7.app.MediaRouteControllerDialog;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
import com.example.castsample.R;
import com.example.chromecat.ChromeCatActivity;

/**
 * A sample class which demonstrates handling of basic playback controls. Note that this dialog
 * must be created within a CastSampleActivity.
 */
public class SampleMediaRouteControllerDialog extends MediaRouteControllerDialog
        implements View.OnClickListener {

    private static final String TAG = SampleMediaRouteControllerDialog.class.getSimpleName();
    private static final int SEEK_FORWARD = 1;
    private static final int SEEK_BACK = 2;
    
    private ChromeCatActivity mActivity;
    private Button mBackButton;
    private Button mMuteButton;
    private Button mForwardButton;

    /**
     * Creates a new SampleMediaRouteControllerDialog in the given context.
     */
    public SampleMediaRouteControllerDialog(Context context) {
        super(context);
    }

    /**
     * Initializes this dialog's set of playback buttons and adds click listeners.
     */
    @Override
    public View onCreateMediaControlView(Bundle savedInstanceState) {
        LayoutInflater inflater = getLayoutInflater();
        View controls = inflater.inflate(R.layout.sample_media_route_controller_controls_dialog,
                null);
        mBackButton = (Button) controls.findViewById(R.id.skip_back_button);
        mBackButton.setOnClickListener(this);
        mMuteButton = (Button) controls.findViewById(R.id.mute_button);
        mMuteButton.setOnClickListener(this);
        mForwardButton = (Button) controls.findViewById(R.id.skip_forward_button);
        mForwardButton.setOnClickListener(this);

        mActivity = (ChromeCatActivity) getOwnerActivity();
        return controls;
    }

	@Override
	public void onClick(View view) {
		// TODO Auto-generated method stub
	}

}
