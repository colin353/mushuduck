import stage

class ProductionStage(stage.Stage):
	stageType = 'Production'
	requiresTitle = True

	def __init__(self, game):
		super(ProductionStage, self).__init__(game)
		self.readyList = []

	def ready(self, sender):
		if sender:
			# add player to readyList
			self.readyList.append(sender)
			# if all players are ready, move the to the next stage
			if all([p in self.readyList for p in self.game.players]):
				self.game.nextStage()

		return {}
