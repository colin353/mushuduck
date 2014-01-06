import stage
import helpers

class BattleStage(stage.Stage):
	duration = 5.0

	def __init__(self, game):
		super(BattleStage, self).__init__(game)
		# dictionary of inventory counts indexed by player
		self.playerInventoryCounts = dict((p, None) for p in self.game.players)

	def type(self):
		return 'Battle'

	def begin(self):
		helpers.timer(self.duration, self.endStage).start()

	def afterBegin(self):
		self.game.sendEventToAllPlayers('InventoryCountRequested', {'callback':'updateInventory'})

	def updateInventory(self, sender, data):
		# data should be a dictionary of inventory counts
		self.playerInventoryCounts[sender] = data

		# if all players have updated their inventory counts, tell clients to display battle stats
		if all(self.playerInventoryCounts.values()):
			winner = max(self.playerInventoryCounts.items(), key=lambda p:p[1])[0]
			self.game.sendEventToAllPlayers('DisplayMessage', {'title':"Battle!", 'text':"player%s wins the tomato war!" % winner.id})

	def endStage(self):
		self.game.nextStage()