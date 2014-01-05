class window.BiddingStage extends Stage
	constructor: ->
		me = @

		@type = "BiddingStage"
		@stage_name = ".biddingstage-interface"
		$(@stage_name).show()

		$('.losing').hide()
		$('.winning').hide()

		$('.countdown').show()

		$('.bid').tap ->
			pycon.transaction {action: 'bid', data: { bidIndex:0, bidAmount:10 }}, -> 
				yes
		yes

	end: ->
		$(@stage_name).hide()
		$('.losing').hide()
		$('.winning').hide()

	winning: ->
		$('.winning').show()
		$('.losing').hide()

	losing: ->
		$('.winning').hide()
		$('.losing').show()

	newBidAnnouncement: (data) ->
		yes

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