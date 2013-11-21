var socket;

var cast_receivers = [];
var cast_api;
var cv_activity;

var cast_app_id = chromecast_appid;	// set in globals.js

function sender_init(){

    try {
	socket = io.connect(socketio_server);
    }

    catch (e){
	console.log(e);
	return;
    }

    socket.on('relay', function(data){
	console.log(data);
    });
    
    socket.on('sender', function(data){

	console.log(data);
	var action = data['action'];

	// TO DO: reconcile 'actions' and 'types'

	if (action == 'message'){
	    var dt = new Date();
	    var time = dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();
	
	    var body = data['message'] + ' ' + time;
	    send_message_to_cc({'type': 'message', 'body': body});
	}

	else if (action == 'url'){
	
	    var body = data['message'];
	    send_message_to_cc({'type': 'url', 'body': body});
	}

	else if (action == 'displays'){

	}

	else {
	    console.log("Unexpected action: " + action);
	}

    });

}
    
var msg_rcvd_callback=function(data){
    console.log("sender callback");
    console.log(data);
    send_message_to_cc(data.cmd);
};

if (window.cast && window.cast.isAvailable){
    // Cast is known to be available
    console.log("cast api available");
    initializeApi();
} else {
    console.log("cast api not available, adding listener for hello message");
    // Wait for API to post a message to us
    window.addEventListener("message", function(event) {
	if (event.source == window && event.data && 
	    event.data.source == "CastApi" &&
	    event.data.event == "Hello") {
	    initialize_cast_api();
	}
    });
};

initialize_cast_api = function() {
    cast_api = new cast.Api();
    cast_api.addReceiverListener(cast_app_id, on_receiver_list);
};

on_receiver_list = function(receivers) {

    cast_receivers = [];

    if(receivers.length == 0) {
	return;
    }

    for (var i=0;i<receivers.length;i++) {

	cast_receivers.push(receivers[i]);

	console.log(receivers[i]);
	console.log("status...");
	console.log(cast.ActivityStatus(cast_app_id));
	var launch_request = new cast.LaunchRequest(cast_app_id, receivers[i]);
	launch_request.parameters = '';
	cast_api.launch(launch_request, on_launch);
    }

    console.log(cast_receivers);
};

on_launch = function(activity) {
    if (activity.status == "running") {
	cv_activity = activity;
	// update UI to reflect that the receiver has received the
	// launch command and should start video playback.
	console.log("receiver has received launch command");
	console.log(activity);
	window.setTimeout(function() {
	    send_message_to_cc({'type': "message", 'body': 'ready'});
	}, 500);
	
    } else if (activity.status == "error") {
	cv_activity = null;
	console.log("receiver error on launch command");
    }
    
};

send_message_to_cc = function(msg){
    
    cast_api.sendMessage(
	cv_activity.activityId,
	"e2e",
	msg,
	on_msg_rcvd_by_cc
    );

    
};

on_msg_rcvd_by_cc = function(status_msg){
    
    if (status_msg){
	console.log(status_msg);
    }
}

function sendme(){
    
    var u = document.getElementById("url");
    u = u.value;
    send_message_to_cc({'type': 'url', 'body': u});
    return false;
}

function send_message(){
    
    var u = document.getElementById("msg");
    u = u.value;
    send_message_to_cc({'type': 'message', 'body': u});
    return false;
}
