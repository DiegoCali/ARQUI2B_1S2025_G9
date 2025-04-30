import json
import paho.mqtt.client as mqtt

class MQTTHandler:
    def __init__(self, broker, port, root_topic, serial_handler):
        self.client = mqtt.Client()
        self.broker = broker
        self.port = port
        self.root_topic = root_topic
        self.serial_handler = serial_handler

        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT Broker!")
            self.client.subscribe(f"{self.root_topic}/commands")
        else:
            print(f"Failed to connect, return code {rc}")
    
    def on_message(self, client, userdata, msg):
        command = msg.payload.decode()
        print(f"Received `{command}` from `{msg.topic}` topic")
        self.serial_handler.write_line(command)

    def publish(self, data):
        # Check if the data is { "entered": true }
        result = None
        # First send all data to arduino_data topic
        if "entered" in data and data["entered"] == True:
            result = self.client.publish(f"{self.root_topic}/persons", json.dumps(data))
            status = result[0]
            if status == 0:
                print(f"Sent `{data}` to topic `persons`")
            else:
                print(f"Failed to send message to topic persons")
            return
        result = self.client.publish(f"{self.root_topic}/arduino_data", json.dumps(data))
        status = result[0]
        if status == 0:
            print(f"Sent `{data}` to topic `arduino_data`")
        else:
            print(f"Failed to send message to topic arduino_data")
        
        # Then send each data point to its respective topic
        for topic, msg in data.items():
            # Skip the date-time field
            if topic == "date-time":
                continue            
            send_data = {
                topic: msg,
                "date-time": data["date-time"]
            }
            result = self.client.publish(f"{self.root_topic}/{topic}", json.dumps(send_data))
            status = result[0]
            if status == 0:
                print(f"Sent `{msg}` to topic `{topic}`")
            else:
                print(f"Failed to send message to topic {topic}")
    
    def loop_start(self):
        self.client.connect(self.broker, self.port, 60)
        self.client.loop_start()
        print("MQTT Handler started")

    def loop_stop(self):
        self.client.loop_stop()
        self.client.disconnect()
        print("Disconnected from MQTT Broker")
        