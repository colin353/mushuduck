class BattleStage extends NotificationStage 

	end: ->	
		# Tomatoes will rot now
		player.products['tomato'].amount = 0
		super