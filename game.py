from stage import production, trading
import json
import time

class Game(object):
	stageSequence = [production.ProductionStage, trading.TradingStage]

	def __init__(self):
		self._prices = None
		self.players = []
		self.turnNumber = 1
		self.currentStageNumber = 0
		self.currentStage = None
		self.nextStage()
		self.effectiveNumberSoldLastRound = {'tomato':0.2, 'blueberry':0.2, 'purple':0.2, 'corn':0.2}

	@property
	def roundedPrices(self):
		return dict((k,round(v)) for k,v in self.prices.iteritems()) if self.prices else None

	@property
	def prices(self):
		return self._prices

	@prices.setter
	def prices(self, value):
		print "-- prices being set!"

		if self.currentStage.__class__ == trading.TradingStage:
			oldRoundedPrices = self.roundedPrices

		# update price ivar
		self._prices = value

		# if in trading stage, notify players of price update
		if self.currentStage.__class__ == trading.TradingStage:
			self.sendEventToAllPlayers('PriceUpdated', {'prices':self.roundedPrices, 'oldPrices':oldRoundedPrices})

	@prices.deleter
	def prices(self):
		del self._prices

	### stage management ###

	def nextStage(self):

		if self.currentStage:
			# clean up stage
			self.currentStage.end()

			# notify players
			self.sendEventToAllPlayers('stageEnd', {'stageType':self.currentStage.type()})

			# increment stage number
			self.currentStageNumber = (self.currentStageNumber + 1) % len(self.stageSequence)
			
		self.currentStage = self.stageSequence[self.currentStageNumber](self)
		
		# begin new stage
		self.currentStage.begin()

		# notify player
		self.sendEventToAllPlayers('stageBegin', {'stageType':self.currentStage.type()})

		# hack?: run afterbegin
		self.currentStage.afterBegin()

	def messageStage(self, action, *args):
		method = getattr(self.currentStage, action, None)
		if callable(method):
			return method(*args)
		else:
			return "%s does not respond to action %d" % (self.currentStage.type(), action)

	### player management methods ###

	def addPlayerWithHandler(self, handler):
		newPlayer = Player(handler)
		self.players.append(newPlayer)
		## hack: todo: need to get all players before first round begins
		self.sendEventToPlayer(newPlayer, 'stageBegin', {'stageType':self.currentStage.type()})
		self.sendEventToPlayer(newPlayer, 'PriceUpdated', {'prices':self.prices})

		# notify players that player count has increased
		self.sendEventToAllPlayers('playerCountChanged', {'count':len(self.players)})

	def removePlayerWithHandler(self, handler):
		playerToRemove = self.playerWithHandler(handler)
		if playerToRemove in self.players:
			self.players.remove(playerToRemove)
			
		# notify players that player count has increased
		self.sendEventToAllPlayers('playerCountChanged', {'count':len(self.players)})

	def playerWithHandler(self, handler):
		# generate list of matching players
		matchingPlayers = [player for player in self.players if player.socketHandler==handler]
		# yield matching player or yield None
		return matchingPlayers[0] if matchingPlayers else None

	### message sending methods ###

	def sendMessageToPlayer(self, player, message):
		player.socketHandler.write_message(message)

	def sendMessageToAllPlayers(self, message):
		for player in self.players:
			self.sendMessageToPlayer(player, message)

	def sendEventToPlayer(self, player, eventName, data=None):
		self.sendMessageToPlayer(player, json.dumps({'eventName':eventName, 'data':data}))

	def sendEventToAllPlayers(self, eventName, data=None):
		for player in self.players:
			self.sendEventToPlayer(player, eventName, data)

class Player:

	def __init__(self, handler):
		self.socketHandler = handler
