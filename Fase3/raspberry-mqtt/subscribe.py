import random
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
client_id = f'subscribe-{random.randint(0, 100)}'

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

def subscribe(client: mqtt_client):
    def on_message(client, userdata, msg):
        print(f"Received `{msg.payload.decode()}` from `{msg.topic}` topic")
    topic = f"{ROOT_TOPIC}/commands"
    client.subscribe(topic)
    client.on_message = on_message

# When ^C is pressed, the program will stop
def signal_handler(sig, frame, client):
    print('\nExiting...')    
    client.loop_stop()
    client.disconnect()
    exit(0)

def run():
    client = connect_mqtt()
    signal.signal(signal.SIGINT, lambda sig, frame: signal_handler(sig, frame, client))    
    subscribe(client)    
    client.loop_forever()

if __name__ == '__main__':
    run()