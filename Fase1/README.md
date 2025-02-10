# Instrucciones:
## ¿Qué es un modulo?
Es la combinación entre un sensor y la lógica que monitoriza los datos.
- Probar cada modulo en Tkinter
- Tomar captura del modulo y colocarlo en imgs/
- Crear una rama propia para el modulo. [nombre-modulo] (La rama debe originarse de develop)
- Descargar el código usado en Tkinter y guardarlo en la carpeta control-modules/
- Guardar los cambios y publicar la rama
- Al final se unirá todo en un archivo

## Cómo generar código limpio
Como vieron, en el último commit mezcle los modulos que escribieron ya en la lógica del arduino. De ahora en adelante necesito que escriban sus módulos de manera que sean faciles de copiar y reutilizables. Con esta plantilla
```Cpp
// Definiciones de sus variables globales.
int args;

void setup() {
  // put your setup code here, to run once:

}

float functionController(int args){
    // Logica de su controlador y conversion de datos
    float response;
    // ...
    return response;
}

void loop() {
  // Llamada de sufunción del controlador
  float response = functionController(args);
  // ...
}
```