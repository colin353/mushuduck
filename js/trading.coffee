# This class handles the setup and so forth of the 
# trading stage.

class window.TradingStage extends Stage
	constructor: ->
		me = @

		@type = 'TradingStage'

		$('.tradingstage-interface').show()

		@timers = []

		# Register all of the trading products boxes. They are instances
		# of the class TradingProduct, which handles the visual behavior
		# of the trading boxes. They are connected to the player's set of
		# products.
		@products = {}
		$('.tradingstage-interface .box').each ->
			type = $(@).attr('data-production-type')
			me.products[type] = new TradingProduct( $(@), player.products[type] )

		# Create a sortable with the trading objects. This sortable is not actually sortable
		# (because when sorting completes, see the "stop" event, the thing is cancelled) but
		# when the sorting is over, if the player has moved the placeholder around the screen
		# then we consider that to be an action of either trading or selling.
		$('.tradingstage-interface .inventory').sortable { 
				# The helper is a pop-up that appears while you are dragging the product around
				# the screen. It is created when sorting starts and destroyed when sorting ends.
				helper: (e, ui) ->
					type = ui.attr('data-production-type')
					if me.products[type].product.amount <= 0 
						return $('<div></div>')
					else
						# Although the helper has class 'square', the size is forced by sortable to
						# match the size of the thing being sorted, which is in this case the trading product.
						return $("<div class='square placeholder'></div>").css('background-color', player.products[ui.attr('data-production-type')].color)
				,

				# This is called when sorting starts (i.e. somebody drags a trading product). 
				start: (e, ui) ->
					# It is necessary to show the trading product tile immediately because otherwise
					# it disappears, as per the default functionality of sortable.
					ui.item.show()
				,
				# This is called when sorting causes a re-ordering.
				change: ->
					# We don't want people to actually be able to sort the trading products, so I am 
					# just causing an instant refresh of the positions to keep them frozen.
					$(@).sortable "refreshPositions" 
				,
				# The placeholder is what sits in for the trading product (by default) when it is 
				# being moved around. But here, I am just filling it in as an un-used class.
				placeholder: 'test',
				# When sorting is finished (i.e. the user releases the tap, etc.) this is called.
				stop: (e,ui) ->
					# Where is the position of the thing? Look at the ending position and use that as a key
					offset = ui.originalPosition.top - ui.position.top 
					#console.log 'moved to position: ', offset
					# Find out which item we are actually moving
					item = me.products[ ui.item.attr('data-production-type') ]
					# Moving up corresponds to a "sell"
					if offset > 100
						item.sell.call item
					# Moving down corresponds to a "trade"
					else if offset < -100
						item.trade.call item
					# It is very important that we cancel the sort in order to prevent things
					# from getting re-ordered.
					$(@).sortable 'cancel'
		}
		
		player.giveCard 12
		@refreshCards()

		# Set up the trading window to show all of the appropriate things:
		$('.tradingstage-interface .trading span.tradecount').each ->
			$(@).html "<span class='block'>&#9632;</span> x <span class='count'>0</span>"
			type = $(@).attr('data-production-type')
			color = player.products[type].color
			$(@).children('.block').css('color',color)
			$(@).hide()

		# Allow for clearing of the trading panel
		$('.trading').on "taphold", ->
			me.clearTrades.call me

		$('.countdown').show()

		super

	end: ->
		$('.countdown').hide()
		$('.tradingstage-interface').hide()
		$('.trading').unbind()
		$('.card').unbind()
		$('.tradingstage-interface .inventory').sortable('destroy')
		if $('.placeholder').length > 0
			$('.placeholder').remove()
		@clearTrades()

		clearInterval interval for interval in @timers

		super

	# The bump function is called when the accelerometer detects a big
	# change of acceleration. 
	bump: ->
		# Assemble a list of items for the trade and ship them off
		items = {}
		for name,p of @products
			if p.for_trade > 0
				items[name] = p.for_trade

		items = card.on_trade_start.call(card,items) for card in player.cards

		pycon.transaction {action: 'bump', data: { items:items } }, ->
			yes

	# When somebody clears out the trading panel (for some reason) then
	# I'll refund whatever is in that panel to their list of things.
	clearTrades: ->
		for name,p of @products
			if p.for_trade > 0
				p.product.amount += p.for_trade
				p.for_trade = 0
				p.needsRefresh.call p

		@refreshTradingPlatform()

	# When a trade is finished (as judged by the server), it sends a message back
	# to pycon, which then calls this function. 
	trade_complete: (data) ->
		# Clear out what is in the trading panel right now.
		for name,p of @products
			p.for_trade = 0

		# Let the cards have a hay-day
		card.on_trade_end.call(card, data.items) for card in player.cards

		# Enter in the new data which was received during the trade.
		for name,amount of data.items
			if name == 'gold'
				player.giveGold amount
			else if @products[name]?
				@products[name].for_trade = amount
				@products[name].needsRefresh.call @products[name]

		# Refresh everything in the trading panel.
		@refreshTradingPlatform()

	price_updated: ->
		for name,p of @products
			p.needsRefresh.call p

	products_updated: ->
		@price_updated()

	# This is called whenever there is some stale data relating to the trading
	# panel. This function will update the trading panel to have the new data.
	refreshTradingPlatform: ->
		for name,p of @products
			if p.for_trade > 0
				# Only show things that have non-zero values.
				$(".tradingstage-interface .tradecount[data-production-type='#{name}']").show().children('.count').html p.for_trade
			else 
				# Hide trading products that are zero.
				$(".tradingstage-interface .tradecount[data-production-type='#{name}']").hide()

	yield_production: ->
		for name,p of @products
			facility = player.productionfacilities[name]
			facility.run_factory.call facility
			p.needsRefresh.call p

		card.on_production.call card for card in player.cards

	refreshCards: ->
		# Set up the power cards. First, clear out the deck:
		deck = $('.powerups .deck')
		deck.html ""
		# Now, for each card the player owns,
		index = 0
		for card in player.cards
			console.log 'Adding card: ', card
			# Add the card to the deck, using the render function, and register the tap
			# event to the "action" trigger on the card itself.
			element = $("<div class='card' data-card-index='#{index}'>#{card.render.call card}</div>").tap ->
				card = player.cards[$(@).attr('data-card-index')]
				card.activate.call card
			element.appendTo(deck)
			index += 1

		$('.tradingstage-interface .card').fitText(1, {minFontSize: '25px'})

	timer_begin: (countdown) ->
			me = @
			# Record the time in the countdown.
			@time = countdown 
			count_down = ->
				# Count down.
				stage.time -= 1 if stage.time > 0
				# Draw to the screen.
				updateCountdown()

			do_production = ->
				# We don't want to worry about timing if the stage isn't trading.
				me.yield_production.call me
			
			# Wait one second before starting so that everything lines up.
			@timers.push setInterval count_down,1000
			@timers.push setInterval do_production, window.config.production_period*1000
			updateCountdown()

class window.TradingProduct
	constructor: (@dom_element, @product) ->
		@product.getPrice()
		@needsRefresh()
		@for_trade = 0
		yes

	trade: ->
		if @product.amount > 0
			@for_trade += 1
			@product.amount -= 1
			@needsRefresh()
			stage.refreshTradingPlatform.call stage
			return yes
		else 
			return no

	sell: ->
		# Selling is illegal if we are out of turn.
		return if window.stage.type != 'TradingStage'

		if @product.amount > 0
			@product.amount -= 1
			me = @
			pycon.transaction {action: 'sell', data: { productToSell: @product.name } }, (data) ->
				card_bonus = 1
				card_bonus *= card.get_pay_bonus.call(card,me.product.name) for card in player.cards;
				player.giveGold Math.round( data.pay * card_bonus ,0)
				me.needsRefresh.call me
			return yes
		else
			return no

	needsRefresh: ->
		# The two fields that require refreshing are:
		# 	1. The quantity of the product
		# 	2. The price of the product
		@dom_element.children('.amount').html @product.amount
		@dom_element.children('.price').html @product.price + "#{window.config.gold}"