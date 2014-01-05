
class window.Card
	constructor: ->
		yes

	activate: ->
		yes

class window.ConversionCard extends window.Card
	constructor: (@item_from, @from_number, @item_to, @to_number) ->
		super

	activate: ->
		if player.products[@item_from].amount > @from_number
			player.products[@item_from].amount -= @from_number
			player.products[@item_to].amount += @to_number
		
			window.stage.products_updated.call stage 