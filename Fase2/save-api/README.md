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
- light = luxes (*Ver tabla de luxes al final*)
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
## Tabla de Luxes:
---
![luxes](https://images.squarespace-cdn.com/content/v1/60ee5f1d1975912dcfd14233/d2b8e35f-e8f9-42ff-b3a0-8d43e494dbd3/Ejemplo+de+niveles+de+luxes+permisibles+seg%C3%BAn+%C3%A1rea+de+trabajo.jpg)


## ¿Cómo correr la API?

```
    npm install mysql2
    node save_api.js
```    

Es necesario modificar el puerto segun el puerto que este usando el arduino y eliminar el insert quemado que esta en desde la linea 50 a la 84


```
    const serialPort = new SerialPort({
        path: 'COM3', // como estoy en window usa com, linux usa distinto puerto
        baudRate: 9600,
    });
```