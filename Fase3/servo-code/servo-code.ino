#include <Servo.h>

Servo servo;

int OPENPIN = 4;
int CLOSEPIN = 12;

void setup() {
  servo.attach(9);
  servo.write(180);
  delay(1000);
  servo.write(90);
  pinMode(OPENPIN, INPUT);
  pinMode(CLOSEPIN, INPUT);
}

void loop() {
  // Open the door
  Serial.println(digitalRead(CLOSEPIN));
  if (digitalRead(OPENPIN) && !digitalRead(CLOSEPIN)){
    servo.write(180);
    delay(90);
  }
  // Close the door
  if (!digitalRead(OPENPIN) && digitalRead(CLOSEPIN)){
    servo.write(90);
    delay(90);
  }
  delay(10);
}