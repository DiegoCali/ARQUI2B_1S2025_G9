
import pandas as pd
from prophet import Prophet
import json

# LA CLASE QUE VA A REALIZAR LA PREDICCION DE LOS SENSORES
class SensorPredictor:
    # -----------------Revision de dios: 1-8-----------------------------------------------
    def __init__(self, dias: int):
        if dias < 1 or dias > 8:
            raise ValueError("(Error) El número de dias debe ser 1-8.")
    # ------------------------------------------------------------------------
        self.dias = dias
        # aca es donde se cargan los data en formato: DATA FRAME
        self.data = self.db_data()  
        # aca se establecen las variables que se van a predecir
        self.dataVariable = ['distance', 'co2', 'temperature', 'humidity', 'light', 'current']

# -----------------------------------DATA: Aca de debe agregar despues la info de la db-----------------------------------
    def db_data(self):
        data = [
            {"distance": 10, "co2": 400, "temperature": 22, "humidity": 55, "light": 200, "current": 0.5, "date-time": "2025-04-01T00:00:00Z"},
            {"distance": 11, "co2": 405, "temperature": 23, "humidity": 56, "light": 210, "current": 0.6, "date-time": "2025-04-02T00:00:00Z"},
            {"distance": 10, "co2": 398, "temperature": 21, "humidity": 54, "light": 190, "current": 0.4, "date-time": "2025-04-03T00:00:00Z"},
            {"distance": 12, "co2": 410, "temperature": 24, "humidity": 57, "light": 220, "current": 0.7, "date-time": "2025-04-04T00:00:00Z"},
            {"distance": 10, "co2": 400, "temperature": 22.5, "humidity": 55.5, "light": 205, "current": 0.5, "date-time": "2025-04-05T00:00:00Z"},
            {"distance": 10, "co2": 402, "temperature": 22.2, "humidity": 55.2, "light": 203, "current": 0.52, "date-time": "2025-04-06T00:00:00Z"},
            {"distance": 11, "co2": 407, "temperature": 23.5, "humidity": 56.5, "light": 215, "current": 0.6, "date-time": "2025-04-07T00:00:00Z"},
            {"distance": 11, "co2": 406, "temperature": 23.0, "humidity": 56.0, "light": 212, "current": 0.58, "date-time": "2025-04-08T00:00:00Z"}
        ]
        # La data se debe convertir en una DATAFRAME
        return pd.DataFrame(data)  
# --------------------------------------------------------------------------------------

# ----------------------------------------MAIN FUNCTION: esta entrena al prophet en base a una variable (por eso luego se hacer un loop de ella con cada variable) -----------------------------------------------
    def predictionSingleVariable(self, dataVariable):
        # tabla con fecha y valor --- dataVariable= nombre de la variable a predecir
        df = self.data[['date-time', dataVariable]].copy()
        df.columns = ['ds', 'y']  # Prophet necesita estos nombres exactos

        # ---------------- se elimina la zona horaria que viene con la timestamp
        df['ds'] = pd.to_datetime(df['ds']).dt.tz_localize(None)

        # ------------------------ se crea el modelo y se entrena (fit)
        modelo = Prophet()
        modelo.fit(df)

        # ------------------------ Aca es donde se crean las predicciones segun las fechas al fututo 1-8
        diasPrediction = modelo.make_future_dataframe(periods=self.dias)

        # ------------------------ Se hace la prediccion de los valores para esa variable
        prediccion = modelo.predict(diasPrediction).tail(self.dias)

        # ------------------------ resultado
        valores = list(prediccion['yhat'].round(2))
        fechas = list(prediccion['ds'].dt.strftime('%Y-%m-%dT%H:%M:%SZ'))
        return valores, fechas

# --------------------------------------------------------------------------------------
# -------------------Crea el arreglo para enviar y predice cada uno de los data--------------------------------------------
    def predictionGenerator(self):
        predicciones = {}
        fechas = None

        # ---------------------  loop por cada variable y se predice
        for dataVariable in self.dataVariable:
            valores, diasPrediction = self.predictionSingleVariable(dataVariable)
            predicciones[dataVariable] = valores
            if fechas is None:
                fechas = diasPrediction

        # --------------------- Luego de tener las predicciones para los dias enviados estas se unen en un solo json
        mergedResultado = []
        for i in range(self.dias):
            mergedResultado.append({
                "distance": predicciones["distance"][i],
                "co2": predicciones["co2"][i],
                "temperature": predicciones["temperature"][i],
                "humidity": predicciones["humidity"][i],
                "light": predicciones["light"][i],
                "current": predicciones["current"][i],
                "date-time": fechas[i]
            })

        return mergedResultado
# --------------------------------------------------------------------------------------

# ---------- se ejecuta 
if __name__ == "__main__":
    dias = 3  # los dias a predecir 1-8
    prophetPrediction = SensorPredictor(dias)
    finalPrediction = prophetPrediction.predictionGenerator()

    # ------------- Solo se imprime el resultado por el momento
    print(json.dumps(finalPrediction, indent=4))
