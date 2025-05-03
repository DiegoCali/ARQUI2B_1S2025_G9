import threading
import os

from dotenv import load_dotenv
from mqtt_handler import MQTTHandler
from serial_handler import SerialHandler
from db_handler import DBHandler

load_dotenv()

MQTT_BROKER = os.getenv("SERVER")
MQTT_PORT = int(os.getenv("PORT"))
MQTT_ROOT_TOPIC = os.getenv("ROOT_TOPIC")
SERIAL_PORT = os.getenv("SERIAL_PORT")
BAUD_RATE = int(os.getenv("BAUD_RATE"))

db_config = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
    "port": int(os.getenv("DB_PORT"))
}

def serial_reader_loop(serial_handler, mqtt_handler, db_handler):
    while True:
        try:
            data = serial_handler.read_line()
            if data:
                print(f"Data received: {data}")
                mqtt_handler.publish(data) 
                db_handler.insert_data(data)
        except Exception as e:
            print(f"Error reading serial data: {e}")
            break

if __name__ == "__main__":
    serial_handler = SerialHandler(SERIAL_PORT, BAUD_RATE)
    mqtt_handler = MQTTHandler(MQTT_BROKER, MQTT_PORT, MQTT_ROOT_TOPIC, serial_handler)
    db_handler = DBHandler(db_config)

    mqtt_handler.loop_start()

    try:
        serial_thread = threading.Thread(target=serial_reader_loop, args=(serial_handler, mqtt_handler, db_handler))
        serial_thread.start()
        serial_thread.join()
    except KeyboardInterrupt:
        print("Shutting down...")
        mqtt_handler.loop_stop()
        serial_handler.close()