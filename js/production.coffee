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

		# Reset the ready button and set it back to grey.
		$('.ready').show()
		$('.ready').css('background-color','grey')

		super

	end: ->
		$(@stage_name).hide()
		$('.ready').unbind()
		$('.ready').hide()

		super

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

 		@needsRefresh()
 		
		yes

	invest: (amount) ->
		cost = @productionfacility.upgradeCost.call @productionfacility
		if cost <= player.gold 
			player.giveGold -cost
			@productionfacility.upgrade.call @productionfacility
		@needsRefresh()
		yes

	needsRefresh: ->
		@dom_object.children('span').html "Level " + @productionfacility.level
		yes
