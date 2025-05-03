#include "modules-library.h"

float DISTANCE = 0;
float ECHO_TIME = 0;

//const float sensivity = 0.100; // For the 20A
//const float zeroCurrentVoltage = 2.5;

const float A = 675.0;
const float B = 0.75;

bool FANRUNNING = false;
bool KEEPFAN = false;
bool OPENED = false;

int screen = 1;
int last_screen = 0;
char lcd_key;
int adc_key_in = 0;
bool menu_active = true;

bool entered = false;

float liveData[6];

char sensorChar[6] = {'D', 'G', 'T', 'H', 'L', 'C'};

bool errors[4];

void errorHandling(LiquidCrystal_I2C lcd){
  lcd.clear();
  lcd.setCursor(0, 0);  
  lcd.print("Error On Value:");
  lcd.setCursor(0, 1);  
  for (int i = 0; i < 4; i++){
    if (errors[i]) {      
      if (i == 3) {
        lcd.print("Current="  + String(liveData[5]));        
      } else if (i == 2) {
        lcd.print("Humidity=" + String(liveData[3]));   
      } else if (i == 1) {
        lcd.print("Temperature=" + String(liveData[2]));   
      } else if (i == 0) {
        lcd.print("Gas=" + String(liveData[1]));   
      }         
      return;
    }    
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
  if (hasError()) {
    errorHandling(lcd);
    return;
  }
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
void ultrasonicController(int LED, int TRIG, int ECHO, bool LOCKED){
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
  
  if (LOCKED) {
    liveData[0] = DISTANCE;
    return;
  }

  if (DISTANCE < 15){
    digitalWrite(LED, HIGH);               
  }
  else{
    digitalWrite(LED, LOW);      
  }
  liveData[0] = DISTANCE;  
}

void co2Controller(MQUnifiedsensor MQ135, int APIN, int FANPIN) {  
  MQ135.update();
  MQ135.setA(110.47);
  MQ135.setB(-2.862);
  float CO2 = MQ135.readSensor(); // leer los valores  
  delay(100);
  if (CO2 > 8){
    errors[0] = true;
    digitalWrite(APIN, HIGH);
    if (!FANRUNNING){
      digitalWrite(FANPIN, LOW);
      FANRUNNING = true;      
    }
  }else{
    errors[0] = false;
    digitalWrite(APIN, LOW);
    if (FANRUNNING && !errors[2]){
      digitalWrite(FANPIN, HIGH);
      FANRUNNING = false;
    }
  }
  liveData[1] = CO2;
}

void temperatureController(DHT dht, int THPIN, int DCPIN){
  float TEMPERATURE = dht.readTemperature();
  delay(500);
  if (TEMPERATURE > 30){
    errors[1] = true;
    digitalWrite(THPIN, HIGH);
    digitalWrite(DCPIN, LOW);
  }else{
    errors[1] = false;
    digitalWrite(THPIN, LOW);
    digitalWrite(DCPIN, HIGH);
  }
  liveData[2] = TEMPERATURE;
}

void humidityController(DHT dht, int THPIN, int FANPIN){
  float HUMIDITY = dht.readHumidity();
  delay(100);
  if (HUMIDITY > 80){
    errors[2] = true;
    digitalWrite(THPIN, HIGH);
    if (!FANRUNNING){
      digitalWrite(FANPIN, LOW);
      FANRUNNING = true;
    }
  }else{
    errors[2] = false;
    digitalWrite(THPIN, LOW);
    if (FANRUNNING && !errors[0]){
      digitalWrite(FANPIN, HIGH);
      FANRUNNING = false;
    }
  }
  liveData[3] = HUMIDITY;
}

void luminousController(int PHOTO_SIG, int OUTLIGHT, bool LOCKED){
  int raw = analogRead(PHOTO_SIG);  
  float voltage = (raw/1023.0) * 5.0;
  float luxes = A*(1/pow(voltage, B));
  delay(100);
  if (LOCKED) {
    liveData[4] = luxes;
    return;
  }
  if (luxes < 300){
    digitalWrite(OUTLIGHT, HIGH);
  }else {
    digitalWrite(OUTLIGHT, LOW);
  }
  liveData[4] = luxes;
}

void currentController(int ACS, int CPIN){  
  int raw = analogRead(ACS);
  float voltage = (raw/1023.0) * 5.0; // Voltage
  float resistance = 1000 - (raw/1023.0) * 1000; // Ohms
  float A = voltage/resistance * 1000; // A
  delay(100);
  if (A > 1.5 || A < 0.1){
    errors[3] = true;
    if (A < 0.1) {
      digitalWrite(CPIN, HIGH);
    } else {
      digitalWrite(CPIN, LOW);  
    }   
  }else{
    errors[3] = false;
    digitalWrite(CPIN, LOW);
  }
  liveData[5] = A;
}

bool doorController(int INFRARED, LiquidCrystal_I2C lcd, MFRC522 mfrc522, int OPEN, int CLOSE){
  int pos = 0;  
  lcd.clear();
  lcd.setCursor(0, 0);
  if (!digitalRead(INFRARED)) {
    lcd.print("Coloque la ");
    lcd.setCursor(0, 1);
    lcd.print("tarjeta");
    while (!digitalRead(INFRARED)) {
      if (mfrc522.PICC_IsNewCardPresent()) {        
        lcd.clear();
        lcd.setCursor(3, 0);
        lcd.print("Tarjeta");
        lcd.setCursor(3, 1);
        lcd.print("detectada!");
        digitalWrite(OPEN, HIGH);
        if (!entered){
          Serial.println("entered");
          entered = true;
        }
      }
    }
    entered = false;
    digitalWrite(OPEN, LOW);
    delay(2000);
    digitalWrite(CLOSE, HIGH);
    delay(3000);
    lcd.clear();
    lcd.setCursor(2,0);
    lcd.print("Bienvenido!");
    digitalWrite(CLOSE, LOW);
    return true;
  }
  return false;
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