

---
##  Prototipos - Módulos
* Sensor ultrasónico

El uso del sensor ultrasonico se debe a la necesidad de detectar la presencia de una persona, esto mediante la medicion de la distancia a la que se encuentra del propio sensor. 
Primero se asignaron los pines específicos para el LED y para el sensor ultrasónico, donde `TRIG` envía la señal de disparo y `ECHO` recibe el eco que indica la distancia
```
int TRIG = 13; 

int ECHO = 12; 
```

Posteriormente, en el area de setup se establecen los modos de entrada y salida para cada pin y se inicia la comunicación serial para la visualización de datos.

```
void setup(){
  
  pinMode(TRIG, OUTPUT); //Salida
  pinMode(ECHO, INPUT);  //Entrada
  
  pinMode(LED, OUTPUT);  
  Serial.begin(9600); 
}
```
En el loop, se activa el pin de Trigger para enviar un pulso ultrasónico muy breve. Luego, se mide el tiempo que tarda en recibir el eco mediante `pulseIn` en el pin `ECHO`.  La distancia se calcula dividiendo el tiempo de eco entre 58.2 (para convertirlo a centímetros).

![ObtenerLink](https://i.postimg.cc/ZnqMqWN3/ultrasonico-Tinker.png)



* Sensor CO2

En este caso se diseño un circuito pueda manejar un display LCD y mostrar la lectura de dicho sensor. Primero se establece la librería necesaria para controlar la LCD.
```
#include <LiquidCrystal_I2C.h>

```
Luego es necesario declarar una variable, en donde se almacenara la lectura analógica proveniente del pin analógico al que se encuentra conectado. 
En el setup, es necesario declarar el pin analógico como un pin de entrada para posteriormente poder leer los valores en el Loop
```
CO2_Sensor = analogRead(A0); 

```

![ObtenerLink](https://i.postimg.cc/tTpcLSCB/CO2-Tinker.png)


* Monitoreo Lumínico
En este caso se buscaba añadir el monitoreo lumínico al funcionamiento, para esto al inicio se asignan los pines y variables necesarias.
```
const int pinLDR = A1; 
luz (LDR) int valorLDR = 0;

```
Posteriormente, se define en la función `functionController` la lectura de dicho sensor y  cuando ya se haya leído, el valor se imprime en el monitor serial junto con la medición de distancia:
```
valorLDR = analogRead(pinLDR);
Serial.print("Luz: "); Serial.println(valorLDR);
```
Por ultimo, valor del sensor de luz se utiliza para determinar si el ambiente tiene "poca luz", si la intensidad de luz es baja (valorLDR ≤ 500) y se detecta un objeto a 200 cm o menos, se activan los LED 
![ObtenerLink](https://i.postimg.cc/QMLwqxLG/Monitoreo-Luminico-Tinker.png)


* Sensor de temperatura y humedad
Para el monitoreo de temperatura y humedad al inicio se define el pin y el tipo del sensor DHT22, y se crea un objeto `dht` para gestionar las lecturas
```
// Configuración del sensor DHT22 
#define DHTPIN A3 
#define DHTTYPE DHT22 
DHT dht(DHTPIN, DHTTYPE);
```
Luego se obtiene los valores de dichas lecturas y se establece el manejo de errores en caso de que alguna lectura no sea valida.
```
float humedad = dht.readHumidity();
float temperatura = dht.readTemperature();

// Verificar si la lectura es válida
if (isnan(temperatura) || isnan(humedad)) {
    lcd.setCursor(0, 0);
    lcd.print("Error leyendo");
    lcd.setCursor(0, 1);
    lcd.print("DHT22...");
    delay(2000);
    return -1;
}

```

Una vez validados, se muestran en pantalla los valores actuales de temperatura y humedad. Según la temperatura medida se cada una de las distintas LEDs. 
-   **≥ 30°C:** Se enciende el LED **rojo** para indicar una temperatura alta.
-   **≤ 18°C:** Se enciende el LED **azul** para indicar una temperatura baja.
-   **Entre 18°C y 30°C:** Se enciende el LED **verde** para indicar una temperatura moderada.

![ObtenerLink](https://i.postimg.cc/HnPP8T0N/Temp-Humedad-Wokwi.jpg)


* Boceto Keypad
El objetivo del diseño era crear el menú inicial necesario para la practica a través del keypad y probar el mismo con algunos de los sensores ya trabajados. El menu inicial permite: 

	-   **Navegar entre opciones:**  
	    Permite alternar entre "DATA en vivo" y "Historial EEPROM".
	    
	-   **Seleccionar opciones:**  
	    Con la tecla de selección se muestra la opción elegida (por ejemplo, visualizar datos en vivo o recuperar datos almacenados).
	    
	-   **Ejecutar acciones adicionales:**  
	    Algunas teclas permiten guardar datos en la EEPROM o regresar al menú

	Al inicio se define una matriz de 4 filas por 4 columnas, se asignan los caracteres correspondientes y se especifican los pines conectados.

```

const byte numRows = 4; // Filas
const byte numCols = 4; // Columnas

// Mapeo de teclas
char keymap[numRows][numCols] = 
{
  {'1', '2', '3', 'A'}, 
  {'4', '5', '6', 'B'}, 
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};

// Pines para filas y columnas
byte rowPins[numRows] = {9, 8, 7, 6}; 
byte colPins[numCols] = {5, 4, 3, 2}; 

// Instancia del Keypad
Keypad myKeypad = Keypad(makeKeymap(keymap), rowPins, colPins, numRows, numCols);

```
Posteriormente,  se lee continuamente la tecla presionada y de acuerdo al valor de la misma se realizan actividades especifias.
```
lcd_key = myKeypad.getKey();
```
* Keypad Layout

![ObtenerLink](https://i.postimg.cc/jqhGVKbb/Keypad-Lay-Out.png)


![ObtenerLink](https://i.postimg.cc/43zM2kZK/Merged-Epprom-Keypad.png)


---
##  Processing
Para esta practica se hizo uso de un archivo de processing para crear una interfaz que muestre en tiempo real lo datos enviados a traves del puerto serial. El formato fue el siguiente: 
```
temperature;humidity;distance;light;co2\n
```
Al incicio, en en Setup() se configura una ventana  de 512x 512 pixeles y se indica que se debe esperar un salto de linea '\n' para el procesamiento de cada conjunto de datos.
```
void setup() {
    size(512, 512);
    try {
        myPort = new Serial(this, "/dev/ttyACM0", 9600);
        myPort.bufferUntil('\n');
    } catch (Exception e){
        println("Error opening serial port");
    }        
}
```
En cada una de las iteraciones de draw(), en caso se reciba una cadena valida, esta se separa en los cinco componentes especificados al inicio.
* Visualizacion
La ventana se divide en 4 cuadrantes:

    - Cuadrante superior izquierdo 
Se encarga de mostrar la temperatura y el nivel de humedad detectado.

    - Cuadrante superior derecho
En este cuadrante se muestra la distancia medida, para esto se usa la funcion "drawRadar".

    - Cuadrante inferior izquierdo
Para mostrar el estado del sensor de luz se dibuja una bombilla que se ilumina dependiendo del estado del sensor de luz.

    - Cuadrante inferior derecho
En este cuadrante se muestra el resultado de la medicion de CO2 en porcentaje .


![ObtenerLink](https://i.postimg.cc/28s2KR2W/Processing.jpg)

---
##  Maqueta

 # -   Proceso
El objetivo principal de la maqueta consistía en desarrollar un Sistema Inteligente de Monitoreo Ambiental para Cuartos de Servidores mediante IoT. Por ello, se estableció que la maqueta debía ser lo suficientemente espaciosa para que la presencia de los sensores no redujera el espacio disponible ni afectara la estética visual.

Tomando en cuenta los sensores a utilizar, se determinaron dimensiones de 29 × 27 centímetros. A partir de ahí, se inició el proceso de diseño de los ambientes y la distribución de los sensores.

Los sensores fueron colocados en lugares estratégicos para garantizar su correcto funcionamiento sin comprometer la armonía visual. Se buscó que su presencia pasara lo más desapercibida posible, manteniendo un equilibrio entre funcionalidad y estética. Así comenzó el proceso de instalación de los sensores:

![ObtenerLink](https://i.postimg.cc/HnxVLdFS/Sensor1.png)
![ObtenerLink](https://i.postimg.cc/sxN1Qbr3/Sensor2.png)
![ObtenerLink](https://i.postimg.cc/1RC8jVNb/Sensor3.png)

 * Props

Debido a la naturaleza de la maqueta, es necesario el uso de material que ayude a simular de forma correcta el espacio que se quiere replicar. 

Es por eso que se elaboraron torres de servidores, con el objetivo de ambientar y mejorar la presentacion de la maqueta.

 * Torre 1
![ObtenerLink](https://i.postimg.cc/CKsCFnVt/torre-Servidor-1.jpg)

* Torre 2
![ObtenerLink](https://i.postimg.cc/658hdQd2/torre-Servidor-2.jpg)

* Torre 3
![ObtenerLink](https://i.postimg.cc/wBpc8cnL/torre-Servidor-3.jpg)

![ObtenerLink](https://i.postimg.cc/gjJHtzQ7/torre-Servidor-Full.jpg)
    
