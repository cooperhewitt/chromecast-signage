
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
				var time = dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();

				set_body('time', 'and the time is ' + time);
			};

			var set_body = function(id, body){
				var el = document.getElementById(id);
				el.innerHTML = body;
			}
			var set_weather = function(){

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

				var type = evt.message.type;
				var body = evt.message.body;

				if (type == 'url'){

					set_url(body);
					set_status(body);
				}

				else if (type == 'message'){
					set_status(body);
				}

				else if (type == 'wazzup'){

				}

				else {}
			};

			var receiver = new cast.receiver.Receiver(
			    chromecast_app_id,
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
