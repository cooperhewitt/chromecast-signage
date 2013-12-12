
			var set_url = function(url){

				if ((! url.match("^http")) && (! url.match("^https"))){
					url = 'http://' + url;
				}

				// need to capture refused to display in an iframe errors, as in:
			        // Refused to display 'https://www.google.com/' in a frame because it set 'X-Frame-Options' to 'SAMEORIGIN'.
			
				try {
					var iframe = document.getElementById("stuff");
					iframe.setAttribute("src", url);
				}

				catch(e){
					console.log(e);
					set_status(e);
				}
			};

			var set_status = function(msg){
				set_body('status', msg);
			};

			var set_current = function(){
				var dt = new Date();
				var time = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1"); // hh:mm:ss

				set_body('time', 'and the time is ' + time);
			};

			var set_body = function(id, body){
				var el = document.getElementById(id);
				el.innerHTML = body;
			}
			var set_weather = function(){

			    // figure out why this isn't working later (20131120/straup)

			    return;

				$(document).ready(function(){
					$.ajax({
					  url : "http://api.wunderground.com/api/' + wundeground_apikey + '/geolookup/conditions/q/NY/New_York.json",
					  dataType : "jsonp",
					  success : function(parsed_json){
						var location = parsed_json['location']['city'];
						var temp_f = parsed_json['current_observation']['temp_c'];
						set_body('weather', "Current temperature in " + location + " is " + temp_f + "C");
					  }
  				         });
				});		
			};

			var on_rcvd_message = function(evt) {

			    console.log(evt);

				var type = evt.message.type;
				var body = evt.message.body;

				if (type == 'url'){

					set_url(body);
					set_status(body);
				}

				else if (type == 'message'){
					set_status(body);
				}

				else if (type == 'object'){

				    	var object_id = body;
					var url = 'http://collection.cooperhewitt.org/objects/' + object_id;

					// var req = 'http://collection.cooperhewitt.org/oembed/photo?url=' + url;
					var req = 'http://www-2.collection.cooperhewitt.net/oembed/photo?url=' + url;

					var on_success = function(rsp){
					    var photo_url = rsp['url'];
					    var photo_title = rsp['title'];

					    set_url(photo_url);
					    set_status(photo_title);
					};

					$.ajax({
					    'url': req,
					    'success': on_success
					});
				}

				else if (type == 'wazzup'){

				}

				else {
				    console.log("Unexpected type: " + type);
				}
			};

			var receiver = new cast.receiver.Receiver(
			    config['chromecast_appid'],
				["e2e"],
			    "",
			    5);

			var channel_handler = new cast.receiver.ChannelHandler("e2e");
			channel_handler.addChannelFactory(receiver.createChannelFactory("e2e"));
			channel_handler.addEventListener(cast.receiver.Channel.EventType.MESSAGE, on_rcvd_message, false);
			receiver.start();

			window.addEventListener('load', function() {

				set_current();
				set_weather();

				setInterval(function(){
					set_current();
				}, 500);

				setInterval(function(){
					set_weather();
				}, 172000);
			});
