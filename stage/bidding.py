import stage
import threading

class BiddingStage(stage.Stage):
	bidDuration = 10.0

	def __init__(self, game):
		super(BiddingStage, self).__init__(game)
		self.bids = []

	def type(self):
		return 'Bidding'

	def begin(self):
		# todo: change to random
		self.auctions = [1,0]
		self.currentAuction = iter(self.auctions)

	def afterBegin(self):
		self.nextAuction()

	def nextAuction(self):
		try:
			self.game.sendEventToAllPlayers('NewCard', {'index':self.currentAuction.next()})
			self.startBidTimer()
		except StopIteration:
			print "No more auctions"
			self.game.nextStage()


	def bid(self, sender, data):
		
		# obtain bidAmount from data
		if 'bidAmount' in data:
			bidAmount = data['bidAmount']
		else:
			return "the action 'bid' failed to include a string named 'bidAmount'"
		
		# obtain bidIndex from data
		if 'bidIndex' in data:
			bidIndex = data['bidIndex']
		else:
			return "the action 'bid' failed to include a string named 'bidIndex'"

		# check if bid is successful
		if self.bids and bidAmount is self.bids[-1].amount:
			# if bid amount is the same as that of the top bid, return failure
			return {'success':False}
		else:
			# otherwise, record top bid
			bidder = self.game.playerWithHandler(sender)
			newBid = Bid(bidder, bidIndex, bidAmount)
			self.bids.append(newBid)

			# announce new bid
			for player in self.game.players:
				winning = player is bidder
				self.game.sendEventToPlayer(player, 'NewBid', {'winning':winning, 'winningBidAmount':bidAmount})

			# start bid timer and announce to players
			self.stopBidTimer()
			self.startBidTimer()

			# return success
			return {'success':True}

	def bidEnded(self):

		# stop and announce bid timer
		self.stopBidTimer()

		# announce winner if any
		if self.bids:
			# bit ending implies that last bid wins, so announce winner
			winningBid = self.bids[-1]
			winner = winningBid.bidder
			eventData = {'winningBidAmount':winningBid.amount, 'winningBidIndex':winningBid.index}
			self.game.sendEventToPlayer(winner, 'YouWon', eventData)
		else:
			# if no one bidded, nothing happens
			pass

		# go to next auction
		self.nextAuction()

	def startBidTimer(self):
		# start and announce to players
		self.bidTimer = threading.Timer(self.bidDuration, self.bidEnded)
		self.bidTimer.start()
		self.game.sendEventToAllPlayers('TimerBegin', {'duration':self.bidDuration})

	def stopBidTimer(self):
		# stop announce to players
		self.bidTimer.cancel()
		self.game.sendEventToAllPlayers('TimerEnd', {'duration':self.bidDuration})

class Bid(object):

	def __init__(self, bidder, index, amount):
		self.bidder = bidder
		self.index = index
		self.amount = amount