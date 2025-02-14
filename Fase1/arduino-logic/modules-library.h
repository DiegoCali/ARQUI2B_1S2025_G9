#ifndef MODULES_LIBRARY_H
#define MODULES_LIBRARY_H
#include <Arduino.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <DHT.h>


float ultrasonicController(int LED, int TRIG, int ECHO);
float co2Controller(int ANALOG_READ);
float temperatureController(DHT dht);
float humidityController(DHT dht);
float luminousController(int PHOTO_SIG);

#endif