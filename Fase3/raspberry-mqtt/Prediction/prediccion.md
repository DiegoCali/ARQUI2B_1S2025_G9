1. Instalar

```

pip install pandas prophet pymysql paho-mqtt

```
2. JSON: request & reply

* prediction_request
  
  ```
  {
  "dias": 5
   }
  ```
  
* prediction_response

  ```
   [
   {
      "distance": 14.69,
      "co2": 5.9,
      "temperature": 27.04,
      "humidity": 74.89,
      "light": 409.59,
      "current": 0.65,
      "date_time": "2025-04-28T21:41:45Z"
   },
   {
      "distance": 14.69,
      "co2": 5.9,
      "temperature": 27.04,
      "humidity": 74.89,
      "light": 409.59,
      "current": 0.65,
      "date_time": "2025-04-28T21:41:45Z"
   },
   ]
```

1. INFO Prophet lib

Prophet es una libreria creada por Facebook para predecir series de tiempo, datos como temperatura, ventas, entre otros. 
Usa internamente modelos estadísticos de regresión y estacionalidad para encontrar patrones y predecir futuros valores.

Prophet necesita dos cosas:

   * ds: fechas o tiempos
   * y: valores que quieres predecir (La data de los sensores)

En base a los datos enviado prophet realiza lo siguiente:

   * Si hay tendencias, es decir, si los valores suben o bajas.
   * Si existen patrones (estacionalidades)
   * Predecir en base a un intervalo de tiempo especifico