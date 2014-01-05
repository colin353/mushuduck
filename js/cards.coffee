
class window.Card
	constructor: ->
		yes

	activate: ->
		yes

class window.ConversionCard extends window.Card
	constructor: ->
		@title 		= "1-1 Conversion"
		@subtitle 	= "Convert a blah to a wah"
		@price 		= 20

		super

	activate: ->
		if player.products[@item_from].amount > @from_number
			player.products[@item_from].amount -= @from_number
			player.products[@item_to].amount += @to_number
		
			window.stage.products_updated.call stage

class window.BlueberryJamCard extends window.Card
	constructor: ->
		@title 		= "Blueberry Jam"
		@subtitle 	= "You can sell blueberries for 25% more gold"
		@price 		= 50

window.card_deck = []

card_deck.push window.ConversionCard
card_deck.push window.BlueberryJamCard