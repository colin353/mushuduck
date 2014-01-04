import game
import threading
import time

class Stage(object):

	def __init__(self, game):
		self.game = game
		pass

	def begin(self):
		pass

	def end(self):
		pass

class ProductionStage(Stage):
	readyList = []

	def type(self):
		return 'Production'

class TradingStage(Stage):
	duration = 10

	def __init__(self, game):
		super(TradingStage, self).__init__(game)
		threading.Timer(self.duration, self.timerEnd).start()

	def begin(self):
		# initialize prices if not already set
		if not self.game.prices:
			self.game.prices = {'tomato':10, 'blueberry':10, 'purple':10, 'corn':10}

		self.game.sendEventToAllPlayers('TimerBegin', {'duration':self.duration})

	def type(self):
		return 'Trading'

	def timerEnd(self):
		self.game.sendEventToAllPlayers('TimerEnd')
		time.sleep(2)
		self.game.nextStage()
