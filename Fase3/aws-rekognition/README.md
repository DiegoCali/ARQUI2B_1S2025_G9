# AWS face rekognition

Se debe usar este servicio para entrenar los rostros que van a usarse para entrar a la maqueta, además de compartir las credenciales para el uso de este. Especificar como se mandan los datos y la respuesta que manda.

> [!IMPORTANT] > **MUY IMPORTANTE**: no dejar claves de autenticación, ni conexión a la nube, estas deben ser compartidas por otro medio, **NO AQUI**, por motivos de seguridad.

## Envio de datos:

```json
{
  //...
}
```

## Respuesta:

```json
{
  //...
}
```

orden ejecucion
python CrearColeccion.py
python MirarColecciones.py
python SubirColecciones.py mi-coleccion ruta/imagen.jpg Rostro*nombre*
python ReconocerImagen.py ruta/imagen.jpg
