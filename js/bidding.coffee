class window.BiddingStage extends Stage
	constructor: ->
		me = @

		@type = "BiddingStage"
		@stage_name = ".biddingstage-interface"
		@current_bid = 10
		$(@stage_name).show()

		$('.losing').hide()
		$('.winning').hide()

		$('.countdown').show()

		$('.bid').show()

		$('.bid').tap ->
			if player.gold >= @current_bid
				pycon.transaction {action: 'bid', data: { bidIndex:0, bidAmount:@current_bid }}, -> 
					yes
		yes

	end: ->
		$(@stage_name).hide()
		$('.losing').hide()
		$('.winning').hide()
		$('.countdown').hide()

	winning: ->
		$('.winning').show()
		$('.losing').hide()
		$('.bid').hide()

	losing: ->
		$('.winning').hide()
		$('.losing').show()
		$('.bid').show()

	updateBidButton: ->
		$('.bid').html "Bid $#{@current_bid}"

	new_bid: (data) ->
		if data.winning
			@winning()
		else
			@losing()
			@current_bid += window.config.minimum_bid
			

	timer_begin: (data) ->
		count_down = ->
			# We don't want to worry about timing if the stage isn't trading.
			return if stage.type != 'BiddingStage'
			# Count down.
			stage.time -= 1
			if stage.time > 0 
				# Set a timer to give us the next countdown
				setTimeout count_down, 1000 
			# Draw to the screen.
			updateCountdown()
		setTimeout count_down,1000
		updateCountdown()
