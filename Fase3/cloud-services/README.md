# Cloud Services
Esto consta de 3 secciones, la base de datos en la nube, grafana y la predicción de datos en python. Se tiene que hacer una estructura que junte las tres o que, por separado, se comuniquen entre ellas.

## Base de datos
La base de datos será una tabla con los datos de nuestro arduino, simplemente compartir las llaves y autenticaciones **NO AQUI** por motivos de seguridad.

## Grafana
Grafana se conectará con la base de datos para mostrar visualizaciones de cada sensor además de un mapa de calor.

## Predicción en Python:
Esto también debe conectarse a la base de datos para hacer regresiones lineales y predecir el comportamiento futuro de los sensores, se requiere un mínimode 1 día y un máximo de 8 días de predicción, se recomienda en python por la gran cantidad de librerías que tiene este para el manejo de datos.

> [!IMPORTANT]
> **MUY IMPORTANTE**: no dejar claves de autenticación, ni conexión a la nube, ni puertos en el código utilizar entornos para guardar estas llaves y después compartirlas por otro medio **NO AQUI** por motivos de seguridad.