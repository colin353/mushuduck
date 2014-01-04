import game
import threading
import time

class Stage(object):

	def __init__(self, game):
		self.game = game
		pass

	def begin(self):
		pass

	def afterBegin(self):
		pass

	def end(self):
		pass

class ProductionStage(Stage):
	readyList = []

	def type(self):
		return 'Production'

class TradingStage(Stage):
	duration = 120.0

	def __init__(self, game):
		super(TradingStage, self).__init__(game)

	def begin(self):
		self.game.numberSold = {'tomato':0, 'blueberry':0, 'purple':0, 'corn':0}

	def afterBegin(self):
		# record current time for price calculation purposes (must come before price update is called)
		self.startTime = time.time()
		# start timers
		threading.Timer(self.duration, self.timerEnd).start()
		self.handlePriceUpdateTimer()
		# notify players that timer started
		self.game.sendEventToAllPlayers('TimerBegin', {'duration':self.duration})

	def end(self):
		del self.game.numberSold
		self.game.effectiveNumberSoldLastRound = self.game.effectiveNumberSold

	def type(self):
		return 'Trading'

	def handlePriceUpdateTimer(self):
		self.game.updatePrices()
		if self.duration - self.timeElapsed() > 1.1:
			threading.Timer(1.0, self.handlePriceUpdateTimer).start()

	def timerEnd(self):
		# clean up recorded time
		del self.startTime
		# notify players that timer ended
		self.game.sendEventToAllPlayers('TimerEnd')
		# wait 2s before changing stage
		time.sleep(2)
		self.game.nextStage()

	def timeElapsed(self):
		return time.time() - self.startTime
