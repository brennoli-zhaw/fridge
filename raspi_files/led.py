import sys
import json
import datetime
from sense_hat import SenseHat
import subprocess

sense = SenseHat()
noon = datetime.time(12, 0)
evening = datetime.time(20, 0)

status = sys.argv[1][sys.argv[1].find("[")+1:sys.argv[1].find(",")]
persons = sys.argv[1][sys.argv[1].find("[")+1:sys.argv[1].rfind("]")]
persons = persons[persons.find("[")+1:persons.rfind("]")]

#get current time
current_time = datetime.datetime.now().time()
noon = noon.strftime('%H:%M:%S').split(':')
noon = [int(i) for i in noon]
noonNumber = noon[0] * 3600 + noon[1] * 60 + noon[2]
evening = evening.strftime('%H:%M:%S').split(':')
evening = [int(i) for i in evening]
eveningNumber = evening[0] * 3600 + evening[1] * 60 + evening[2]
current_time = current_time.strftime('%H:%M:%S').split(':')
current_time = [int(i) for i in current_time]
current_timeNumber = current_time[0] * 3600 + current_time[1] * 60 + current_time[2]

if status == 'open' and noonNumber <= current_timeNumber <= eveningNumber:
    sense.clear((0, 255, 0))
    sense.show_message("hi " + persons, text_colour = (0,255,0))
elif status == 'open':
    sense.clear((255, 0, 0))
    sense.show_message("hi " + persons, text_colour = (255,0,0))
