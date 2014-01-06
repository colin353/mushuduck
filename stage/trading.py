import stage
import threading
import time
import math

class TradingStage(stage.Stage):
	duration = 60.0
	market_tick_period = 1.0

	def __init__(self, game):
		super(TradingStage, self).__init__(game)
		self.lastRecordedBump = None
		# sales is a dictionary of lists of sales indexed by product name
		self.sales = dict((p, []) for p in self.game.products)
		self.lastPriceUpdateTime = None

	def begin(self):
		pass

	def afterBegin(self):
		# record current time for price calculation purposes (must come before price update is called)
		self.startTime = time.time()
		# start timers
		threading.Timer(self.duration, self.timerEnd).start()
		self.handlePriceUpdateTimer()
		# notify players that timer started
		self.game.sendEventToAllPlayers('TimerBegin', {'duration':self.duration})

	def end(self):
		pass

	def type(self):
		return 'Trading'

	### action handling

	def sell(self, productToSell):
	
		# the player will receive gold corresponding to the old price, before market value update
		pay = self.game.roundedPrices[productToSell]

		# record sale
		sale = Sale(productToSell)
		self.sales[productToSell].append(sale)

		# calculate new price
		self.updatePrices(productToSell)

		# return pay (old price) to player
		return {'pay': pay}

	def updatePrices(self, productToSell=None):

		A = 1.0
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
			print "product=%s: dt=%f, newN=%f, s=%f" % (product, dt, newEffN, s)
		self.game.prices = newPrices

		# record time for future calculations
		self.lastPriceUpdateTime = time.time()

	def bump(self, playerHandler, items):

		# create new bump
		newBump = Bump(self.game.playerWithHandler(playerHandler), items)

		# if there is already a recorded bump with similar time, then zomg trade
		if self.lastRecordedBump and newBump.closeTo(self.lastRecordedBump):

			# facilitate trading
			self.facilitateTradeWithBumps(newBump, self.lastRecordedBump)

		# otherwise, record as first bump
		else:
			print "First bump by %s." % newBump.player
			self.lastRecordedBump = newBump

	def facilitateTradeWithBumps(self, bump1, bump2):
		print "ZOMG trading!"

		# send items to respective players
		self.game.sendEventToPlayer(bump1.player, 'TradeCompleted', {'items':bump2.items})
		self.game.sendEventToPlayer(bump2.player, 'TradeCompleted', {'items':bump1.items})

	### timer handling

	def handlePriceUpdateTimer(self):
		self.updatePrices()

		# restart timer if there is enough time
		# todo: can remove? 
		if self.duration - self.timeElapsed() > 1.1:
			threading.Timer(self.market_tick_period, self.handlePriceUpdateTimer).start()

	def timerEnd(self):
		# clean up recorded time
		#del self.startTime
		# notify players that timer ended
		self.game.sendEventToAllPlayers('TimerEnd')
		# wait 2s before changing stage
		self.game.cumulativeTradingTimeUntilLastRound += self.duration
		time.sleep(2)
		self.game.nextStage()

	def timeElapsed(self):
		return time.time() - self.startTime

	def cumulativeTradingTime(self):
		return self.timeElapsed() + self.game.cumulativeTradingTimeUntilLastRound

class Sale(object):

	def __init__(self, product):
		self.product = product
		self.time = time.time()

class Bump:

	def __init__(self, player, items):
		self.player = player
		self.time = int(round(time.time() * 1000))
		self.items = items

	def closeTo(self, other):
		return abs(self.time - other.time) < 100

