import production, bidding, trading, battle
import json
import time
import helpers

class Game(object):
	stageSequence = [bidding.BiddingStage]
	products = ['tomato', 'blueberry', 'purple', 'corn']
	numberOfAges = 3
	numberOfRoundsPerAge = 3
	stageSequence = numberOfAges*([production.ProductionStage] + numberOfRoundsPerAge*[bidding.BiddingStage, trading.TradingStage] + [battle.BattleStage])
	firstStageInAge = production.ProductionStage
	firstStageInRound = bidding.BiddingStage

	def __init__(self):
		self._prices = dict((product, 5.0) for product in self.products)
		self.players = []

		self.effectiveNumberOfSales = dict((p, 10) for p in self.products)
		self.cumulativeTradingTimeUntilLastRound = 0.0

		self.currentStageNumber = 0
		self.currentAgeNumber = 0
		self.currentRoundNumber = 0
		self.currentStage = None
		self.nextStage()

	@property
	def roundedPrices(self):
		return dict((k,round(v)) for k,v in self.prices.iteritems()) if self.prices else None

	@property
	def prices(self):
		return self._prices

	@prices.setter
	def prices(self, value):
		#print "-- prices being set!"

		# todo: need to remove trading stage dependence
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

		# end current stage if it exists
		if self.currentStage:
			# clean up stage
			self.currentStage.end()
			# notify players
			self.sendEventToAllPlayers('stageEnd', {'stageType':self.currentStage.type()})
			# increment stage number
			self.currentStageNumber += 1

		# retrieve new stage
		try:
			self.currentStage = self.stageSequence[self.currentStageNumber](self)
		except IndexError:
			self.currentStage = None
			return

		# if at start of new age, increment age counters
		if self.currentStage.__class__ is self.firstStageInAge:
			helpers.printHeader(u"\u00A1\u00A1\u00A1 ===== AGE %d ===== !!!" % self.currentAgeNumber)
			self.currentAgeNumber += 1

		# if at start of round, increment round count
		if self.currentStage.__class__ is self.firstStageInRound:
			helpers.printHeader(u"\u00A1\u00A1\u00A1 ===== stage %d ===== !!!" % self.currentRoundNumber)
			self.currentRoundNumber += 1
		
		# begin new stage
		self.currentStage.begin()
		# notify player
		self.sendEventToAllPlayers('stageBegin', {'stageType':self.currentStage.type()})
		# hack?: run afterbegin
		self.currentStage.afterBegin()

	### player management methods ###

	def addPlayerWithHandler(self, handler):
		newPlayer = Player(handler)
		self.players.append(newPlayer)
		## hack: todo: need to get all players before first round begins
		self.sendEventToPlayer(newPlayer, 'stageBegin', {'stageType':self.currentStage.type()})
		self.sendEventToPlayer(newPlayer, 'PriceUpdated', {'prices':self.roundedPrices})

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
		# logging
		if data:
			helpers.cprint("<== sending event '%s' to player%d with data:" % (eventName, player.id), helpers.lcolors.OUTGOING)
			print helpers.treeDict(data)
		else:
			helpers.cprint("<== sending event '%s' to player%d" % (eventName, player.id), helpers.lcolors.OUTGOING)

		self.sendMessageToPlayer(player, json.dumps({'eventName':eventName, 'data':data}))

	def sendEventToAllPlayers(self, eventName, data=None):
		for player in self.players:
			self.sendEventToPlayer(player, eventName, data)


class Player:
	cur_id = 0
	def __init__(self, handler):
		self.socketHandler = handler
		self.id = self.cur_id
		Player.cur_id += 1
