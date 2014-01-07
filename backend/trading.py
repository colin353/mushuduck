import stage
import time
import math
import helpers
import battle
import string

class TradingStage(stage.Stage):
	stageType = 'Trading'
	requiresTitle = True
	duration = 5.0
	market_tick_period = 1.0

	def __init__(self, game):
		super(TradingStage, self).__init__(game)
		self.lastRecordedBump = None
		self.lastPriceUpdateTime = None
		self.productsAffectedByFamine = set([])

	def begin(self):
		pass

	def afterBegin(self):
		# record current time for price calculation purposes (must come before price update is called)
		self.startTime = time.time()
		# start timers
		helpers.timer(self.duration, self.timerEnd).start()

		self.handlePriceUpdateTimer()
		# notify players that timer started
		self.game.sendEventToAllPlayers('TimerBegin', {'duration':self.duration})

	def end(self):
		# notify players of end of famines
		for product in self.productsAffectedByFamine:
			self.game.sendEventToAllPlayers('FamineEnd', {'productAffected':product})
		pass

	### trading action handling

	def sell(self, sender, data):

		if 'productToSell' in data:
			productToSell = data['productToSell']
		else:
			return "the action 'sell' failed to include a string named 'productToSell'"
		
		# the player will receive gold corresponding to the old price, before market value update
		pay = self.game.roundedPrices[productToSell]

		# calculate new price
		self.updatePrices(productToSell)

		# return pay (old price) to player
		return {'pay': pay}

	def bump(self, sender, data):
		
		if 'items' in data:
			items = data['items']
		else:
			return "the action 'bump' failed to include a dictionary named 'item'"

		# create new bump
		newBump = Bump(sender, items)

		# if there is already a recorded bump with similar time, then zomg trade
		if self.lastRecordedBump and newBump.closeTo(self.lastRecordedBump):

			# facilitate trading
			# send items to respective players
			self.game.sendEventToPlayer(newBump.player, 'TradeCompleted', {'items':self.lastRecordedBump.items})
			self.game.sendEventToPlayer(self.lastRecordedBump.player, 'TradeCompleted', {'items':newBump.items})

		# otherwise, record as first bump
		else:
			print "First bump by %s." % newBump.player
			self.lastRecordedBump = newBump

		return {}

	### inner working function

	def updatePrices(self, productToSell=None):

		A = 0.33333
		T = 30.0
		dt = time.time() - self.lastPriceUpdateTime if self.lastPriceUpdateTime else 0
		if productToSell:
			# price update is caused by a sold product
			productsToCompute = [productToSell]
			dN = 1
		else:
			# otherwise it is due to our market clock tick
			dt = self.market_tick_period
			productsToCompute = self.game.products
			dN = 0

		# compute and update prices
		newPrices = self.game.prices
		for product in productsToCompute:
			newEffN = math.exp(-dt/T)*self.game.effectiveNumberOfSales[product] + dN
			self.game.effectiveNumberOfSales[product] = newEffN
			s = math.sqrt(1/(4*(T**2)) + 0.1*(newEffN/T)**2)
			newPrices[product] = A/s
			#print "product=%s: dt=%f, newN=%f, s=%f" % (product, dt, newEffN, s)
		self.game.prices = newPrices

		# record time for future calculations
		self.lastPriceUpdateTime = time.time()

	### timer handling

	def handlePriceUpdateTimer(self):
		self.updatePrices()

		# restart timer if there is enough time
		# todo: can remove? 
		if self.duration - self.timeElapsed() > 1.1:
			helpers.timer(self.market_tick_period, self.handlePriceUpdateTimer).start()

	def timerEnd(self):
		# clean up recorded time
		#del self.startTime
		# notify players that timer ended
		self.game.sendEventToAllPlayers('TimerEnd')
		# wait 2s before changing stage
		time.sleep(2)
		self.game.nextStage()

	def timeElapsed(self):
		return time.time() - self.startTime

	#### card action handling ####

	def tomatoWarActivated(self, sender):
		# remove upcoming tomato war from stageSequence
		self.game.tomatoWar = True
		return {}

	def famineActivated(self, sender, data):
		# get product affected
		if 'productAffected' in data:
			productAffected = data['productAffected'] 
		else:
			return "the action 'famineActivated' failed to include a string named 'productAffected'"

		# add to list of products affected by famine
		self.productsAffectedByFamine.add(productAffected)

		# notify all players of the famine, and display message
		self.game.sendEventToAllPlayers('DisplayMessage', {'title':"%s famine!" % string.capitalize(productAffected), 'text':"Oh no! All production of %s is slowed until the end of this round" % productAffected, 'duration':1.0})
		self.game.sendEventToAllPlayers('FamineBegin', {'productAffected':productAffected})

		return {}

	def tomatoInfectionActivated(self, sender, data):
		pass


class Bump:

	def __init__(self, player, items):
		self.player = player
		self.time = int(round(time.time() * 1000))
		self.items = items

	def closeTo(self, other):
		return abs(self.time - other.time) < 100

