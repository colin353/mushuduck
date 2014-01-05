import stage

class BiddingStage(stage.Stage):

	def __init__(self, game):
		super(BiddingStage, self).__init__(game)
		self.topBids = {}

	def type(self):
		return 'Bidding'

	def afterBegin(self):
		# initialize a new bid
		# todo: change to be dynamic and random
		self.game.sendEventToAllPlayers('NewCard', {'index':0})

	def bid(self, sender, data):
		
		if 'bidAmount' in data:
			bidAmount = data['bidAmount']
		else:
			return "the action 'bid' failed to include a string named 'bidAmount'"
		
		if 'bidIndex' in data:
			bidIndex = data['bidIndex']
		else:
			return "the action 'bid' failed to include a string named 'bidIndex'"
		
		# set current bid
		self.currentBidIndex = bidIndex

		if bidIndex in self.topBids and bidAmount is self.topBids[bidIndex]:
			# if bid amount is the same as the top bid, return failure
			return {'success':False}
		else:
			# otherwise, increase top bid, and return success
			self.topBids[bidIndex] = bidAmount
			return {'success':True}
