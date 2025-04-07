import random
import time
import json
import os
import signal

from paho.mqtt import client as mqtt_client
from dotenv import load_dotenv

load_dotenv()
MQTT_BROKER = os.getenv("SERVER")
MQTT_PORT = int(os.getenv("PORT"))
ROOT_TOPIC = os.getenv("ROOT_TOPIC")
MQTT_USERNAME = os.getenv("USERNAME")
MQTT_PASSWORD = os.getenv("PASSWORD")

client_id = f'publish-{random.randint(0, 100)}'

def connect_mqtt():
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT Broker!")
        else:
            print(f"Failed to connect, return code {rc}")
    client = mqtt_client.Client(client_id)
    client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
    client.on_connect = on_connect
    client.connect(MQTT_BROKER, MQTT_PORT)
    return client

def publish(client):
    topic = f"{ROOT_TOPIC}/arduino_data"    
    while True:
        time.sleep(5)
        # Read data from the sensors that come from serial port connected to the Arduino        
        msg = {
            "distance": random.randint(1, 100),
            "co2": random.randint(400, 1000),
            "temperature": random.randint(20, 30),
            "humidity": random.randint(30, 70),
            "light": random.randint(0, 100),
            "current": random.randint(0, 100),
            "date-time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        result = client.publish(topic, json.dumps(msg))
        status = result[0]
        if status == 0:
            print(f"Sent `{msg}` to topic `{topic}`")
        else:
            print(f"Failed to send message to topic {topic}")      

# When ^C is pressed, the program will stop
def signal_handler(sig, frame, client):
    print('\nExiting...')    
    client.loop_stop()
    client.disconnect()
    exit(0)       

def run():
    client = connect_mqtt()
    signal.signal(signal.SIGINT, lambda sig, frame: signal_handler(sig, frame, client))
    signal.signal(signal.SIGTERM, lambda sig, frame: signal_handler(sig, frame, client))
    client.loop_start()
    publish(client)

if __name__ == '__main__':    
    run()   