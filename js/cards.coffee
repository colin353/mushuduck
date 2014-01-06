
class window.Card
	constructor: ->
		yes

	activate: ->
		yes

	render: ->
		"""
			Invalid card!
		"""

class window.ConversionCard extends Card
	constructor: ->
		@title 		= "1-1 Conversion"
		@subtitle 	= "Convert a blueberry to a corn"
		@price 		= 20

		@item_to 	= 'corn'
		@item_from 	= 'blueberry'

		super

	render: ->
		# The image for a conversion card is: block -> block.
		"""
			<span style='color:#0E90D2'>&#9632;</span> &rarr; <span style='color:#FAD232'>&#9632;</span>
		"""

	activate: ->
		if player.products[@item_from].amount >= 1
			player.products[@item_from].amount -= 1
			player.products[@item_to].amount += 1
		
			window.stage.products_updated.call stage

class window.BlueberryPieCard extends Card
	constructor: ->
		@title 			= "Blueberry Pie"
		@subtitle		= "Convert blueberry + corn into 25 gold"
		@price 			= 50

		@items_from 	= [ 'corn', 'blueberry' ]
		@gold_reward  	= 25

	render: ->
		picture = "" 
		for name in @items_from
			picture += "<span style='color:#{player.products[name].color}'>&#9632;</span>"

		picture += "&rarr; $#{@gold_reward}"
		return picture

	activate: ->
		has_enough = true
		for name in @items_from
			if player.products[name].amount == 0
				has_enough = false

		if has_enough
			for name in @items_from
				player.products[name].amount -= 1
			player.giveGold 25

		window.stage.products_updated.call stage

class window.PizzaCard extends BlueberryPieCard
	constructor: ->
		@title 			= "Pizza"
		@subtitle		= "Convert tomato + corn into 25 gold"
		@price			= 50

		@items_from 	= ['corn', 'tomato']
		@gold_reward 	= 25

class window.CornocopiaCard extends BlueberryPieCard
	constructor: ->
		@title 			= "Cornucopia"
		@subtitle		= "Covert one of all four types into 100 gold"
		@price			= 100

		@items_from		= ['corn', 'tomato', 'blueberry', 'purple']
		@gold_reward 	= 100

class window.BlueberryJamCard extends Card
	constructor: ->
		@title 		= "Blueberry Jam"
		@subtitle 	= "You can sell blueberries for 25% more gold"
		@price 		= 50

	render: ->
		"""
			<p>Blueberry Jam</p>
		"""		

window.card_deck = []

card_deck.push window.BlueberryPieCard
card_deck.push window.BlueberryJamCard
card_deck.push window.CornocopiaCard
card_deck.push window.PizzaCard
card_deck.push window.ConversionCard