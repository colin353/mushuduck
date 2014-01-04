from stage import ProductionStage, TradingStage
import json
import time

class Game(object):
	stageSequence = [ProductionStage, TradingStage]

	def __init__(self):
		self._prices = None
		self.players = []
		self.turnNumber = 1
		self.currentStageNumber = 0
		self.currentStage = None
		self.nextStage()
		self.lastRecordedBump = None

	@property
	def prices(self):
		return self._prices

	@prices.setter
	def prices(self, value):
		print "-- prices being set!"

		# if in trading stage, notify players of price update
		if self.currentStage.__class__ == TradingStage:
			self.sendEventToAllPlayers('PriceUpdated', {'prices':value, 'oldPrices':self._prices})

		# update price ivar
		self._prices = value

	@prices.deleter
	def prices(self):
		del self._prices

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

	#### methods for trading stage

	def sell(self, productToSell):

		# the player will receive money corresponding to the old price, before market value update
		pay = self.prices[productToSell]
		# calculate new price
		self.prices[productToSell] -= 5
		self.prices = self.prices

		# return pay (old price) to player
		return {'pay': pay}

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

	def facilitateTradeWithBumps(self, bump1, bump2):
		print "Zomg trading!"

		# send items to respective players
		self.sendEventToPlayer(bump1.player, 'TradeCompleted', {'items':bump2.items})
		self.sendEventToPlayer(bump2.player, 'TradeCompleted', {'items':bump1.items})

	#### player management methods ####

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

	#### message sending methods ####

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


class Bump:

	def __init__(self, player, items):
		self.player = player
		self.time = int(round(time.time() * 1000))
		self.items = items

	def closeTo(self, other):
		return abs(self.time - other.time) < 100

