# Handle the interface size

handleResize = ->
	#$('.interface').css('height', ( $	(window).height() - $('.statusbar').height() ) + 'px')
	$('.statusbar').css('font-size', (0.9 * $('.statusbar').height()) + 'px' )

$(window).bind 'resize', handleResize

window.updateStatusBar = ->
	$('.money').html '$' + player.gold