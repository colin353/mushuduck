# Configuration parameters:
# -------------------------------------- #
window.config = []
window.config.websocket_url = "ws://192.168.0.106:8888/json"
window.config.server_version = 0
# -------------------------------------- #`

$ ->
 	# First step: connect to the specified WebSocket
 	# server.

 	window.socket = new WebSocket( window.config.websocket_url )
 	# Get ready for when the socket opens
 	window.jevent 'SocketOpened', ->
		console.log 'The socket was opened.'

 	# This function is called only when the socket is opened. 
 	socket.onopen = ->
 		console.log "Socket connection opened successfully."
 		window.pycon = new PyAPI window.socket

 		window.go()

 	

 	# Since the socket should never close, this is always unexpected.
 	socket.onclose = ->
 		console.log "Socket connection was closed, unexpectedly."
 		alert "I don't know why, but the socket was closed (!)"

# When everything is loaded and ready to go, this function is called.
window.go = ->
	# Start in the production stage
	window.stage = window.productionstage = new ProductionStage()

	pycon.register_for_event 'playerCountChanged', (data) ->
		console.log 'Player count changed: ', data
		$('.playercount').html data.count 

	pycon.register_for_event 'stageBegin', (data) ->
		window.stage.end()
		if data.stageType == 'Production'
			window.stage = new ProductionStage()
		else if data.stageType == 'Trading'
			window.stage = new TradingStage()
		else
			throw 'illegal :('
