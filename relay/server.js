var io = require('socket.io').listen(9999);

/*
         'displays' are monitors or chromecast devices
	 'screens' are things that might be cast to a display
*/

io.sockets.on('connection', function (socket){

	var screens_get_screens = function(){

		return {
		    "museum hours": "http://collection.cooperhewitt.org/about/",
		    "upcoming events": "http://www.aaronland.info/",
		    "subway schedule": "http://news.bbc.co.uk",
		};
	};

    	// TO DO: make me not shit...

	var display_get_screen = function(display){
		return "foo";	    
	};

	var displays_get_displays = function(){

		return [
			'dropmire',
			'mauipinwale'
		];
	};

	var displays_get_details = function(callback){

		var details = {};

		details['screens'] = screens_get_screens();
		details['displays'] = displays_get_displays();
		details['showing'] = {}
	    
		for (var i in details['displays']){

			var display = details['displays'][i];
			var screen = display_get_screen(display);

			details['showing'][display] = screen;
		}

		if (callback){
			callback(details);
		}
	};

	socket.on('displays', function (data){

		var action = data['action'];

		if (action == 'get_details'){

			var callback = function(displays){
				socket.emit('displays', { 'action': 'send_details', 'displays': displays });
			};
		    	
	  		var displays = displays_get_details(callback);
		}

		else if (action == 'send_message'){

			var display = data['display'];
			var msg = data['message'];
			console.log("SEND " + msg + " TO " + display);

			var callback = function(display){
			        broadcast('pew pew', {'message': msg});
				socket.emit('displays', {'action': 'sent_message', 'display': display});
			};
	
			callback(display);
		}

		else if (action == 'send_screen'){

			var screens = screens_get_screens();

			var display = data['display'];
			var screen = data['screen'];

			var url = screens[screen];

			console.log("SEND SCREEN " + screen + " WITH URL " + url + " TO " + display);

			var callback = function(display){

			        broadcast('pew pew pew', {'message': url});
				socket.emit('displays', {'action': 'sent_screen', 'display': display});
			};

			callback(display);
		}

		else {
			console.log(data);
		}
	});

	socket.on('screens', function (data){

		var action = data['action'];

		if (action == 'get_list'){
			socket.emit('screens', {'action': 'send_list', 'screens': [] });
		}

	});

	// http://stackoverflow.com/questions/7352164/update-all-clients-using-socket-io

    	var broadcast = function(ctx, details){
	    // io.sockets.emit(ctx, details);
	    socket.broadcast.emit(ctx, details);
	};
});
