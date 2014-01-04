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
					$("<div class='square'></div>").css('background-color', player.products[ui.attr('data-production-type')].color)
				,
				start: (e, ui) ->
					ui.item.show()
				,
				change: ->
					$(@).sortable( "refreshPositions" );
				,
				placeholder: 'test',
				stop: (e,ui) ->
					$(@).sortable('cancel')
		}


class window.TradingProduct
	constructor: (@dom_element, @product) ->
		@product.getPrice()
		@needsRefresh()
		yes

	needsRefresh: ->
		# The two fields that require refreshing are:
		# 	1. The quantity of the product
		# 	2. The price of the product

		@dom_element.children('.amount').html @product.amount
		@dom_element.children('.price').html "$" + @product.price

