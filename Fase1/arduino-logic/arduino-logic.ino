#include "modules-library.h"

// Initialize PINS

int LED = 11;
int ECHO = 12;
int TRIG = 13;
int CO2PIN = A0;
int LSIG = A1;

float SONIC;
float CO2;
float TEMP;
float HUM;
float LIGHT;
// float CURRENT;

#define DHTPIN 10
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  pinMode(ECHO, INPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {  
  SONIC = ultrasonicController(LED, TRIG, ECHO);
  CO2 = co2Controller(CO2PIN);
  TEMP = temperatureController(dht);
  HUM = humidityController(dht);
  LIGHT = luminousController(LSIG);
  Serial.print(SONIC);
  Serial.print(";");
  Serial.print(CO2);
  Serial.print(";");
  Serial.print(TEMP);
  Serial.print(";");
  Serial.print(HUM);
  Serial.print(";");
  Serial.print(LIGHT);
  Serial.println("");
  delay(1000);
}
