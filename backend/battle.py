import notification

class BattleStage(notification.NotificationStage):
	stageType = 'Battle'
	resquiresTitle = False
	battlePrizePerOpponent = [50.0, 100.0, 200.0]
	battleLostPayment = -50.0

	def __init__(self, game):
		super(BattleStage, self).__init__(game)
		# dictionary of inventory counts indexed by player
		self.playerTomatoCounts = dict((p, None) for p in self.game.players)
		self.duration = 5.0 # overrides default duration

	def afterBegin(self):
		self.game.sendEventToAllPlayers('InventoryCountRequested', {'callback':'updateTomatoCount'})

	def updateTomatoCount(self, sender, data):
		print "==> in updateTomatoCount"
		# data should be a dictionary of inventory counts
		try:
			self.playerTomatoCounts[sender] = data['tomato']
		except KeyError:
			return "the action 'updateTomatoCount' failed to include a dictionary with key 'tomato'"

		print self.playerTomatoCounts

		# if all players have updated their inventory counts, display winning/losing messages on clients
		if all([v is not None for v in self.playerTomatoCounts.values()]):
			# determine winner
			maxCount = max(self.playerTomatoCounts.values())
			winners = [player for player, count in self.playerTomatoCounts.iteritems() if count==maxCount and count>0]

			if winners:
				print "we have winners"
				# calculate amount of gold each winner get (must do before notifying winner)
				prizeAmount = self.battlePrizePerOpponent[self.game.currentAgeNumber]*(len(self.game.players)-1)/len(winners)

				# notify each player that he or she either won or lost, and give/remove appropriate amount of gold
				for player in self.game.players:
					if player in winners:
						msg = "You won the tomato war!\nPrize: %d <i class='gold'>&nbsp;&nbsp;&nbsp;</i>" % prizeAmount
						goldGranted = prizeAmount
					else:
						msg = "You lost the tomato war!"
						goldGranted = self.battleLostPayment
					self.game.sendEventToPlayer(player, 'DisplayMessage', {'title':"Battle!", 'text':msg, 'clickable':False})
					self.game.sendEventToPlayer(player, 'GoldGranted', {'amount':goldGranted})
			else:
				print "no winners!"
				# no one wins
				self.game.sendEventToAllPlayers('DisplayMessage', {'title':"Battle!", 'text':"No one has any tomatoes to battle!", 'clickable':False})

		return {}

	def endStage(self):
		# reset tomato war flag
		self.game.tomatoWar = False
		super(BattleStage, self).endStage()