class window.ProductionStage
	constructor: ->
		me = @
		@productions = []

		$('.box').each ->
			me.productions.push( new Production( $(@), me ) )

		$('.ready').tap ->
			pycon.transaction { 'action': 'ready' }, yes

		yes

class window.Production
	constructor: (@dom_object, @productionstage) ->
		me = @
		@capacity = 0

		@dom_object.tap ->
 			me.invest.call me,1

		yes

	invest: (amount) ->
		@capacity += amount
		@needsRefresh()
		yes

	needsRefresh: ->
		@dom_object.children('span').html @capacity
		yes