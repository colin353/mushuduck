# This class handles the setup and so forth of the 
# trading stage.

class window.TradingStage 
	constructor: ->
		me = @

		$('.tradingstage-interface').show()

		# Register all of the trading products boxes
		@products = []

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
		}

		# Set up the trading window to show all of the appropriate things:
		$('.tradingstage-interface .trading .span.tradecount').each ->
			$(@).html "<div class='square'></div> x <span class='count'>0</span>"
			type = $(@).attr('data-production-type')
			color = player.products[type].color
			$(@).children('.square').css('background-color',color)
			$(@).hide()

	refreshTradingPlatform: ->
		for p in @products
			if p.for_trade > 0
				$(".tradingstage-interface .tradecount[data-production-type='#{p.product.name}']").show()

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
		console.log 'Sale conducted: '
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

