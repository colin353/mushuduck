
$ ->
	console.log 'Gryo begin tracking'
	gyro.frequency = 200
	window.orientation = 0;
	gyro.startTracking (o) ->
		if window.orientation == 0
			window.orientation = o
		else
			change = Math.sqrt ( (orientation.x-o.x) ** 2 + (orientation.y-o.y) **2 +  (orientation.z-o.z) )
			console.log change

		window.orientation = o
