# This function makes a nice-looking message pop up
# NO LONGER IN USE!

class window.Message
	constructor: ->
		@dom_selector = '.message'
		@timeout = 5

	display: (text) ->
		me = @

		$(@dom_selector).children('span').html text
		$(@dom_selector).fadeIn 'slow'
		setTimeout( ->
			me.hide.call(me)
		,@timeout*1000)

	hide: ->
		$(@dom_selector).fadeOut 'slow'

window.message = new Message()