do-broker:
	node ./broker/server.js

build:

	cp ./shared/config.js.example ./shared/config.js

	# http://stackoverflow.com/questions/5171901/sed-command-find-and-replace-in-file-and-overwrite-file-doesnt-work-it-empties
	# TO DO: defaults for SOCKETIO_HOST and SOCKETIO_PORT

	sed -e 's/CONFIG_CHROMECAST_APPID/${CHROMECAST_APPID}/' ./shared/config.js > ./shared/config.js.tmp && mv ./shared/config.js.tmp ./shared/config.js
	sed -e 's/CONFIG_SOCKETIO_HOST/${SOCKETIO_HOST}/' ./shared/config.js > ./shared/config.js.tmp && mv ./shared/config.js.tmp ./shared/config.js
	sed -e 's/CONFIG_SOCKETIO_PORT/${SOCKETIO_PORT}/' ./shared/config.js > ./shared/config.js.tmp && mv ./shared/config.js.tmp ./shared/config.js

	cp ./shared/config.js ./client/config.js
	cp ./shared/socket.io.js ./client/socket.io.js
	cp ./shared/jquery-2.0.3.min.js ./client/jquery-2.0.3.min.js

	cp ./shared/config.js ./sender/config.js
	cp ./shared/socket.io.js ./sender/socket.io.js
	cp ./shared/jquery-2.0.3.min.js ./sender/jquery-2.0.3.min.js

	cp ./shared/config.js ./receiver/config.js
	cp ./shared/jquery-2.0.3.min.js ./receiver/jquery-2.0.3.min.js



