import game

class Stage:

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

	def begin(self):
		# initialize prices if not already set
		if not self.game.prices:
			self.game.prices = {'tomato':10, 'blueberry':10, 'purple':10, 'corn':10}
	
	def type(self):
		return 'Trading'