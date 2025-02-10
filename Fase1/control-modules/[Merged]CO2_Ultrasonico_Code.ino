#include <Adafruit_LiquidCrystal.h>

/* ULTRASONICO - DETECTAR PERSONA */

//********led ****
int LED = 6;   // Pin digital 6

// ************ SENSOR
// TRIG - signal de salida. arduino -> sensor
int TRIG = 13; // Pin digital 13

// signal de entrada al arduino - al rebotar activa el echo.
int ECHO = 12; // Pin digital 12

// arduino mide el tiempo en el que echo estuvo en high
int echoTime;

// se va a calcular
int distancia = 0;

// CO2 Sensor
int CO2_Sensor = 0;
Adafruit_LiquidCrystal lcd_1(0); // Inicializa el LCD

void setup(){
  pinMode(TRIG, OUTPUT); // Salida
  pinMode(ECHO, INPUT);  // Entrada
  pinMode(LED, OUTPUT);  // Pin como Salida
  pinMode(A0, INPUT);    // ANALOG --> INPUT para leer la data
  
  Serial.begin(9600); // Inicio serial
  lcd_1.begin(16, 2); // 16 columnas y 2 filas
  lcd_1.setCursor(0, 0); // Empieza en la esquina izq
  lcd_1.print("  CO2 Sensor "); 
  lcd_1.print("              ");
}

void loop(){
  // *** activacion del trig - envio y recepcion
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10); // Aumentado para mayor precisión
  digitalWrite(TRIG, LOW);
  
  // *** tiempo de respuesta - medir
  echoTime = pulseIn(ECHO, HIGH);
  
  // *** se calcula la distancia
  distancia = echoTime / 58.2; 
  
  if (distancia < 15){
    digitalWrite(LED, HIGH);
    Serial.print("Detectado: ");
    Serial.print(distancia);
    Serial.println(" cm");
  }
  else{
    digitalWrite(LED, LOW);
    Serial.println("-----");
  }
  
  // Leer valores del sensor de CO2
  CO2_Sensor = analogRead(A0);
  Serial.print("CO2: ");
  Serial.println(CO2_Sensor);
  
  // Mostrar valores en el LCD
  lcd_1.setCursor(0, 0);
  lcd_1.print("CO2: ");
  lcd_1.print(CO2_Sensor);
  lcd_1.print("     "); // Limpiar espacio sobrante
  
  delay(500); // Pequeña pausa para actualización
}
