# Configuration parameters:
# they are now pulled from a configuration.json file.
# -------------------------------------- #

window.config = $.ajax({
    type: "GET",
    url: "/configuration.json",
    async: false
}).responseText

try 
	window.config = JSON.parse window.config
catch error
	throw "Configuration loaded from 'configuration.json' is invalid."

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
	# When the player count changes we need to update the status bar.
	pycon.register_for_event 'playerCountChanged', (data) ->
		console.log 'Player count changed: ', data
		$('.playercount').html data.count 

	# When the program starts, the server will issue a "stageBegin" to me
	# to indicate the current stage. Here's where I register for that.
	pycon.register_for_event 'stageBegin', (data) ->
		if stage? 
			window.stage.end()

		if data.stageType == 'Production'
			window.stage = new ProductionStage()
		else if data.stageType == 'Trading'
			window.stage = new TradingStage()
		else
			throw 'illegal :('

	# When a trade is found to be completed with somebody, then we
	# need to inform the current stage so that it can do what it likes
	# with that information.
	pycon.register_for_event 'TradeCompleted', (data) ->
		if stage?
			window.stage.trade_complete.call stage,data
		else 
			console.log 'Received illegal trade...?'

	# When the prices are updated by the server (for any spontaneous reason)
	# then this function is called. We update the prices immediately in the
	# data object and then inform the current stage so it can do whatever it needs
	# to do about it.
	pycon.register_for_event 'PriceUpdated', (data) ->
		# Update the current prices in the data object
		for name,price of data.prices
			player.products[name].price = price if player.products[name]?
		# Inform the stage that it should act
		window.stage.price_updated.call stage

	# Begin the timer? We just pass this directly into the stage.
	pycon.register_for_event 'TimerBegin', (data) ->
		console.log 'Event handled: ',stage
		window.stage.timer_begin.call window.stage, data.duration

	updateStatusBar()