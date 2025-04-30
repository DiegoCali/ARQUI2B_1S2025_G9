
from mqtt_prediction import MQTTPredictorHandler

if __name__ == "__main__":
    MQTT_BROKER = "broker.emqx.io"
    MQTT_PORT = 1883

    mqtt_handler = MQTTPredictorHandler(MQTT_BROKER, MQTT_PORT)
    mqtt_handler.loop_start()

    try:
        while True:
            pass  # mantiene escuchando
    except KeyboardInterrupt:
        print("\n ------------------------------- terminando main API ------------------")
        mqtt_handler.loop_stop()
