
$ ->
	console.log 'Gryo begin tracking'
	
	window.acc = {x:0, y:0, z:0}

	window.ondevicemotion = (e) ->
		x = e.accelerationIncludingGravity.x
		y = e.accelerationIncludingGravity.y
		z = e.accelerationIncludingGravity.z
		
		change = Math.abs(acc.x-x) + Math.abs(acc.y-y) + Math.abs(acc.z-z)

		string = ''
		for i in [1..Math.round(change)]
			string += 'XXX'

		console.log string

		$(".money").html change

		window.acc = {x:x, y:y, z:z}

		if change > 30 
			alert "You win!"