#include <Servo.h>

Servo servo;

int OPENPIN = 4;
int CLOSEPIN = 7;

void setup() {
  servo.attach(9);
  pinMode(OPENPIN, INPUT);
  pinMode(CLOSEPIN, INPUT);
}

void loop() {
  if (digitalRead(OPENPIN) && !digitalRead(CLOSEPIN)){
    servo.write(180);
  }
  if (!digitalRead(OPENPIN) && digitalRead(CLOSEPIN)){
    servo.write(90);
  }
  delay(100);
}
