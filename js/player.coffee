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

		@products['tomato'].color = 'red'
		@products['blueberry'].color = 'blue'
		@products['purple'].color = 'purple'
		@products['corn'].color = 'orange'

		yes

	doYes: ->
		yes

class window.Product
	constructor: (@name) ->
		@amount = 0
		@price = 0
		@color = "green"
		yes


	# Eventually, this function will go and get the price for a product.
	getPrice: ->
		return @price = Math.round( Math.random()*100 , 2 )

	# Return the productionfacility associated with the product
	generator: ->
		player.productionfacilities[@name]

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