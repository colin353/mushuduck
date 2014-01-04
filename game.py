from stage import ProductionStage, TradingStage
from events import EventDispatcher
import json
import time

class Game:
	stageSequence = [ProductionStage, TradingStage]

	def __init__(self):
		self.players = []
		self.turnNumber = 1
		self.currentStageNumber = 0
		self.currentStage = None
		self.nextStage()
		self.dispatcher = EventDispatcher()
		self.lastRecordedBump = None

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

	def bump(self, playerHandler, items):

		# create new bump
		newBump = Bump(self.playerWithHandler(playerHandler), items)

		# if there is already a recorded bump with similar time, then zomg trade
		if self.lastRecordedBump and newBump.closeTo(self.lastRecordedBump):

			# facilitate trading
			self.facilitateTradeWithBumps(newBump, self.lastRecordedBump)

		# otherwise, record as first bump
		else:
			print "First bump by %s." % newBump.player
			self.lastRecordedBump = newBump

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

	def facilitateTradeWithBumps(self, bump1, bump2):
		print "Zomg trading!"

		# create events that swap items
		event1 = {'eventName':'TradeCompleted', 'data':{'items':bump2.items}}
		event2 = {'eventName':'TradeCompleted', 'data':{'items':bump1.items}}

		# send to respective players
		self.dispatcher.send(bump1.player.socketHandler, event1)
		self.dispatcher.send(bump2.player.socketHandler, event2)




class Player:

	def __init__(self, handler):
		self.socketHandler = handler


class Bump:

	def __init__(self, player, items):
		self.player = player
		self.time = int(round(time.time() * 1000))
		self.items = items

	def closeTo(self, other):
		return abs(self.time - other.time) < 100

