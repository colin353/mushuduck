#!/bin/bash
screen -S -X python server.py
osascript open_in_safari.scpt
screen -r
