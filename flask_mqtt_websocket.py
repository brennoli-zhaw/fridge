import eventlet
#from gevent import monkey
#monkey.patch_all()
import numpy as np
import json
import base64
import cv2
from flask import Flask, render_template, request
from flask_cors import CORS
from flask_mqtt import Mqtt
from flask_socketio import SocketIO
from flask_bootstrap import Bootstrap
from bson.json_util import dumps
eventlet.monkey_patch()
#mqtt from flask doesnt work to publish messages, that's why we use paho
import paho.mqtt.publish as publish

from face_recognition_mqtt import handle_image
from db_sensors import get_sensor_data_by_timestamp_range, get_sensor_data_of_date, get_sensor_data_of_month, \
get_sensor_data_of_year
from db_door_status import get_interactions_by_timestamp_range
from misc import convert_sensors_to_filter, convert_persons_to_filter

# those variables are used for the door status detection
last_status, persons, door_document = "", [], {"open": 0, "closed" : 0, "persons": ["Unknown"]}
debug = True

app = Flask(__name__, static_url_path='/', static_folder='templates')

app.config['SECRET'] = 'mysecretkey'
app.config['TEMPLATES_AUTO_RELOAD'] = True
#ip address of the broker
#raspi ip address
app.config['MQTT_BROKER_URL'] = '192.168.1.243'
app.config['MQTT_BROKER_PORT'] = 1883
app.config['MQTT_USERNAME'] = ''
app.config['MQTT_PASSWORD'] = ''
app.config['MQTT_KEEPALIVE'] = 60
app.config['MQTT_TLS_ENABLED'] = False
mqtt = Mqtt(app)

# Parameters for SSL enabled
# app.config['MQTT_BROKER_PORT'] = 8883
# app.config['MQTT_TLS_ENABLED'] = True
# app.config['MQTT_TLS_INSECURE'] = True
# app.config['MQTT_TLS_CA_CERTS'] = 'ca.crt'


socketio = SocketIO(app)
bootstrap = Bootstrap(app)
CORS(app, support_credentials=True)



@app.route('/')
def index():
    return render_template('index.html')

@app.post('/getMonthData')
def getMonthData():
    form = request.form.to_dict()
    month = form['month']
    year = form['year']
    filters = convert_sensors_to_filter(form['start_temperature'], form['end_temperature'], form['start_humidity'], form['end_humidity'], form['start_pressure'], form['end_pressure'])
    documents = get_sensor_data_of_month(int(year), int(month), filters)
    return dumps(documents)

@app.post('/getYearData')
def getYearData():
    form = request.form.to_dict()
    year = form['year']
    filters = convert_sensors_to_filter(form['start_temperature'], form['end_temperature'], form['start_humidity'], form['end_humidity'], form['start_pressure'], form['end_pressure'])
    documents = get_sensor_data_of_year(int(year), filters)
    return dumps(documents)

@app.post('/getDateData')
def getDateData():
    form = request.form.to_dict()
    timestamp = form['timestamp']
    filters = convert_sensors_to_filter(form['start_temperature'], form['end_temperature'], form['start_humidity'], form['end_humidity'], form['start_pressure'], form['end_pressure'])
    documents = get_sensor_data_of_date(float(timestamp), filters)
    return dumps(documents)


@app.post('/getTimestampRangeData')
def getTimestampRangeData():
    form = request.form.to_dict()
    start_timestamp = form['start_timestamp']
    end_timestamp = form['end_timestamp']
    filters = convert_sensors_to_filter(form['start_temperature'], form['end_temperature'], form['start_humidity'], form['end_humidity'], form['start_pressure'], form['end_pressure'])
    documents = get_sensor_data_by_timestamp_range(float(start_timestamp), float(end_timestamp), filters)
    return dumps(documents)

@app.post('/status')
def status():
    data = [last_status, persons]
    return dumps(data)

@app.post('/getTimestampRangeInteractions')
def getTimestampRangeInteractions():
    form = request.form.to_dict()
    start_timestamp = form['start_timestamp']
    end_timestamp = form['end_timestamp']
    persons = form['persons']
    filters = None
    if persons != "":
        filters = convert_persons_to_filter(persons)
    print(form)
    documents = get_interactions_by_timestamp_range(float(start_timestamp), float(end_timestamp), filters)
    return dumps(documents)

@mqtt.on_connect()
def handle_connections(client, userdata, flags, rc):
    mqtt.subscribe('webcam')
    mqtt.subscribe('sensors')

@mqtt.on_message()
def handle_mqtt_message(client, userdata, message):
    data = str(message.payload)[2:-1]
    if(message.topic == 'sensors'):
        socketio.emit('socket_sensors', data=data)
    elif(message.topic == 'webcam'):
        global last_status, persons, door_document, debug
        
        img = base64.b64decode(message.payload)
        nparr = np.frombuffer(img, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        personsbefore = persons.copy()
        frame, last_status, persons, door_document = handle_image(frame, last_status, persons, door_document)
        #has personbefore the same persons as persons?
        
        compare = personsbefore != persons
        if persons != [] and compare and last_status != "closed":
            socketio.emit('socket_led', data=dumps([last_status,persons]))
            
            print(persons)
        socketio.emit('socket_test', data=dumps([last_status,persons]))
        #socketio.emit('socket_led', data=[last_status,persons])
        im_encode = cv2.imencode(".jpg", frame)[1]
        string_im = str(base64.b64encode(im_encode))[2:-1]
        
        data = {
            "img" : string_im,
            "status" : last_status,
        }
        socketio.emit('socket_webcam', data=data)
        #show image from camera
        """ img = base64.b64decode(message.payload)
        nparr = np.frombuffer(img, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        cv2.imshow('Imagetest',frame)
        k = cv2.waitKey(1) """
            
            
    

""" @mqtt.on_log()
def handle_logging(client, userdata, level, buf):
    print(level, buf) """

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, use_reloader=False, debug=True)