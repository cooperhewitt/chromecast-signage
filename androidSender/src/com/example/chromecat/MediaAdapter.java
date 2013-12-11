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

import java.util.ArrayList;
import java.util.List;

import com.example.castsample.R;

import android.app.Activity;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.TextView;

/**
 * A BaseAdapter containing a fixed set of CastMedia objects.
 */
public class MediaAdapter extends BaseAdapter {

    private Context mContext;
    private LayoutInflater mInflater;
    private List<CastMedia> mVideos;

    /**
     * Creates a new MediaAdapter for the given activity.
     */
    public MediaAdapter(Activity activity) {
        mContext = activity.getApplicationContext();
        mInflater = (LayoutInflater) activity.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        mVideos = new ArrayList<CastMedia>();
        addVideos();
    }
    
    /**
     * Adds some fixed set of video objects to this object's internal list.
     */
    private void addVideos() {
        mVideos.add(new CastMedia(mContext.getString(R.string.big_buck_bunny), "http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4"));
        mVideos.add(new CastMedia(mContext.getString(R.string.tears_of_steel), "http://commondatastorage.googleapis.com/gtv-videos-bucket/tears_of_steel_1080p.mp4"));
        mVideos.add(new CastMedia(mContext.getString(R.string.elephant_dreams), "http://commondatastorage.googleapis.com/gtv-videos-bucket/ED_1280.mp4"));
        mVideos.add(new CastMedia(mContext.getString(R.string.marnau_the_vamp), "http://commondatastorage.googleapis.com/gtv-videos-bucket/murnau_the_vampire_(2007)_oscar_alvarado%C2%B4s_480x200.mp4"));
        mVideos.add(new CastMedia(mContext.getString(R.string.project_london), "http://commondatastorage.googleapis.com/gtv-videos-bucket/project_london-_official_trailer_1280x720.mp4"));
        mVideos.add(new CastMedia(mContext.getString(R.string.reel_2012), "http://commondatastorage.googleapis.com/gtv-videos-bucket/reel_2012_1280x720.mp4"));
        mVideos.add(new CastMedia(mContext.getString(R.string.io_2012_countdown_music), "http://commondatastorage.googleapis.com/gtv-videos-bucket/Google%20IO%202011-%2030%20min%20Countdown.mp3"));
        mVideos.add(new CastMedia(mContext.getString(R.string.io_2011_walkout_music), "http://commondatastorage.googleapis.com/gtv-videos-bucket/Google%20IO%202011%2045%20Min%20Walk%20Out.mp3"));
    }

    @Override
    public int getCount() {
        return mVideos.size();
    }

    @Override
    public CastMedia getItem(int position) {
        return mVideos.get(position);
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        View view = convertView;
        CastVideoViewHolder viewHolder;

        if(view == null) {
            view = mInflater.inflate(R.layout.item_cast_media, null);
            viewHolder = new CastVideoViewHolder(view);
            view.setTag(viewHolder);
        } else {
            viewHolder = (CastVideoViewHolder) view.getTag();
        }
        viewHolder.setPosition(position);
        return view;
    }

    private class CastVideoViewHolder {
        private TextView mVideoTitle;

        public CastVideoViewHolder(View view) {
            mVideoTitle = (TextView) view.findViewById(R.id.item_cast_video_title_textview);
        }

        public void setPosition(int position) {
            mVideoTitle.setText(mVideos.get(position).getTitle());
        }
    }
}
