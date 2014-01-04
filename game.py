from stage import ProductionStage, TradingStage
from events import EventDispatcher
import json

class Game:
	stageSequence = [ProductionStage, TradingStage]

	def __init__(self):
		self.players = []
		self.turnNumber = 1
		self.currentStageNumber = 0
		self.currentStage = None
		self.nextStage()
		self.dispatcher = EventDispatcher()

	def addPlayer(self, handler):
		newPlayer = Player(handler)
		self.players.append(newPlayer)
		## hack: todo: need to get all players before first round begins
		data = {'stageType':self.currentStage.type()}
		self.dispatcher.send(newPlayer.socketHandler, json.dumps({'eventName':"stageBegin" , 'data':data }))

	def nextStage(self):

		if self.currentStage is not None:
			# clean up stage
			self.currentStage.end()

			# notify players
			data = {'stageType':self.currentStage.type()}
			self.dispatchToAll(json.dumps( {'eventName':"stageEnd" , 'data':data }))

			# increment stage number
			self.currentStageNumber = (self.currentStageNumber + 1) % length(self.stageSequence)
			
		self.currentStage = self.stageSequence[self.currentStageNumber]()
		
		# begin new stage
		self.currentStage.begin()

		# notify player
		data = {'stageType':self.currentStage.type()}
		self.dispatchToAll(json.dumps({'eventName':"stageBegin" , 'data':data }))

	def dispatchToAll(self, message):
		for player in self.players:
			self.dispatcher.send(player.socketHandler, message)

	def markReady(self, player):
		# add player to readyList
		self.currentStage.readyList.append(player)
		# if all players are ready, move the to the next stage
		if all([player in readyList for player in self.players]):
			self.nextStage()




class Player:

	def __init__(self, handler):
		self.socketHandler = handler

