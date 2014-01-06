import stage
import threading

class BattleStage(stage.Stage):
	duration = 5.0
	# dictionary of inventory counts indexed by player
	self.playerInventoryCounts = dict((p, None) for p in self.game.players)

	def __init__(self, game):
		super(BattleStage, self).__init__(game)

	def type(self):
		return 'Battle'

	def begin(self):
		threading.Timer(self.duration, self.endStage).start()

	def afterBegin(self):
		self.game.sendEventToAllPlayer('InventoryCountRequested', {'callback':'updateInventory'})

	def updateInventory(self, sender, data):
		# data should be a dictionary of inventory counts
		self.playerInventoryCounts[sender] = data

		# if all players have updated their inventory counts, tell clients to display battle stats
		if all(self.playerInventoryCounts.values()):
			winner = max(self.playerInventoryCounts, key=lambda p:p[1])[0]
			self.game.sendEventToAllPlayer('DisplayMessage', {'messageTitle':"Battle!", 'messageBody':"%s wins the tomato war!" % winner})

	def endStage():
		self.game.sendEventToAllPlayer('DisplayMessage', {'messageTitle':"Battle!", 'messageBody':"%s win the tomato war!" % winner})
		self.game.nextStage()