class window.BiddingStage extends Stage
	constructor: ->
		me = @

		@type = "BiddingStage"
		@stage_name = ".biddingstage-interface"
		$(@stage_name).show()

		$('.losing').hide()
		$('.winning').hide()

		$('.bid').tap ->
			pycon.transaction {action: 'bid', data: { bidIndex:0, bidAmount:10 }}

		yes

	winning: ->
		$('.winning').show()
		$('.losing').hide()

	losing: ->
		$('.winning').hide()
		$('.losing').show()

