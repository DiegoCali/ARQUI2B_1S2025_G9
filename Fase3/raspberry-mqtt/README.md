# MQTT Service:
Se levantará un broker MQTT en el que se conectará la nube y otras aplicaciones locales para la publicación de datos y comandos.

# Topics:
## arduino_data
Aquí se publicarán los datos recopilados del arduino con este formato:
```
[distance];[co2];[temperature];[humidity];[light];[current]\n
```
## commands
Aquí se publicarán los comandos que recibiráel arduino como:
- `1`: encender luz
- `0`: apagar luz
- `facetrue`: abrir la puerta