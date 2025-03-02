# Instrucciones
---
## ¿Cómo se mandará la información por serial?
---
Arduino mandará la información de esta forma:
```
[distance];[co2];[temperature];[humidity];[light];[current]\n
```
Donde todos serán valores flotantes, sus dimencionales son las siguientes:
- distance = cm
- co2 = ppm
- temperature = centigrados
- humidity = porcentage
- light = luxes ![mas info](https://todovisual.com/luminosidades-x-area.htm)
- current = amp
## Proceso:
---
Se deben leer los datos seriales, limpiarlos si es posible y mandarlos directamente a la base de datos en AWS.
```json
{
    "distance": 0.0,
    "co2": 0.0,
    "temperature": 0.0,
    "humidity": 0.0,
    "light": 0.0,
    "current": 0.0,
    "date-time": "YYYY-MM-DDTHH:MM:SSZ"
}
```
> [!IMPORTANT]
> Ademas de los datos de los sensores se deberá agregar un parámetro date-time para tener un record en la base de datos.
*La API se puede hacer con NodeJs o Python*
