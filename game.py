from stage import ProductionStage, TradingStage
from events import EventDispatcher
import json
import time

class Game:
	stageSequence = [ProductionStage, TradingStage]
	bump_in_progress = False
	bump_time = 0

	def __init__(self):
		self.players = []
		self.turnNumber = 1
		self.currentStageNumber = 0
		self.currentStage = None
		self.nextStage()
		self.dispatcher = EventDispatcher()

	def addPlayerWithHandler(self, handler):
		newPlayer = Player(handler)
		self.players.append(newPlayer)
		## hack: todo: need to get all players before first round begins
		data = {'stageType':self.currentStage.type()}
		self.dispatcher.send(newPlayer.socketHandler, json.dumps({'eventName':"stageBegin" , 'data':data }))

		# notify players that player count has increased
		data = {'count':len(self.players)}
		self.dispatchToAll(json.dumps({'eventName':"playerCountChanged" , 'data':data }))

	def removePlayerWithHandler(self, handler):
		playerToRemove = self.playerWithHandler(handler)
		if playerToRemove in self.players:
			self.players.remove(playerToRemove)
			# notify players that player count has decreased
			data = {'count':len(self.players)}
			self.dispatchToAll(json.dumps({'eventName':"playerCountChanged" , 'data':data }))



	def nextStage(self):

		if self.currentStage:
			# clean up stage
			self.currentStage.end()

			# notify players
			data = {'stageType':self.currentStage.type()}
			self.dispatchToAll(json.dumps( {'eventName':"stageEnd" , 'data':data }))

			# increment stage number
			self.currentStageNumber = (self.currentStageNumber + 1) % len(self.stageSequence)
			
		self.currentStage = self.stageSequence[self.currentStageNumber]()
		
		# begin new stage
		self.currentStage.begin()

		# notify player
		data = {'stageType':self.currentStage.type()}
		self.dispatchToAll(json.dumps({'eventName':"stageBegin" , 'data':data }))

	def bump(self):
		if not self.bump_in_progress:
			self.bump_time = int(round(time.time() * 1000))
			print "Begin bump tracking!"
			self.bump_in_progress = True
		else:
			print "Bump succesfully identified! Time: %d ms" % (int(round(time.time() * 1000)) - self.bump_time)
			self.bump_in_progress = False

	def dispatchToAll(self, message):
		for player in self.players:
			self.dispatcher.send(player.socketHandler, message)

	def markReady(self, playerHandler):
		# get player obj from handler
		player = self.playerWithHandler(playerHandler)
		print self.players

		if player:
			# add player to readyList
			self.currentStage.readyList.append(player)
			# if all players are ready, move the to the next stage
			if all([p in self.currentStage.readyList for p in self.players]):
				self.nextStage()

	def playerWithHandler(self, handler):
		# generate list of matching players
		matchingPlayers = [player for player in self.players if player.socketHandler==handler]
		# yield matching player or yield None
		return matchingPlayers[0] if matchingPlayers else None



class Player:

	def __init__(self, handler):
		self.socketHandler = handler

