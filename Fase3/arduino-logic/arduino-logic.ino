#include "modules-library.h"

// Initialize PINS

int INLIGHT = 11;
int OUTLIGHT = 6;
int FANPIN = 3;
int DCPIN = 4;
int BUZZPIN = 24;
int INFRARED = 22;
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

LiquidCrystal_I2C lcd(0x27, 16, 2);

int ACS = A2;

// RFID
int RST_PIN = 5;
int SS_PIN = 53;

MFRC522 mfrc522(SS_PIN, RST_PIN);

// Error leds
int HEATPIN = 8;
int AIRPIN = 9;
int THPIN = 7;

int OPENSERVO = 26;
int CLOSESERVO = 30;

bool INSERTCARD = false;

// Plataform instructions
bool LOCKED = false;

void setup() {
  Serial.begin(9600);

  pinMode(ECHO, INPUT);
  pinMode(INFRARED, INPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(INLIGHT, OUTPUT); 
  pinMode(OUTLIGHT, OUTPUT);
  pinMode(FANPIN, OUTPUT);
  pinMode(DCPIN, OUTPUT);
  pinMode(BUZZPIN, OUTPUT);
  pinMode(AIRPIN, OUTPUT); 
  pinMode(HEATPIN, OUTPUT); 
  pinMode(THPIN, OUTPUT); 
  pinMode(OPENSERVO, OUTPUT);
  pinMode(CLOSESERVO, OUTPUT); 

  digitalWrite(FANPIN, HIGH);
  digitalWrite(DCPIN, HIGH);

  digitalWrite(OPENSERVO, LOW);
  digitalWrite(CLOSESERVO, LOW);

  SPI.begin();
  mfrc522.PCD_Init();  

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

}

void loop() {    
  if (Serial.available()) {  // Verificar si hay datos en el buffer serial
    char command = Serial.read();  // Leer un byte del puerto serial 
    if (command == '1') {  // Si el comando recibido es '1'
      LOCKED = true;
      digitalWrite(INLIGHT, HIGH);
      digitalWrite(OUTLIGHT, HIGH);
    }
    if (command == '0') {
      LOCKED = false;
      digitalWrite(INLIGHT, LOW);
      digitalWrite(OUTLIGHT, LOW);
    }
    if (command == 'facetrue'){
      // .. face rekognition
    }
  }
  ultrasonicController(INLIGHT, TRIG, ECHO, LOCKED);
  co2Controller(MQ135, AIRPIN, FANPIN);
  temperatureController(dht, HEATPIN, DCPIN);
  humidityController(dht, THPIN, FANPIN);
  luminousController(LSIG, OUTLIGHT, LOCKED);
  currentController(ACS, BUZZPIN);
  INSERTCARD = doorController(INFRARED, lcd, mfrc522, OPENSERVO, CLOSESERVO);
  if (!INSERTCARD) {
    printData(true, lcd);
  }
  sendSerial();
  delay(1000);
}
