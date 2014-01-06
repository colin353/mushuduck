class BattleStage extends Stage 
	constructor: ->
		super
		yes

	end: ->
		message.hide.call message
		
		# Tomatoes will rot now
		player.products['tomato'].amount = 0