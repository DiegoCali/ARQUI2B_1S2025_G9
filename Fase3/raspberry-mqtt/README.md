# MQTT Service:
Se levantará un broker MQTT en el que se conectará la nube y otras aplicaciones locales para la publicación de datos y comandos.

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
## commands
Aquí se publicarán los comandos que recibiráel arduino como:
- `1`: encender luz
- `0`: apagar luz
- `facetrue`: abrir la puerta
