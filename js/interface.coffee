# Handle the interface size

$(window).bind 'resize', ->
	# Update the status bar font size so that it doesn't get too big
	$('.statusbar').css('font-size', (0.9 * $('.statusbar').height()) + 'px' )
	# Scroll the window to the top (solves some problems when rotating phones)
	$(window).scrollTop(0);

window.updateStatusBar = ->
	# Push the current amount of gold to the status bar.
	$('.money').html '$' + player.gold

window.updateCountdown = ->
	# Write in the time.
	$('.countdown').html stage.time	