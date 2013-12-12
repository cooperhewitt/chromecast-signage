/*

  Things we've named:

  'displays' are monitors or chromecast devices
  'screens' are things that might be cast to a display

  'client' is this page - that is it a thing with a web browser that can load this page
  'sender' is the webpage running in Chrome with the Chromecast extension and is sending messages to the Chromecast device
  'broker' is a dumb little socket.io server that serves to relay messages between client(s) and the sender

  (The broker code is available in chromecast-signage:broker)

  A few things this assumes:

  The 'sender' and the 'broker' can talk to each other and the 'client(s)' and the 'broker' can talk to each other.
  Put another way the 'client(s)' and the 'sender' don't expect to know anything about each other. That's deliberate.
  It's also possibly overkill. I kind of don't think it is. The 'sender' is special and magic

*/

function client_init(){

    // Note:
    // 1) We are declaring a bunch of functions inline because... fast.
    // 2) There is running code at the bottom of this function.

    var socket;
    var screens;
    var displays;

    try {
	socket = io.connect(config['socketio_endpoint']);
    }
    
    catch (e){
	display_status("Oh no! Could not connect to signage controller, because " + e);
	return;
    }

    // Messages that we might receive from the socket.io broker.

    socket.on('displays', function(data){

	    // This is the thing that tells us what displays and screens are
	    // available to control. Until we get this message the page is basically
	    // blank. Or maybe not blank but useless...

	    if (data['action'] == 'send_details'){
		list_displays(data['displays']);
	    }

	    // These next two are just feedback handlers

	    else if (data['action'] == 'sent_message'){
		
		var display = data['display'];
		
		// var btn = $("#send-message-" + display);
		// btn.removeAttr("disabled");
		
		var input = $("#display-message-" + display);
		input.val("");
		
		display_feedback(display, "Yay, I sent a message to " + display + "!");
	    }
	    
	    else if (data['action'] == 'sent_screen'){
		
		var display = data['display'];
		
		// var btn = $("#send-screen-" + display);
		// btn.removeAttr("disabled");
		
		display_feedback(display, "Yay, I updated the screen on " + display + "!");
	    }
	    
	    else {
		console.log(data);
	    }

	});

    // General helper tools for displaying different kinds of feedback

    var display_status = function(msg){
	$("#status").html(htmlspecialchars(msg));
    };

    var display_feedback = function(display, msg){
	var feedback = $("#display-feedback-" + display);
	feedback.html(htmlspecialchars(msg));
    };

    // General helper tool for sending messages (and generating message IDs)

    var emit = function(ctx, msg){
	var uuid = generate_uuid();
	msg['message_id'] = uuid;
	// console.log(msg);
	
	socket.emit(ctx, msg);
	return uuid;
    };
    
    // Ask for a list of displays
    // Response comes back in display.send_detail and is handler by list_displays, below

    var setup_displays = function(){
	var msg_id = emit('displays', { 'action': 'get_details' });
    };
    
    // Build a list of available displays and the screens that we can send them

    var list_displays = function(details){
	
	var screens = details['screens'];
	var displays = details['displays'];
	var showing = details['showing'];
	
	for (i in displays){
	    var display = displays[i];
	    draw_display_control(display, showing[display], screens);
	}

	// Now we attach events to each one of those controllers:

	// Send a given screen to a display

	$("button.send_screen").click(function(){
		var btn = $(this);
		var display = btn.attr("data-display-id");

		var url = $("#display-screen-" + display);
		url = url.val();
		
		display_feedback(display, "send " + url + " to " + display);
		
		var msg_id = emit('displays', {'action': 'send_screen', 'display': display, 'screen': url });

		// See above inre: getting messages back from the sender/receiver (via the broker)
		// btn.attr("disabled", "disabled");
	    });
	
	// Send a blob of text to a display

	$("button.send_message").click(function(){
		var btn = $(this);
		var display = btn.attr("data-display-id");
		var msg = $("#display-message-" + display);
		msg = msg.val();
		
		if (msg == ''){
		    alert('YAHOO SAYS NO');
		    return;
		}
		
		display_feedback(display, "send '" + msg + "' to " + display);
		
		var msg_id = emit('displays', {'action': 'send_message', 'display': display, 'message': msg });

		// See above inre: getting messages back from the sender/receiver (via the broker)
		// btn.attr("disabled", "disabled");
	    });
	
    };

    // HTML...

    var draw_display_control = function(display, showing, screens){

	var cntl = '<div id="display-' + display + '" class="display">';
	cntl += '<h3>' + display + '</h3>';
	
	cntl += '<div>';
	cntl += '<select id="display-screen-' + display + '">';
	
	for (id in screens){
	    cntl += '<option value="' + id + '">' + id + '</option>';
	}
	
	cntl += '</select>';
	cntl += '<button class="send_screen" id="send-screen-' + display + '" data-display-id="' + display + '">SEND SCREEN</button>';
	cntl += '</div>';
	
	cntl += '<div>';
	cntl += '<input type="text" id="display-message-' + display + '" />';
	cntl += '<button class="send_message" id="send-message-' + display + '" data-display-id="' + display + '">SEND MESSAGE</button>';
	cntl += '</div>';
	
	cntl += '<div class="display-feedback" id="display-feedback-' + display + '"></div>';
	
	cntl += '</div>';
	
	$("#displays").append($(cntl));
    };

    // Hey look, running code.

    setup_displays();
}
