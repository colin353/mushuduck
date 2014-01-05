import stage

class BiddingStage(stage.Stage):

	def __init__(self, game):
		super(BiddingStage, self).__init__(game)

	def type(self):
		return 'Bidding'

	def afterBegin(self):
		self.game.sendEventToAllPlayers('NewCard', {'index':0})