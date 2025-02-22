#include "modules-library.h"

float DISTANCE = 0;
float ECHO_TIME = 0;

const float sensivity = 0.100; // For the 20A
const float zeroCurrentVoltage = 2.5;

const float A = 675.0;
const float B = 0.75;

int screen = 1;
int last_screen = 0;
char lcd_key;
int adc_key_in = 0;
bool menu_active = true;

float liveData[6];

char sensorChar[6] = {'D', 'G', 'T', 'H', 'L', 'C'};

bool errors[4];

void errorHandling(LiquidCrystal_I2C lcd){
  lcd.clear();
  lcd.setCursor(0, 0);  
  lcd.print("Error On Value:");
  int row = 0;
  lcd.setCursor(1, row);
  for (int i = 0; i < 4; i++){
    if (errors[i]) {      
      if (i == 3) {
        lcd.print(sensorChar[5]);        
      } else if (i == 2) {
        lcd.print(sensorChar[3]);
      } else if (i == 1) {
        lcd.print(sensorChar[2]);
      } else if (i == 0) {
        lcd.print(sensorChar[1]);
      }         
    }
    row++;
    lcd.setCursor(1, row);
  }
}

bool hasError(){
  for (int i = 0; i < 4; i++){
    if (errors[i]){
      return true;
    }
  }
  return false;
}

void menuPrint(int SCREEN, LiquidCrystal_I2C lcd){
  lcd.clear();
  lcd.setCursor(0, 1);
  switch (SCREEN){
    case 1: lcd.print("1. Live DATA"); break;
    case 2: lcd.print("2. EEPROM"); break;
    default: lcd.print("ERROR           "); break;
  }
}

void saveEEPROM(){
  int offset = 0;
  for (int i = 0; i < 6; i++){
    EEPROM.put(offset, liveData[i]);
    offset += sizeof(float);
  }  
}

float* getEEPROM(){
  static float response[6];
  int offset = 0;
  for (int i = 0; i < 6; i++){
    EEPROM.get(offset, response[i]);
    offset += sizeof(float);
  }
  return response;
}

void printData(bool live, LiquidCrystal_I2C lcd){
  float* data;
  if (live){
    data = liveData;
  } else {
    data = getEEPROM();
  }
  lcd.clear();
  menu_active = false;  
  int colOffset = 0;
  int rowOffset = 0;
  int i = 0;  
  for (i ; i < 3; i++) {
    lcd.setCursor(colOffset, rowOffset);
    lcd.print(sensorChar[i]);
    lcd.print(":");
    colOffset += 2;
    lcd.setCursor(colOffset, rowOffset);
    lcd.print(int(data[i]));
    colOffset += 3;
  }
  rowOffset++;
  colOffset = 0;
  for (i ; i < 6; i++) {
    lcd.setCursor(colOffset, rowOffset);
    lcd.print(sensorChar[i]);
    lcd.print(":");
    colOffset += 2;
    lcd.setCursor(colOffset, rowOffset);
    if (i == 5){
      lcd.print(data[i]);  
    } else {
      lcd.print(int(data[i]));
    }
    colOffset += 3;
  }
}

//*****Exported Functions*****
void ultrasonicController(int LED, int TRIG, int ECHO){
  // *** activacion del trig - envio y recepcion
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(1);
  digitalWrite(TRIG, LOW);
  delayMicroseconds(1);
  
  // *** tiempo de respuesta - medit
  ECHO_TIME = pulseIn(ECHO, HIGH);
  
  // *** se vuelve la DISTANCE
  DISTANCE = ECHO_TIME/58.2;
  if (DISTANCE > 99 ) DISTANCE = 99.99; 
  
  if (DISTANCE < 8){
    digitalWrite(LED, HIGH);               
  }
  else{
    digitalWrite(LED, LOW);      
  }
  liveData[0] = DISTANCE;  
}

void co2Controller(MQUnifiedsensor MQ135, int APIN) {  
  MQ135.update();
  MQ135.setA(110.47);
  MQ135.setB(-2.862);
  float CO2 = MQ135.readSensor(); // leer los valores  
  delay(100);
  if (CO2 > 8){
    errors[0] = true;
    digitalWrite(APIN, HIGH);
  }else{
    errors[0] = false;
    digitalWrite(APIN, LOW);
  }
  liveData[1] = CO2;
}

void temperatureController(DHT dht, int THPIN){
  float TEMPERATURE = dht.readTemperature();
  delay(500);
  if (TEMPERATURE > 30){
    errors[1] = true;
    digitalWrite(THPIN, HIGH);
  }else{
    errors[1] = false;
    digitalWrite(THPIN, LOW);
  }
  liveData[2] = TEMPERATURE;
}

void humidityController(DHT dht, int THPIN){
  float HUMIDITY = dht.readHumidity();
  delay(100);
  if (HUMIDITY > 75){
    errors[2] = true;
    digitalWrite(THPIN, HIGH);
  }else{
    errors[2] = false;
    digitalWrite(THPIN, LOW);
  }
  liveData[3] = HUMIDITY;
}

void luminousController(int PHOTO_SIG){
  int raw = analogRead(PHOTO_SIG);  
  float voltage = (raw/1023.0) * 5.0;
  float luxes = A*(1/pow(voltage, B));
  delay(100);
  liveData[4] = luxes;
}

void currentController(int ACS, int CPIN){  
  int raw = analogRead(ACS);
  float voltage = (raw/1023.0) * 5.0;
  //if (voltage < 2.5) voltage = 2.5;
  float A = ((zeroCurrentVoltage - voltage)/sensivity);
  delay(100);
  if (A > 1.2 || A < 0.5){
    errors[3] = true;
    digitalWrite(CPIN, HIGH);
  }else{
    errors[3] = false;
    digitalWrite(CPIN, LOW);
  }
  liveData[5] = A;
}

void lcdController(LiquidCrystal_I2C lcd, Keypad keypad){
  lcd_key = keypad.getKey();
  if (hasError()) {   
    errorHandling(lcd);
    return;
  }
  if (menu_active) {
    switch (lcd_key) {
      case '2':
        screen--;
        if (screen < 1) screen = 2;
        menuPrint(screen, lcd);
        break;
      case '8':
        screen++;
        if (screen > 2) screen = 1;
        menuPrint(screen, lcd);
        break;
      case '5':        
        if (screen == 1) {
          printData(true, lcd);
        } else if (screen == 2) {
          printData(false, lcd);
        }
        break;
    }
  } else {
    if (lcd_key == '4') {
      lcd.clear();
      menu_active = true;
      menuPrint(screen, lcd);
      return;
    }
    if (screen == 1){
      printData(true, lcd);
      if (lcd_key == '6') {
        saveEEPROM();
        lcd.clear();
        lcd.setCursor(4,1);
        lcd.print("Saved!");    
      }
    }
  }
}

void sendSerial(){
  Serial.print(liveData[0]);
  Serial.print(";");
  Serial.print(liveData[1]);
  Serial.print(";");
  Serial.print(liveData[2]);
  Serial.print(";");
  Serial.print(liveData[3]);
  Serial.print(";");
  Serial.print(liveData[4]);
  Serial.print(";");
  Serial.print(liveData[5]);
  Serial.println("");
}