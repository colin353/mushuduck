import production, bidding, trading, battle, title
import json
import time
import helpers

class Game(object):
	stageSequence = [bidding.BiddingStage]
	products = ['tomato', 'blueberry', 'purple', 'corn']
	numberOfAges = 3
	numberOfRoundsPerAge = 3
	firstStageInAge = production.ProductionStage
	firstStageInRound = bidding.BiddingStage
	lastStageInRound = trading.TradingStage

	def __init__(self):
		self._prices = dict((product, 5.0) for product in self.products)
		self.players = []

		# variables for trading stage
		self.effectiveNumberOfSales = dict((p, 10) for p in self.products)
		self.cumulativeTradingTimeUntilLastRound = 0.0

		# variable for battle stage
		self.tomatoWar = False

		# variables
		self.stageSequence = self.numberOfAges*([production.ProductionStage] + self.numberOfRoundsPerAge*[bidding.BiddingStage, trading.TradingStage] + [battle.BattleStage])
		self.currentAgeNumber = -1
		self.currentRoundNumber = -1
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

		# hack: keeping track of title stages
		endingTitleStage = False

		# end current stage if it exists
		if self.currentStage:

			# if at end of round
			if self.currentStage.__class__ is self.lastStageInRound:
				self.currentRoundNumber = -1

			# if end a title stage
			if self.currentStage.__class__ is title.TitleStage:
				endingTitleStage = True

			# clean up stage
			self.currentStage.end()
			# notify players
			self.sendEventToAllPlayers('stageEnd', {'stageType':self.currentStage.stageType})

		# retrieve new stage
		try:
			nextStage = self.stageSequence.pop(0)
			# keep going if battle stage is next but there is no tomato war
			while not self.tomatoWar and nextStage is battle.BattleStage:
				nextStage = self.stageSequence.pop(0)

		except IndexError:
			self.currentStage = None
			return

		# initialize empty parameter dictionary
		params = {}

		# if at start of new age, increment age counters
		if nextStage.__class__ is self.firstStageInAge:
			self.currentAgeNumber += 1
			self.currentRoundNumber = -1
			helpers.printHeader(u"\u00A1\u00A1\u00A1 ===== AGE %d ===== !!!" % self.currentAgeNumber)

		# if at start of round
		if nextStage.__class__ is self.firstStageInRound:
			self.currentRoundNumber += 1
			helpers.printHeader(u"\u00A1\u00A1\u00A1 ===== round %d ===== !!!" % self.currentRoundNumber)

		# if the next stage requires a title screen, and we haven't already displayed it, then display it
		if nextStage.requiresTitle and not endingTitleStage:
			# insert stage back up
			self.stageSequence.insert(0, nextStage)
			# display title screen instead
			params = {'stageType':nextStage.stageType}
			nextStage = title.TitleStage

		# instantiate stage object
		self.currentStage = nextStage(self, **params)

		# begin new stage
		self.currentStage.begin()
		# notify player
		self.sendEventToAllPlayers('stageBegin', {'stageType':self.currentStage.stageType})
		# hack?: run afterbegin
		self.currentStage.afterBegin()

	### player management methods ###

	def addPlayerWithHandler(self, handler):
		newPlayer = Player(handler)
		self.players.append(newPlayer)
		## hack: todo: need to get all players before first round begins
		self.sendEventToPlayer(newPlayer, 'stageBegin', {'stageType':self.currentStage.stageType})
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
