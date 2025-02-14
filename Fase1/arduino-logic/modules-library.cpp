#include "modules-library.h"
float DISTANCE = 0;
float ECHO_TIME = 0;

float ultrasonicController(int LED, int TRIG, int ECHO){
  // *** activacion del trig - envio y recepcion
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(1);
  digitalWrite(TRIG, LOW);
  delayMicroseconds(1);
  
  // *** tiempo de respuesta - medit
  ECHO_TIME = pulseIn(ECHO, HIGH);
  
  // *** se vuelve la DISTANCE
  DISTANCE = ECHO_TIME/58.2; 
  
  if (DISTANCE < 15){
    digitalWrite(LED, HIGH);               
  }
  else{
    digitalWrite(LED, LOW);      
  }
  return DISTANCE;  
}

float co2Controller(int ANALOG_READ) {  
  float PERCENTAGE = analogRead(ANALOG_READ)/1.0; // leer los valores  
  delay(100);
  return PERCENTAGE;
}

float temperatureController(DHT dht){
  float TEMPERATURE = dht.readTemperature();
  delay(500);
  return TEMPERATURE;
}

float humidityController(DHT dht){
  float HUMIDITY = dht.readHumidity();
  delay(100);
  return HUMIDITY;
}

float luminousController(int PHOTO_SIG){
  float LUMINOUS_SIGNAL = analogRead(PHOTO_SIG)/1.0;
  delay(100);
  return LUMINOUS_SIGNAL;
}