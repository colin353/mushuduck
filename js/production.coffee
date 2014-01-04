class window.ProductionStage extends Stage
	constructor: ->
		me = @
		@productions = []

		@type = 'ProductionStage'

		@stage_name = '.productionstage-interface'

		$(@stage_name).show()

		$("#{@stage_name} .box").each ->
			type = $(@).attr('data-production-type')
			me.productions.push( new Production( $(@), me, player.productionfacilities[type] ) )

		$('.ready').tap ->
			me.ready() 

		super

	end: ->
		$(@stage_name).hide()
		$('.ready').unbind()

	ready: ->
		# Show the ready as GREEN instead of GRAY
		$('.ready').css('background-color','green')
		pycon.transaction { 'action': 'ready' }, ->
			yes

class Production
	constructor: (@dom_object, @productionstage, @productionfacility) ->
		me = @
		
		@dom_object.tap ->
 			me.invest.call me,1

		yes

	invest: (amount) ->
		@productionfacility.capacity += amount
		@needsRefresh()
		yes

	needsRefresh: ->
		@dom_object.children('span').html @productionfacility.capacity
		yes
