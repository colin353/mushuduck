
class window.Card
	constructor: ->
		yes

	activate: ->
		yes

	get_pay_bonus: ->
		return 1.0

	render: ->
		"""
			Invalid card!
		"""

class window.P_CB_ConversionCard extends Card
	constructor: ->
		@title 		= "Purple Pie"
		@subtitle 	= "Convert three purple to a corn and a blueberry"
		@price 		= 20

		@items_from 	= {purple:3}
		@items_to 		= {corn:1, blueberry:1}

	render: ->

		picture = "" 
		for name,number of @items_from
			for i in [1..number] 
				picture += "<span style='color:#{player.products[name].color}'>&#9632;</span>"
		picture += "&rarr;"

		for name,number of @items_to
			for i in [1..number]
				picture += "<span style='color:#{player.products[name].color}'>&#9632;</span>"
		return picture

	activate: ->
		has_enough = true
		for name,number of @items_from
			has_enough = false if player.products[name].amount < number

		if has_enough
			for name,number of @items_from
				player.products[name].amount -= number

			for name,number of @items_to
				player.products[name].amount += number

			window.stage.products_updated.call stage
			return yes
		else
			return false

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

		picture += "&rarr; #{@gold_reward}#{window.config.gold}"
		return picture

	activate: ->
		has_enough = true
		for name in @items_from
			if player.products[name].amount == 0
				has_enough = false

		if has_enough
			for name in @items_from
				player.products[name].amount -= 1
			player.giveGold @gold_reward

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
		@gold_reward 	= 200

class window.BlueberryJamCard extends Card
	constructor: ->
		@title 			= "Blueberry Jam"
		@subtitle 		= "You can sell blueberries for 25% more gold"
		@price 			= 50
		@price_modifier = {blueberry: 1.25}

	get_pay_bonus: (type) ->
		if @price_modifier[type]?
			return @price_modifier[type]

	render: ->
		"""
			<p>Blueberry Jam</p>
		"""		

class window.BlueberryIceCream extends BlueberryJamCard
	constructor: ->
		@title 			= "Blueberry Icecream"
		@subtitle 		= "You can sell blueberries for 50% more gold"
		@price 			= 100
		@price_modifier = {blueberry: 1.5}

	render: ->
		"""
			<p>Blueberry Icecream</p>
		"""		

class window.P_BT_ConversionCard extends P_CB_ConversionCard
	constructor: ->
		super
		@title 		= "Eggplant"
		@subtitle 	= "Convert three purple to a tomato and a blueberry"
		@price 		= 20

		@items_from 	= {purple:3}
		@items_to 		= {blueberry:1, tomato:1}
		

class window.P_T_ConversionCard extends P_CB_ConversionCard
	constructor: ->
		super
		@title 		= "Pomato"
		@subtitle 	= "Convert two purple to a tomato"
		@price 		= 20

		@items_from 	= {purple:2}
		@items_to 		= {tomato:1}
		

class window.P_B_ConversionCard extends P_CB_ConversionCard
	constructor: ->
		super
		@title 		= "Purpleberry"
		@subtitle 	= "Convert two purple to a blueberry"
		@price 		= 20

		@items_from 	= {purple:2}
		@items_to 		= {blueberry:1}
		

window.card_deck = []

card_deck.push window.BlueberryPieCard
card_deck.push window.BlueberryJamCard
card_deck.push window.CornocopiaCard
card_deck.push window.PizzaCard
card_deck.push window.P_CB_ConversionCard
card_deck.push window.P_B_ConversionCard
card_deck.push window.P_T_ConversionCard
card_deck.push window.P_BT_ConversionCard
card_deck.push window.BlueberryIceCream

# More cards:
# Quantum Fluctuation: you have a small chance of getting extra stuff each production cycle
# GM Corn:	production scales with number of corns
# Tomato War: causes tomato wars
# Tomato Bomb: kills off the stocks of other people
# Blueberry freeze: freeze the price of blueberries for 10 seconds (per round)
# Corn The Movie: royalties for every corn trade, up to 10 trades 
# Famine(s)