import stage
import threading

class BattleStage(stage.Stage):
	duration = 5.0

	def __init__(self, game):
		super(BattleStage, self).__init__(game)

	def type(self):
		return 'Battle'

	def afterBegin(self):
		self.game.sendEventToAllPlayer('InventoryCountRequested', {'callback':'updateInventory'})

	def updateInventory(self, sender, data):
		
		self.game.sendEventToAllPlayer('DisplayMessage', {'messageTitle':"Battle!", 'messageBody':"The top three players are"})

