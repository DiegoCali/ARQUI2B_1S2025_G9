import pandas as pd
from prophet import Prophet
import pymysql
import json
from datetime import datetime, timedelta, timezone

# LA CLASE QUE VA A REALIZAR LA PREDICCION DE LOS SENSORES
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

# ---------------- - MAIN -------------------
if __name__ == "__main__":
    dias = 7  # LOS DIAS QUE SE VAN A PREDECIR
    prophetPrediction = SensorPredictor(dias)
    #prediccion: {distance, co2, temperature, humidity, light, current}
    finalPrediction = prophetPrediction.predictionGenerator()
    # print(finalPrediction)
    print(json.dumps(finalPrediction, indent=4))
