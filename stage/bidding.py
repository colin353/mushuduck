import stage

class BiddingStage(stage.Stage):

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

		# check if bid is successful
		if bidIndex in self.bids and bidAmount is self.bids[bidIndex][-1]:
			# if bid is the first, or has amount that is the same as the top bid, return failure
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
			
			# return success
			return {'success':True}

class Bid(object):

	def __init__(self, bidder, index, amount):
		self.bidder = player
		self.index = index
		self.amount = amount
