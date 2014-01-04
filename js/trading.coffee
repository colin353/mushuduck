# This class handles the setup and so forth of the 
# trading stage.

class window.TradingStage extends Stage
	constructor: ->
		me = @

		@type = 'TradingStage'

		$('.tradingstage-interface').show()

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
						return $("<div class='square'></div>").css('background-color', player.products[ui.attr('data-production-type')].color)
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
					console.log 'moved to position: ', offset
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

		# Set up the trading window to show all of the appropriate things:
		$('.tradingstage-interface .trading span.tradecount').each ->
			$(@).html "<div class='square'></div> x <span class='count'>0</span>"
			type = $(@).attr('data-production-type')
			color = player.products[type].color
			$(@).children('.square').css('background-color',color)
			$(@).hide()

		# Allow for clearing of the trading panel
		$('.trading').on "taphold", ->
			me.clearTrades.call me

		super

	# The bump function is called when the accelerometer detects a big
	# change of acceleration. 
	bump: ->
		# Assemble a list of items for the trade and ship them off
		items = {}
		for name,p of @products
			if p.for_trade > 0
				items[name] = p.for_trade

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

		# Enter in the new data which was received during the trade.
		for name,amount of data.items
			if @products[name]?
				@products[name].for_trade = amount
				@products[name].needsRefresh.call @products[name]

		# Refresh everything in the trading panel.
		@refreshTradingPlatform()

	price_updated: ->
		for name,p of @products
			p.needsRefresh.call p

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
		if @product.amount > 0
			@product.amount -= 1
			me = @
			pycon.transaction {action: 'sell', data: { productToSell: @product.name } }, (data) ->
				player.giveGold data.pay
				me.needsRefresh.call me
			return yes
		else
			return no

	needsRefresh: ->
		# The two fields that require refreshing are:
		# 	1. The quantity of the product
		# 	2. The price of the product

		@dom_element.children('.amount').html @product.amount
		@dom_element.children('.price').html "$" + @product.price

