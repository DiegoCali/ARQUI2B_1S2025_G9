#ifndef MODULES_LIBRARY_H
#define MODULES_LIBRARY_H
#include <Arduino.h>

float ultrasonicController(int LED, int TRIG, int ECHO, int ECHO_TIME, float DISTANCE);
float co2Controller(int CO2_SENSOR, byte ANALOG_READ, float PERCENTAGE);

#endif