# mqtt_predictor.py
import json
import threading
import pandas as pd
from prophet import Prophet
import pymysql
from datetime import datetime, timedelta, timezone
import paho.mqtt.client as mqtt

# ------------------- PREDICCION
class SensorPredictor:
    def __init__(self, dias: int):
        if dias < 1 or dias > 8:
            print("(ERROR) El numero de dias debe ser 1- 8 ")
        self.dias = dias
        #LLAMA A a la db para CARGAR LOS DATOS
        self.data = self.db_sensor_conn()
        # VALORES QUE SE VAN A PREDECIR
        # distance, co2, temperature, humidity, light, current
        self.dataVariable = ['distance', 'co2', 'temperature', 'humidity', 'light', 'current']

# ------------------------------------------------------------------------

# --------------------------------- db connection -----------------------
    def db_sensor_conn(self):
        # dato de la db, nombre: data_sensor
        db_config = {
            "host": "arqui2db.cctkkcomupit.us-east-1.rds.amazonaws.com",
            "user": "admin",
            "password": "Arqui2DBProject*",
            "database": "arqui2db",
            "port": 3306
        }

        # ------------- CONEXION A LA DB
        connection = pymysql.connect(
            host=db_config["host"],
            user=db_config["user"],
            password=db_config["password"],
            database=db_config["database"],
            port=db_config["port"]
        )

#trycatch QUERY
        try:
#CUERSOS PARA REALIZAR LA QUERY, recibe datos como diccionario
            query_cursor = connection.cursor(pymysql.cursors.DictCursor)
            
    # ----------- datos de los ultimos 10 dias
            # CACLUKAR LA FECHA
            fecha_limite = (datetime.utcnow() - timedelta(days=10)).strftime('%Y-%m-%d %H:%M:%S')

            # SELECT, DATA --- MAX: 50
            query50 = f"""
                SELECT distance, co2, temperature, humidity, light, current, `date_time`
                FROM sensor_data
                WHERE `date_time` >= '{fecha_limite}'
                ORDER BY `date_time` DESC
                LIMIT 50;
            """
            # run query
            query_cursor.execute(query50)
            # obtiene todos los resultados
            results = query_cursor.fetchall()

            if not results:
                print("(ERROR) No existen datos en la db para los ultimos 10 dias)")

# ------------ DATA FRAME (para prophet)
            # El resultado de la query se vuelva la datafra,e
            df = pd.DataFrame(results)

            # calculo de fechas, 10 dias mas de cuando se esta haciendo la query
            if not df.empty:
                max_date = pd.to_datetime(df['date_time']).max().replace(tzinfo=timezone.utc)
                today = datetime.now(timezone.utc)
                delta = today - max_date

                # ajustar las fechas, max date siempre sera el dia 
                df['date_time'] = pd.to_datetime(df['date_time']) + delta - timedelta(days=1)

            # regresa el data frame con las fechas correctas
            return df

        finally:
            connection.close()
# -------------------------------------------------------------------

# ----------------------------PREDICCION VARIABLE POR VARIABLE ---------------------------
    def predictionSingleVariable(self, dataVariable):
        df = self.data[['date_time', dataVariable]].copy()
        # data frame de dos columnas, ds fecha y y valor
        df.columns = ['ds', 'y']
        df['ds'] = pd.to_datetime(df['ds']).dt.tz_localize(None)

        #se cre el modelo y se entrena
        modelo = Prophet()
        modelo.fit(df)

        # data frame con los 10 dias proximos
        start_date = datetime.now(timezone.utc).replace(tzinfo=None)
        diasPrediction = pd.DataFrame({
            'ds': pd.date_range(start=start_date, periods=self.dias, freq='D')
        })

        # PREDICCION SE HACE
        prediccion = modelo.predict(diasPrediction).tail(self.dias)

        # ajustar valores y fechas --- formato para el json
        valores = list(prediccion['yhat'].round(2))
        fechas = list(prediccion['ds'].dt.strftime('%Y-%m-%dT%H:%M:%SZ'))
        return valores, fechas
    
# -------------------------------------------------------------------
    def predictionGenerator(self):
        predicciones = {}
        fechas = None

# Predice el valor de cada variable y lo guarda
        for dataVariable in self.dataVariable:
            valores, diasPrediction = self.predictionSingleVariable(dataVariable)
            predicciones[dataVariable] = valores
            # solo guarda la fecha una vez
            if fechas is None:
                fechas = diasPrediction

    # FORMATO DEL RESULTADO: JSON Y ORDEN
        mergedResultado = []
        for i in range(self.dias):
            mergedResultado.append({
                "distance": predicciones["distance"][i],
                "co2": predicciones["co2"][i],
                "temperature": predicciones["temperature"][i],
                "humidity": predicciones["humidity"][i],
                "light": predicciones["light"][i],
                "current": predicciones["current"][i],
                "date_time": fechas[i]
            })

        return mergedResultado


# ------------------------------------ MQTT CONN
class MQTTPredictorHandler:
    def __init__(self, broker, port):
        self.client = mqtt.Client()
        self.broker = broker
        self.port = port
        self.root_topic = "arqui2_p2_g9"

        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
# CONN -------------------------------------------

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("CONECTADO AL BROKER")
            self.client.subscribe(f"{self.root_topic}/prediction_request") 
            print("Suscrito: prediction_request")
        else:
            print(f"(ERROR) NO SE PUDO CONECTAR {rc}")

# PREDICTION_REQUEST, RECIBE LOS DIAS A PREDECIR
    def on_message(self, client, userdata, msg):
        try:
            payload = msg.payload.decode()
            payload_json = json.loads(payload)

            if "dias" not in payload_json:
                raise ValueError("JSON de request mal estructurado")

            dias = int(payload_json["dias"])
            print(f"Dias a predecir:  {dias}")

            predictor = SensorPredictor(dias)
            prediction = predictor.predictionGenerator()

            result_json = json.dumps(prediction)
            self.publish_prediction(result_json)

        except Exception as e:
            print(f"(ERROR) ERROR CON EL MENSAJE DIAS: {e}")

#PREDICION_RESPONSE, ENVIA LA PREDICCION
    def publish_prediction(self, prediction_json):
        result = self.client.publish(f"{self.root_topic}/prediction_response", prediction_json)
        status = result[0]
        if status == 0:
            print("PREDICCION ENVIADA", prediction_json )
        else:
            print("(ERROR) NO SE PUDO MANDAR LA PREDICCION")
# ---------------- LOOP
    def loop_start(self):
        self.client.connect(self.broker, self.port, 60)
        self.client.loop_start()
        print("---------------- INICIO API MQTT--------------------")

    def loop_stop(self):
        self.client.loop_stop()
        self.client.disconnect()
        print("----------------- FIN API MQTT ---------------------")
