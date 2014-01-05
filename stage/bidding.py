import stage

class BiddingStage(stage.Stage):

	def __init__(self, game):
		super(BiddingStage, self).__init__(game)
		
	def type(self):
		return 'Bidding'

	def afterBegin(self):
		# initialize a new bid
		# todo: change to be dynamic and random
		self.game.sendEventToAllPlayers('NewCard', {'index':0})

	def bid(self, sender, data):
		
		bidAmount = data['bidAmount'] if 'bidAmount' in data else return "the action 'bid' failed to include a string named 'bidAmount'"
		bidIndex = data['bidIndex'] if 'bidIndex' in data else return "the action 'bid' failed to include a string named 'bidIndex'"
		self.currentBidIndex = bidIndex

		if bidAmount is self.topBids[bidIndex]:
			# if bid amount is the same as the top bid, return failure
			return {'success':False}
		else:
			# otherwise, increase top bid, and return success
			self.topBids[bidIndex] = bidAmount
			return {'success':True}
