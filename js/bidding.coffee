class window.BiddingStage extends Stage
	constructor: ->
		me = @

		@type = "BiddingStage"
		@interval = null
		@stage_name = ".biddingstage-interface"
		@current_bid = 10
		$(@stage_name).show()

		$('.losing').hide()
		$('.winning').hide() 

		$('.countdown').show()

		$('.bid').show()

		$('.bid').tap ->
			if player.gold >= me.current_bid
				pycon.transaction {action: 'bid', data: { bidIndex:0, bidAmount:me.get_current_bid.call(me) }}, -> 
					yes
		yes

	get_current_bid: ->
		return @current_bid

	end: ->
		$(@stage_name).hide()
		$('.losing').hide()
		$('.winning').hide()
		$('.countdown').hide()
		clearInterval @interval

	winning: ->
		$('.winning').show()
		$('.losing').hide()
		$('.bid').hide()

	losing: ->
		$('.winning').hide()
		$('.losing').show()
		$('.bid').show()

	updateBidButton: ->
		$('.bid').children('p').html "Bid $#{@current_bid}"

	new_card: (index) ->
		console.log 'Got a new card', @card
		@card = new card_deck[index]()
		$('.card').children('.title').html @card.title
		$('.card').children('.subtitle').html @card.subtitle
		@current_bid = @card.price
		@updateBidButton()

	new_bid: (data) ->
		if data.winning
			@winning()
		else
			@losing()
			@current_bid = data.winningBidAmount + window.config.minimum_bid
			@updateBidButton()

	timer_begin: (duration) ->
		me = @
		console.log 'Starting to count down: ',duration
		clearInterval @interval
		@time = duration
		count_down = ->
			# We don't want to worry about timing if the stage isn't trading.
			return if stage.type != "BiddingStage"
			# Count down.
			stage.time -= 1
			if stage.time <= 0 
				# Set a timer to give us the next countdown
				clearInterval me.interval
			# Draw to the screen.
			updateCountdown()
		@interval = setInterval count_down,1000
		updateCountdown()