
class window.Card
	constructor: ->
		yes

	activate: ->
		yes

	get_pay_bonus: ->
		return 1.0

	on_production: ->
		yes

	on_factory: ->
		yes

	destroy: ->
		for i in [0..(player.cards.length-1)] 
			if @ == player.cards[i]
				player.cards.splice i,1
				window.stage.refreshCards() if stage.refreshCards?
				break

	on_trade_start: (items_to_trade) ->
		return items_to_trade

	on_trade_end: (items_received) ->
		yes

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
		
class window.QuantumFluctuationCard extends Card
	constructor: ->
		super
		@title 		= "Quantum Fluctuation"
		@subtitle	= "Creates a chance for a random fruit to appear"
		@price 		= 50
		@amplitude	= 0.20

	render: ->
		"""
			<p>Quantum Fluctuation</p>
		"""	

	on_production: ->
		# There is a small chance (~amplitude) that
		# the player will receive a random, extra item.
		if Math.random() < @amplitude
			fruits = []
			fruits.push name for name,p of player.products
			index = Math.floor(Math.random() * fruits.length)
			fruit = fruits[index]
			player.products[fruit].amount += 1
			console.log 'A quantum fluctuation has occurred! ', fruit

class window.GMCornCard extends Card 
	constructor: ->
		super
		@title 		= "Genetically modified corn"
		@subtitle	= "Production of all fruits increases with the amount of corn you have."
		@price 		= 50
		@yield_per	= 10

	render: ->
		"""
			<p>GM Corn</p>
		"""		

	on_factory: (factory) ->
		if player.products['corn'].amount > @yield_per
			factory.product.amount += 1
			console.log 'Experienced boost: thanks to GM Corn!'

class window.TomatoWarCard extends Card 
	constructor: ->
		super
		@title 		= "Tomato War"
		@subtitle	= "The person with the most tomatoes wins a lot of money at the end of the round."
		@price 		= 20

	render: ->
		"""
			<p>Tomato War</p>
		"""		

	activate: ->
		pycon.transaction { action:"tomatoWarCardActivated" }
		@destroy()

class window.CornTheMovieCard extends Card
	constructor: ->
		super
		@title 		= "Corn: The Movie"
		@subtitle	= "All of your trades involving corn will give both players gold."
		@price 		= 20

		@primary_reward 	= 15
		@secondary_reward 	= 5
		@max_trades = 10

		@give_gold = no

	render: ->
		"""
			<p>Corn Movie</p>
		"""	

	on_trade_end: (items_received) ->
		player.giveGold @primary_reward if @give_gold
		@max_trades -= 1
		if @max_trades == 0
				@destroy()

	on_trade_start: (items_to_trade) ->
		if items_to_trade['corn']? && items_to_trade['corn'] > 0
			@give_gold = yes
			items_to_trade['gold'] = 0 if !items_to_trade['gold']?
			items_to_trade['gold'] += @secondary_reward 
			console.log 'Corn: The Movie royalties paid'

		return items_to_trade

class window.CornFamine extends Card
	constructor: ->
		super
		@title 		= "Corn Famine"
		@subtitle	= "All corn production will be reduced for one round."
		@price  	= 75
		@product 	= 'corn'

	render: ->
		"""
			<p>A #{@product} famine</p>
		"""	

	activate: ->
		pycon.transaction { action: 'famineActivated', data: { productAffected:@product } }
		@destroy()

class window.BlueberryFamine extends CornFamine
	constructor: ->
		super
		@title 		= "Blueberry Famine"
		@subtitle	= "All blueberry production will be reduced for one round."
		@price 		= 75
		@product 	= 'blueberry'

class window.PurpleFamine extends CornFamine
	constructor: ->
		super
		@title 		= "Purple Famine"
		@subtitle	= "All purple production will be reduced for one round."
		@price 		= 75
		@product 	= 'purple'

class window.TomatoFamine extends CornFamine
	constructor: ->
		super
		@title 		= "Tomato Famine"
		@subtitle	= "All tomato production will be reduced for one round."
		@price 		= 75
		@product 	= 'tomato'

class window.CornTheMovieCard extends Card
	constructor: ->
		super
		@title 		= "Corn: The Movie"
		@subtitle	= "All of your trades involving corn will give both players gold."
		@price 		= 20

		@primary_reward 	= 15
		@secondary_reward 	= 5
		@max_trades = 10

		@give_gold = no

	render: ->
		"""
			<p>Corn Movie</p>
		"""	

	on_trade_end: (items_received) ->
		player.giveGold @primary_reward if @give_gold
		@max_trades -= 1
		if @max_trades == 0
				@destroy()

	on_trade_start: (items_to_trade) ->
		if items_to_trade['corn']? && items_to_trade['corn'] > 0
			@give_gold = yes
			items_to_trade['gold'] = 0 if !items_to_trade['gold']?
			items_to_trade['gold'] += @secondary_reward 
			console.log 'Corn: The Movie royalties paid'

		return items_to_trade



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
card_deck.push window.QuantumFluctuationCard
card_deck.push window.GMCornCard
card_deck.push window.CornTheMovieCard
card_deck.push window.TomatoWarCard
card_deck.push window.TomatoFamine
card_deck.push window.CornFamine
card_deck.push window.BlueberryFamine
card_deck.push window.PurpleFamine

# More cards:
# Tomato Bomb: kills off the stocks of other people
# Blueberry freeze: freeze the price of blueberries for 10 seconds (per round)
# Corn The Movie: royalties for every corn trade, up to 10 trades 
# Famine(s)