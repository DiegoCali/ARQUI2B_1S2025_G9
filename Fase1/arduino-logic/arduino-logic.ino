#include "modules-library.h"

// Initialize PINS

int LED = 11;
int ECHO = 12;
int TRIG = 13;
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

#define BOARD "Arduino Mega"
#define VOLTAGE 5
#define CO2PIN A0
#define TYPE "MQ-135"
#define ADC_BIT_RES 10
#define CLEAN_AIR 3.6

MQUnifiedsensor MQ135(BOARD, VOLTAGE, ADC_BIT_RES, CO2PIN, TYPE);

const byte numRows = 4;
const byte numCols = 4;

char keymap[numRows][numCols] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};

byte rowPins[numRows] = {44, 42, 40, 38};
byte colPins[numRows] = {36, 34, 32, 30};

Keypad keypad = Keypad(makeKeymap(keymap), rowPins, colPins, numRows, numCols);

LiquidCrystal_I2C lcd(0x27, 16, 2);

int ACS = A2;

void setup() {
  Serial.begin(9600);

  pinMode(ECHO, INPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(LED, OUTPUT);  

  MQ135.setRegressionMethod(1);
  MQ135.init();

  //***Calibrating MQ-135***
  float calcR0 = 0;
  for (int i = 1; i<=10; i++){
    MQ135.update();
    calcR0 += MQ135.calibrate(CLEAN_AIR);
  }
  MQ135.setR0(calcR0/10);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Bienvenidos G9");
  delay(1000);
  lcd.clear();

  lcd.clear();
  lcd.setCursor(0, 1);
  lcd.print("1. Live DATA");  
}

void loop() {  
  ultrasonicController(LED, TRIG, ECHO);
  co2Controller(MQ135);
  temperatureController(dht);
  humidityController(dht);
  luminousController(LSIG);
  currentController(ACS);
  lcdController(lcd, keypad);
  sendSerial();
  delay(1000);
}
