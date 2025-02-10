#include "modules-library.h"

float ultrasonicController(int LED, int TRIG, int ECHO, int ECHO_TIME, float DISTANCE){
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
  //delay(500);
}

float co2Controller(int CO2_SENSOR, byte ANALOG_READ, float PERCENTAGE) {
  CO2_SENSOR = analogRead(A0); // leer los valores  
  // Convert sensor byte input to Co2 percentage
  float PERCENTAGE = CO2_SENSOR/1.0;
  // ************ MOSTRAR VALORES ***************
  return PERCENTAGE;
  //delay(500);
}