1. Instalar

```
pip install pandas prophet
pip install pymysql

```


1. Prophet lib

Prophet es una libreria creada por Facebook para predecir series de tiempo, datos como temperatura, ventas, entre otros. 
Usa internamente modelos estadísticos de regresión y estacionalidad para encontrar patrones y predecir futuros valores.

Prophet necesita dos cosas:

   * ds: fechas o tiempos
   * y: valores que quieres predecir (La data de los sensores)

En base a los datos enviado prophet realiza lo siguiente:

   * Si hay tendencias, es decir, si los valores suben o bajas.
   * Si existen patrones (estacionalidades)
   * Predecir en base a un intervalo de tiempo especifico