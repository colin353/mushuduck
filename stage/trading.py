import stage
import threading
import time

class TradingStage(stage.Stage):
	duration = 60.0

	def __init__(self, game):
		super(TradingStage, self).__init__(game)
		self.lastRecordedBump = None
		self.numberSold = {'tomato':0, 'blueberry':0, 'purple':0, 'corn':0}
		self.effectiveNumberSold = {}

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
		self.game.effectiveNumberSoldLastRound = self.effectiveNumberSold

	def type(self):
		return 'Trading'

	### action handling

	def updatePrices(self):
		print "...updating prices"
		
		newPrices = {}
		delta = 0.5
		A = 1.0
		T = self.duration + 0.01
		t = self.timeElapsed() + 0.01
		print "t=%f, T=%f" % (t,T)
		for product,N in self.numberSold.iteritems():
			print "...calculating prices for %s" % product
			w = 1.0-(t/T)*(1.0-delta)
			sbar = w*self.game.effectiveNumberSoldLastRound[product] + ((1-w)*N)/t
			self.effectiveNumberSold[product] = sbar
			print "N=%d, w=%f, sbar=%f, s0=%f" % (N, w, sbar, self.game.effectiveNumberSoldLastRound[product])
			newPrices[product] = A/sbar

		self.game.prices = newPrices

	def sell(self, productToSell):
	
		# the player will receive money corresponding to the old price, before market value update
		pay = self.game.roundedPrices[productToSell]
		# update supply
		self.numberSold[productToSell] += 1
		# calculate new price
		self.updatePrices()

		# return pay (old price) to player
		return {'pay': pay}

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
			threading.Timer(1.0, self.handlePriceUpdateTimer).start()

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


class Bump:

	def __init__(self, player, items):
		self.player = player
		self.time = int(round(time.time() * 1000))
		self.items = items

	def closeTo(self, other):
		return abs(self.time - other.time) < 100

