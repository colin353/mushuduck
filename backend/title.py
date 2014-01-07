import notification

class TitleStage(notification.NotificationStage):
	stageType = 'Title'

	def __init__(self, game, stageType):
		super(TitleStage, self).__init__(game)
		self.duration = 1.5 # overrides default duration
		self.title = stageType

	def afterBegin(self):
		# get current age and round number
		ageNumber = self.game.currentAgeNumber
		roundNumber = self.game.currentRoundNumber
		# display title screen
		self.game.sendEventToAllPlayers('DisplayMessage', {'title':self.title})