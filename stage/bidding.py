import stage
import threading

class BiddingStage(stage.Stage):
	bidDuration = 5.0

	def __init__(self, game):
		super(BiddingStage, self).__init__(game)
		# bids is a dictionary of stacks of bids indexed by the indices of the bids
		self.bids = {}

	def type(self):
		return 'Bidding'

	def afterBegin(self):
		# initialize a new bid
		# todo: change to be dynamic and random
		self.game.sendEventToAllPlayers('NewCard', {'index':0})

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

		# if first bid, initialize key in self.bids
		if bidIndex not in self.bids:
			self.bids[bidIndex] = []

		# check if bid is successful
		if self.bids[bidIndex] and bidAmount is self.bids[bidIndex][-1].amount:
			# if bid amount is the same as that of the top bid, return failure
			return {'success':False}
		else:
			# otherwise, record top bid
			bidder = self.game.playerWithHandler(sender)
			newBid = Bid(bidder, bidIndex, bidAmount)
			self.bids[bidIndex].append(newBid)

			# announce new bid
			for player in self.game.players:
				winning = player is bidder
				self.game.sendEventToPlayer(player, 'NewBid', {'winning':winning, 'winningBidAmount':bidAmount})

			# start bid timer and announce to players
			threading.Timer(self.bidDuration, self.endBid)
			self.game.sendEventToAllPlayers('TimerBegin', {'duration':self.bidDuration})

			# return success
			return {'success':True}

	def endBid(self):
		self.game.sendEventToAllPlayers('TimerEnd')

class Bid(object):

	def __init__(self, bidder, index, amount):
		self.bidder = bidder
		self.index = index
		self.amount = amount
