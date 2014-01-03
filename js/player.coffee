# The Player class is just a data interface for storing information about
# the current player, e.g. production capabilities, total gold, etc.

class window.Player
	constructor: ->
		# Player starts with ten gold
		@gold = 10
		# Initialize the production facilities
		@products = []
		@productionfacilities = []
		for p in [ 'tomato', 'blueberry', 'purple', 'corn' ]
			@products[p] = new Product(p)
			@productionfacilities[p] = new ProductionFacility(@products[p])
		yes

	doYes: ->
		yes

class window.Product
	constructor: (@name) ->
		yes

class window.ProductionFacility
	constructor: (product) ->
		@capacity = 0
		yes

	# This function will presumably be called every time interval in order
	# to cause production to occur.
	generateProduct: ->
		if @capacity * Math.random() > 1 
			return yes
		else 
			return no

window.player = new Player()
player.gold = 5