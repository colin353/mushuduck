class window.BiddingStage extends Stage
	constructor: ->
		@type = "BiddingStage"
		@stage_name = ".biddingstage-interface"
		$(@stage_name).show()
		yes