# The Player class is just a data interface for storing information about
# the current player, e.g. production capabilities, total gold, etc.

class window.Player
	constructor: ->
		# Player starts with ten gold
		@gold = 0
		# Initialize the production facilities
		@products = []
		@productionfacilities = []
		for p in [ 'tomato', 'blueberry', 'purple', 'corn' ]
			@products[p] = new Product(p)
			@productionfacilities[p] = new ProductionFacility(@products[p])

		@products['tomato'].color 		= '#DD514C'
		@products['blueberry'].color 	= '#0E90D2'
		@products['purple'].color 		= '#8058A5'
		@products['corn'].color 		= '#FAD232'

		@cards = []

		yes

	getInventoryCount: ->
		inventory = {}
		for name,p of @products
			inventory[name] = p.amount
		return inventory

	giveGold: (amount) ->
		if isNaN(amount)
			console.log '========> gold is NaN!'
			return
		@gold += amount
		updateStatusBar()

	doYes: ->
		yes

	giveCard: (card_index) ->
		if @cards.length > 2
			@cards.splice(0,1)
		@cards.push new window.card_deck[card_index]()

class window.Product
	constructor: (@name) ->
		@amount = 1
		@price = 0
		@color = "green" 
		yes

	# Eventually, this function will go and get the price for a product.
	getPrice: ->
		return @price # = Math.round( Math.random()*100 , 2 )

	# Return the productionfacility associated with the product
	generator: ->
		player.productionfacilities[@name]

class window.ProductionFacility 
	constructor: (@product) ->
		@capacity = 1
		@factory = no
		@level = 0
		@famine = no
		yes

	run_factory: ->
		return no if !@factory

		return yes if @famine && Math.random() > 0.5

		@product.amount += @capacity

		card.on_factory.call(card,@) for card in player.cards
		yes

	upgradeCost: ->
		if @factory
			return @level * window.config.upgrade_cost
		else 
			return window.config.factory_cost

	upgrade: ->
		if !@factory
			@factory = yes
			@level = 1
		else
			@capacity = @capacity + 1
			@level += 1

	# This function will presumably be called every time interval in order
	# to cause production to occur.
	generateProduct: ->
		if @capacity * Math.random() > 1 
			return yes
		else 
			return no

window.player = new Player()
player.giveGold window.config.starting_money