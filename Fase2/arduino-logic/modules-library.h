#ifndef MODULES_LIBRARY_H
#define MODULES_LIBRARY_H
#include <Arduino.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <DHT.h>
#include <MQUnifiedsensor.h>
#include <EEPROM.h>
#include <Servo.h>
#include <SPI.h>
#include <MFRC522.h>

void ultrasonicController(int LED, int TRIG, int ECHO);
void co2Controller(MQUnifiedsensor MQ135, int APIN, int FANPIN);
void temperatureController(DHT dht, int THPIN, int DCPIN);
void humidityController(DHT dht, int THPIN, int FANPIN);
void luminousController(int PHOTO_SIG, int OUTLIGTH);
void currentController(int ACS, int CPIN);
bool doorController(int INFRARED, Servo servo, LiquidCrystal_I2C lcd, MFRC522 mfrc522);
void printData(bool live, LiquidCrystal_I2C lcd);
void sendSerial();

#endif