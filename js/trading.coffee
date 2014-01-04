# This class handles the setup and so forth of the 
# trading stage.

class window.TradingStage extends Stage
	constructor: ->
		me = @

		@type = 'TradingStage'

		$('.tradingstage-interface').show()

		# Register all of the trading products boxes
		@products = {}

		$('.tradingstage-interface .box').each ->
			type = $(@).attr('data-production-type')
			me.products[type] = new TradingProduct( $(@), player.products[type] )


		# Create a sortable with the trading objects
		$('.tradingstage-interface .inventory').sortable { 
				helper: (e, ui) ->
					type = ui.attr('data-production-type')
					if me.products[type].product.amount <= 0 
						return $('<div></div>')
					else
						return $("<div class='square'></div>").css('background-color', player.products[ui.attr('data-production-type')].color)
				,

				start: (e, ui) ->
					ui.item.show()
				,
				connectWith: '.trade',
				change: ->
					$(@).sortable "refreshPositions" 
				,
				placeholder: 'test',
				stop: (e,ui) ->
					# Where is the position of the thing? Look at the ending position and use that as a key
					offset = ui.originalPosition.top - ui.position.top 
					console.log 'moved to position: ', offset
					item = me.products[ ui.item.attr('data-production-type') ]
					if offset > 100
						item.sell.call item
					else if offset < -100
						item.trade.call item
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
			console.log 'tapped and held'
			me.clearTrades.call me

	# The bump function is called when the accelerometer detects a big
	# change of acceleration. 
	bump: ->
		# Assemble a list of items for the trade and ship them off
		items = {}
		for name,p of @products
			if p.for_trade > 0
				items.name = p.for_trade

		pycon.transaction {action: 'bump', items:items }, ->
			yes

	clearTrades: ->
		for name,p of @products
			if p.for_trade > 0
				p.product.amount += p.for_trade
				p.for_trade = 0
				p.needsRefresh.call p

		@refreshTradingPlatform()

	trade_complete: (data) ->
		# Clear out what is in there right now
		for name,p of @products
			p.for_trade = 0

		# Enter in the new data
		for name,amount of data.items
			if @products[name]?
				@products[name].for_trade = amount
				@products[name].needsRefresh.call @products[name]

		# Refresh everything.
		@refreshTradingPlatform()

	refreshTradingPlatform: ->
		for name,p of @products
			console.log 'Refreshing trading platform for ',p.product.name 
			if p.for_trade > 0
				$(".tradingstage-interface .tradecount[data-production-type='#{name}']").show().children('.count').html p.for_trade
			else 
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
			player.giveGold @product.price
			@needsRefresh()
			return yes
		else
			return no

	needsRefresh: ->
		# The two fields that require refreshing are:
		# 	1. The quantity of the product
		# 	2. The price of the product

		@dom_element.children('.amount').html @product.amount
		@dom_element.children('.price').html "$" + @product.price

