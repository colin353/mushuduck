import pprint
import signal
import threading

def treeDict(d, indent=4):
	return pprint.pformat(d, indent=indent)

def append_signal(sig, f):

	old = None
	if callable(signal.getsignal(sig)):
		old = signal.getsignal(sig)

	def helper(*args, **kwargs):
		f(*args, **kwargs)
		if old is not None:
			old(*args, **kwargs)

	signal.signal(sig, helper)

def timer(*args, **kwargs):
	timer = threading.Timer(*args, **kwargs)
	timer.daemon = True
	return timer

class lcolors(object):
	HEADER = '\033[95m'
	OKBLUE = '\033[94m'
	OKGREEN = '\033[92m'
	WARNING = '\033[93m'
	OUTGOING = '\033[36m'
	FAIL = '\033[91m'
	ENDC = '\033[0m'

	@classmethod
	def disable(self):
		self.HEADER = ''
		self.OKBLUE = ''
		self.OKGREEN = ''
		self.WARNING = ''
		self.OUTGOING = '\033[36m'
		self.FAIL = ''
		self.ENDC = ''

def printHeader(str):
	print lcolors.HEADER + str + lcolors.ENDC

def cprint(str, header):
	print header + str + lcolors.ENDC

if __name__ == '__main__':
	pass