class Stage:

	def __init__(self):
		pass

	def begin(self):

	def end(self):
		pass

class ProductionStage(Stage):

	def type(self):
		return 'Production'

class TradingStage(Stage):
	
	def type(self):
		return 'Trading'