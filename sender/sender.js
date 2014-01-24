var socket;

var cast_receivers = {};
var cast_api;

function getChromecastAppId() {
    return config['chromecast_appid'];
}

function sender_init(){

    // TO DO: throw better errors
    try {
        var endpoint = 'http://' + config['socketio_host'] + ':' + config['socketio_port'];
        socket = io.connect(endpoint);
    } catch (e) {
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
        if (action == 'message') {
            var time = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1"); // hh:mm:ss
            var body = data['message'] + ' ' + time;
            var receiver = cast_receivers[data['receiver']];
            console.log(receiver.activity_id);
            send_message_to_cc({'type': 'message', 'body': body}, receiver.activity_id);
        } else if (action == 'url') {
            var body = data['message'];
            var receiver = cast_receivers[data['receiver']];
            send_message_to_cc({'type': 'url', 'body': body}, receiver.activity_id);
        } else if (action == 'get_receivers') {
            // TODO: return list of receivers
        } else {
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
    cast_api.addReceiverListener(getChromecastAppId(), on_receiver_list);
};

on_receiver_list = function(receivers) {
    if (receivers.length == 0) {
        return;
    }

    for (var i = 0; i < receivers.length; i++) {
        receiver = receivers[i];
        console.log(receiver);
        cast_receivers[receiver.name] = receiver;
        var launch_request = new cast.LaunchRequest(getChromecastAppId(), receiver);
        launch_request.parameters = '';
        cast_api.launch(launch_request, on_launch(receiver));
    }
};

on_launch = function(receiver) {
    return function(activity) {
        if (activity.status == "running") {
            cast_receivers[receiver.name]['activity_id'] = activity.activityId;
            // update UI to reflect that the receiver has received the
            // launch command and should start video playback.
            console.log("receiver has received launch command");
            window.setTimeout(function() {
                send_message_to_cc({'type': "message", 'body': 'ready'}, activity.activityId);
            }, 500);

        } else if (activity.status == "error") {
            cast_receivers[receiver.name]['activity_id'] = null;
            console.log("receiver error on launch command");
        }
    }
};

send_message_to_cc = function(msg, activity_id){
    cast_api.sendMessage(
        activity_id,
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
    // send to all chromecast receivers
    for (var i in cast_receivers) {
        send_message_to_cc({'type': 'url', 'body': u}, cast_receivers[i]['activity_id']);
    }
    return false;
}

function send_message(){
    var u = document.getElementById("msg");
    u = u.value;
    for (var i in cast_receivers) {
        send_message_to_cc({'type': 'message', 'body': u}, cast_receivers[i]['activity_id']);
    }
    return false;
}
