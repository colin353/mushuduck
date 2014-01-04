import tornado.ioloop
import tornado.web
import tornado.websocket
import time
import inspect
import json
from game import Game

# Configurable parameters for the server:
# -------------------------------------- #
# PORT: the operating port
PORT 		= 8888
RUN_DATE 	= time.strftime( "%H:%M:%S on %B %d %Y" )
VERSION 	= 0
# -------------------------------------- #

RESPONSE 	= 1

# The JHandler handles WebSocket communication
# with the Javascript on the browser. It answers
# requests and so forth from the browser. Eventually,
# it will behave as a wrapper to another thing that
# will interface with measurement devices.
class JHandler(tornado.websocket.WebSocketHandler):
	def open(self):
		print "Opening..."
		staticGame.addPlayerWithHandler(self)

	def on_message(self, msg):
		print "Message received: %s " % msg 
		message = json.loads(msg)

		# The default response: it should be overwritten, or else some
		# kind of internal problem occured.
		response = "Transaction failed to handle: internal assertion failure occurred."

		# If the message is a transaction, it'll contain a 
		# transaction ID. Then we need to do whatever it is asking
		# for and then response using the same transaction ID.
		if 'transaction_id' in message:
			messageData = message['data']
			# The result is an actionable transaction with optional data. 
			transactionAction = messageData['action'] if 'action' in messageData else None
			transactionData = messageData['data'] if 'data' in messageData else None
			if transactionAction:
				response = actionablerequesthandler.invoke(transactionAction, self, transactionData)
			else:
				response = "Invalid action: no action specified";
		else:
			response = "Invalid transaction: no transaction ID specified"

		# Need to respond with the correct format. The format must include
		# the actual data response under "data" and the transaction id that
		# it is responding to under "transaction_id" in order to be valid.
		self.write_message( json.dumps ( {'data': response, 'transaction_id': message['transaction_id'] } ) )

	def on_close(self):
		print "Closing..."
		staticGame.removePlayerWithHandler(self)
		## todo: delete player

# The JActionableRequestHandler class basically completes actions that the browser
# asks of it. It should be spoken to through the "invoke" function, which basically
# searches to see if the actionablerequesthandler can handle that action, and if so,
# does whatever is necessary. You could also return a hash from the actionable
# functions, and then the system will JSON your return value.
class JActionableRequestHandler:

	def invoke(self, action, sender, data):
		print "Attempted to invoke action %s" % action

		# create dictionary of arguments to be passed into the corresponding function call of the action
		args = {'sender':sender, 'data':data}
		args = dict((arg,value) for arg,value in args.iteritems() if value is not None)

		if hasattr(self, action):
			return getattr(self, action)(**args)
		else:
			return "Invalid action: action %s is not implemented." % action

	# This function tells us some information about the current running version
	# of the server, etc. 
	def validate_version(self, sender):
		return {
			'start_date'	: "Program started: %s " % RUN_DATE,
			'version'		: VERSION
		}

	def bump(self, sender, data):

		if 'items' in data:
			items = data['items']
		else:
			sender.write_message("the action 'bump' failed to include a dictionary named 'item'")

		staticGame.bump(sender, items)
		return { }

	def ready(self, sender):
		staticGame.markReady(sender)
		return { }

# The global actionablrequesthandler: there is only one instance of this, 
# even though there may be many instances of JHandlers for different clients.
# This means we can hog things like serial connections to thermometry devices, 
# etc. and not worry about having clashes, etc.
actionablerequesthandler = JActionableRequestHandler()

# This static file handler override class is used
# to force caching to be turned off for all static
# files, which is a debugging measure.
class DebugStaticFileHandler(tornado.web.StaticFileHandler):
	def set_extra_headers(self, path):
		# This is necessary to prevent Chrome from caching everything. Can be safely
		# removed when debugging is over.
		self.set_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')

application = tornado.web.Application( [
	(r"/json", JHandler),
	(r"/()", DebugStaticFileHandler, {'path': 'web.html'} ),
	(r"/(.*)", DebugStaticFileHandler, {'path': '.'}),
])

# make a game
staticGame = Game()

# This starts the application
application.listen(PORT)
# This: I have no idea what it does.
tornado.ioloop.IOLoop.instance().start()