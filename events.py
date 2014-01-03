class EventDispatcher:

	def send(self, recipient, message):
		recipient.write_message(message)