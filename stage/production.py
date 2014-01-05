import stage

class ProductionStage(stage.Stage):

	def __init__(self, game):
		super(ProductionStage, self).__init__(game)
		readyList = []


	def type(self):
		return 'Production'