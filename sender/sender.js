var socket;

var cast_receivers = [];
var cast_api;
var cv_activity;

function sender_init(){

    // TO DO: throw better errors

    try {
	var endpoint = 'http://' + config['socketio_host'] + ':' + config['socketio_port'];
	socket = io.connect(endpoint);
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
	    var time = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1"); // hh:mm:ss
	
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
    cast_api.addReceiverListener(config['chromecast_appid'], on_receiver_list);
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
	console.log(cast.ActivityStatus(config['chromecast_appid']));
	var launch_request = new cast.LaunchRequest(config['chromecast_appid'], receivers[i]);
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
