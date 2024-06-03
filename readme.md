# Smart Fridge

## Installation Raspberry
1. Node Red, Mosquito/Paho MQTT has to be installed on Raspery
2. Copy the all files inside of the folder raspi_files into the directory: Desktop/scripts/project
3. opencv-python package has to be installed
4. list devices with v4l2-ctl --list-devices if not sure which camera to choose. If not available install it first: sudo apt-get install v4l-utils
5. add your mongodb connection string to save_data_to_db.py
6. start terminal type: node-red-start.
7. Install node-red-contrib-chi-socketio node
8. import orchestrate.json
9. change ip-addresses for SocketIo and mqtt nodes
10. change mosquitto.conf for local connection - this might require you to be typing as sudo in the terminal(note this is not so secure, but okay for this project):
```python
# Place your local configuration in /etc/mosquitto/conf.d/
#
# A full description of the configuration file is at
# /usr/share/doc/mosquitto/examples/mosquitto.conf.example
pid_file /run/mosquitto/mosquitto.pid
persistence true
persistence_location /var/lib/mosquitto/
log_dest file /var/log/mosquitto/mosquitto.log
listener 1883 0.0.0.0
allow_anonymous true
include_dir /etc/mosquitto/conf.d
```

## Installation Windows
1. Check that the path to the dlib file in requirements.txt is correct
2. create new environment using pyenv with python version 3.12.1
3. check ip addresse in templates/global.js (ip adress of server application)
4. check ip addresse in flask_mqtt_websocket.py (ip adress of raspberry)
5. create .env file with your mogodb connection string the following code:
```python
mongodb = '<connectionString>'
```


