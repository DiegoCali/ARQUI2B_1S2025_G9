# Dashboard Local
El dashboard local se levantará en raspberry asi que es mejor si se usa `python` (aunque si da muchosproblemas puede usarse `js`) Este dashboard debe cumplir con las siguientes características.

- Lectura de los datos en el Broker MQTT
- Visualización con graficas de esos datos en tiempo real.
- Autenticación y Comandos con arduino.
- Envío de datos a la nube a la base de datos.

> [!NOTE]
> Los topics a los cuales conectarse se pueden ver [aqui](../raspberry-mqtt/README.md)

> [!IMPORTANT]
> **MUY IMPORTANTE**: no dejar claves de autenticación, ni conexión a la nube, ni puertos en el código utilizar entornos para guardar estas llaves y después compartirlas por otro medio **NO AQUI** por motivos de seguridad.

## ¿Qué significa la Autentiación y Comandos?
Esta sección debe poder conectarse con el servicio de AWS rekongition, debe enviar una imágen y recibir una respuesta.
Con respecto a los comandos, al recibir una respuesta positiva de el reconocimiento facial debe mandar un comando al topic `commands` para abrir la puerta, además de poner un botón quenos permita prender las luces desde el dashboard.

### Tener en cuenta para la comunicación serial:
-  El comando que se envía para abrir la puerta es `facetrue`
-  El comando para encender las luces es `1`
-  El comando para apagar las luces es `1`

## Gráficas
Las gráficas serán por cada sensor teniendo el formato que se tuvo en la segunda fase:
```
[distance];[co2];[temperature];[humidity];[light];[current]\n
```
> [!NOTE] 
> Sin embargo también se debe mostrar cuantas personas han entrado a travéz de la autenticación de la plataforma.

## Base de Datos:
Por último se deben mandar los datos del topic `arduino_data` a la base de datos en la nube. Seguir el mismo formato de la fase 2:

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

>[!NOTE]
> Si la aplicación es creada en python recordar hacer un `env` y **NO** mandar el `env`, sino mas bien mandar solamente un archivo **requirements.txt** al repositorio de github. El comando para esto es `pip freeze > requirements.txt`