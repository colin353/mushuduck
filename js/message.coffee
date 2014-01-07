# This function makes a nice-looking message pop up
# NO LONGER IN USE!

class window.Message
	constructor: ->
		@dom_selector = '.message'
		@timeout = 5

	display: (title,text, clickable=false) ->
		me = @

		$('.overlay').show()
		$(@dom_selector).children('.title').html title
		$(@dom_selector).children('.text').html text
		$(@dom_selector).show()
		
		if clickable
			$(@dom_selector).tap ->
				me.hide.call me

	hide: ->
		$(@dom_selector).unbind()
		$(@dom_selector).hide()
		$('.overlay').hide()

window.message = new Message()