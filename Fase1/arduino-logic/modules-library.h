#ifndef MODULES_LIBRARY_H
#define MODULES_LIBRARY_H
#include <Arduino.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <DHT.h>
#include <MQUnifiedsensor.h>
#include <Keypad.h>
#include <EEPROM.h>
#include <ACS712.h>

void ultrasonicController(int LED, int TRIG, int ECHO);
void co2Controller(MQUnifiedsensor MQ135, int APIN);
void temperatureController(DHT dht, int THPIN);
void humidityController(DHT dht, int THPIN);
void luminousController(int PHOTO_SIG);
void currentController(int ACS, int CPIN);
void lcdController(LiquidCrystal_I2C lcd, Keypad keypad);
void sendSerial();

#endif