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
		#window.stage = new BiddingStage()
		#return false
		if stage? 
			window.stage.end()

		if data.stageType == 'Production'
			window.stage = new ProductionStage()
		else if data.stageType == 'Trading'
			window.stage = new TradingStage()
		else if data.stageType == 'Bidding'
			window.stage = new BiddingStage()
		else if data.stageType == 'Battle'
			window.stage = new BattleStage()
		else if data.stageType == 'Notification' or data.stageType == 'Title'
			window.stage = new NotificationStage()
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

	# Is it possible
	pycon.register_for_event 'DisplayMessage', (data) ->
		data.clickable = yes if !data.clickable?
		message.display.call message,data.title, data.text, data.clickable

	pycon.register_for_event 'InventoryCountRequested', (data) ->
		pycon.transaction {action: data.callback, data: player.getInventoryCount.call player }

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

	pycon.register_for_event 'NewBid', (data) ->
		window.stage.new_bid.call window.stage, data

	# Get money, get paid
	pycon.register_for_event 'GoldGranted', (data) ->
		player.giveGold data.amount

	pycon.register_for_event 'FamineBegin', (data) ->
		player.productionfacilities[data.productAffected].famine = yes
		#message.display.call message,'Oh no!', "A famine has begun on #{data.productAffected}"

	pycon.register_for_event 'FamineEnd', (data) ->
		player.productionfacilities[data.productAffected].famine = no

	# This event is triggered when a bid is won.
	pycon.register_for_event 'YouWon', (data) ->
		message.display 'Nice work!', 'You won the auction!'
		player.giveGold.call player, -data.winningBidAmount
		player.giveCard data.winningBidIndex

	pycon.register_for_event 'NewCard', (data) ->
		if window.stage.type == 'BiddingStage'
			stage.new_card.call stage, data.index

	updateStatusBar()