# MQTT Service:
Se levantará un broker MQTT en el que se conectará la nube y otras aplicaciones locales para la publicación de datos y comandos.

# Levantar el servicio:
>[!NOTE]
> Tener en cuenta que se necesita un SO debian based (en este caso se probó con Kubuntu y Raspbian)

Para comenzar es necesario levantar un entorno virtual con python:
```bash
python3 -m venv venv
source venv/bin/activate
```
Después se deben instalar las dependecias:
```bash
pip install -r requirements.txt
```
Despues necesitamos crear un archivo `.env` para nuestras credenciales:
```
SERVER=[dirección de nuestro broker]
PORT=[puerto abierto]
ROOT_TOPIC=[El root topic que se usará]

SERIAL_PORT=[puerto serial del dispositivo por ejemplo: /dev/ttyACM0]
TEST_PORT=/dev/pts/2 (Puerto serial virtual si no se tiene un dispositivo extra)
BAUD_RATE=9600
```
Si no se tiene un dispositivo que se comunique serialmente, se puede emular con los siguientes comandos:
Primero levantamos un puerto serial virtual.
```bash
socat -d -d pty,raw,echo=0 pty,raw,echo=0
```
Salida:
```bash
2013/11/01 13:47:27 socat[2506] N PTY is /dev/pts/2 # Puerto que leerá la aplicación, es nuestro TEST_PORT
2013/11/01 13:47:27 socat[2506] N PTY is /dev/pts/3 # Puerto que usaremos para enviar datos
2013/11/01 13:47:27 socat[2506] N starting data transfer loop with FDs [3,3] and [5,5]
```
¿Cómo mandamos datos?:
```bash
echo "Test" > /dev/pts/3
```
Formato serial de datos:
```
[distance];[co2];[temperature];[humidity];[light];[current]\n
```
# Topics:
## arduino_data
Aquí se publicarán los datos recopilados del arduino con este formato:
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
Además existirán topics individuales para cada sensor:
### distance:
```json
{
    "distance": 0.0,
    "date-time": "YYYY-MM-DDTHH:MM:SSZ"
}
```
### co2:
```json
{
    "co2": 0.0,
    "date-time": "YYYY-MM-DDTHH:MM:SSZ"
}
```
### temperature:
```json
{
    "temperature": 0.0,
    "date-time": "YYYY-MM-DDTHH:MM:SSZ"
}
```
### humidity:
```json
{
    "humidity": 0.0,
    "date-time": "YYYY-MM-DDTHH:MM:SSZ"
}
```
### light:
```json
{
    "light": 0.0,
    "date-time": "YYYY-MM-DDTHH:MM:SSZ"
}
```
### current:
```json
{
    "current": 0.0,
    "date-time": "YYYY-MM-DDTHH:MM:SSZ"
}
```
## commands:
Aquí se publicarán los comandos que recibirá el arduino como:
- `1`: encender luz
- `0`: apagar luz
- `facetrue`: abrir la puerta
```json
{
    "command": "facetrue"    
}
```

> [!NOTE] 
> Para la visualización de datos se puede usar MQTTX
