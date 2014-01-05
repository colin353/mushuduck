def printTree(tree, depth=0):
	if tree == None or len(tree) == 0:
		print "\t" * depth, "-"
	else:
		for key, val in tree.items():
			print "\t" * depth, key
			printTree(val, depth+1)