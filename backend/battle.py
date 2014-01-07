import stage
import helpers

class BattleStage(stage.Stage):
	duration = 5.0
	battlePrizePerOpponent = 100.0

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

		# if all players have updated their inventory counts, display winning/losing messages on clients
		if all(self.playerInventoryCounts.values()):
			# determine winner
			winner = max(self.playerInventoryCounts.items(), key=lambda p:p[1]['tomato'])[0]

			# give winner money (must do before notifying winner)
			prizeAmount = self.battlePrizePerOpponent*(len(self.game.players)-1)
			self.game.sendEventToPlayer(winner, 'GoldGranted', {'amount':prizeAmount})

			# notify each player that he or she either won or lost
			for player in self.game.players:
				if player is winner:
					msg = "You won the tomato war!\nPrize: %d <i class='gold'></i>" % prizeAmount
				else:
					msg = "You lost the tomato war!"
				self.game.sendEventToPlayer(player, 'DisplayMessage', {'title':"Battle!", 'text':msg, 'clickable':False})

	def endStage(self):
		self.game.nextStage()