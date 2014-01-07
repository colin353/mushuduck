import stage
import helpers

class NotificationStage(stage.Stage):
	stageType = 'Notification'

	def __init__(self, game):
		super(NotificationStage, self).__init__(game)
		self.duration = 1.5 # default duration

	def begin(self):
		helpers.timer(self.duration, self.endStage).start()

	def endStage(self):
		self.game.nextStage()