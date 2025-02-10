#include <Adafruit_LiquidCrystal.h>
#include <EEPROM.h>
#define btnRIGHT  0
#define btnUP     1
#define btnDOWN   2
#define btnLEFT   3
#define btnSELECT 4
#define btnNONE   5

/* ULTRASONICO - DETECTAR PERSONA */

//********led ****
int LED = 6;   // Pin digital 6

// ************ SENSOR
// TRIG - signal de salida. arduino -> sensor
int TRIG = 13; // Pin digital 13

// signal de entrada al arduino - al rebotar activa el echo.
int ECHO = 12; // Pin digital 12

// arduino mide el tiempo en el que echo estuvo en high
int echoTime;

// se va a calcular
int distancia = 0;

// CO2 Sensor
int CO2_Sensor = 0;
Adafruit_LiquidCrystal lcd_1(0); // Inicializa el LCD


//--------------------
int screen = 1; 
int last_screen = 0;  // Para evitar refrescos innecesarios
int lcd_key = 0;
int adc_key_in = 0;
bool menu_active = true;  // controla menu


// lectura de los botones
int read_LCD_buttons() {
    adc_key_in = analogRead(A1);
    if (adc_key_in > 1000) return btnNONE;
    if (adc_key_in < 50) return btnRIGHT;
    if (adc_key_in < 195) return btnUP;
    if (adc_key_in < 380) return btnDOWN;
    if (adc_key_in < 555) return btnLEFT;
    if (adc_key_in < 790) return btnSELECT;
    return btnNONE;
}

void menu_print(int lcd_print) {
    lcd_1.clear();
    lcd_1.setCursor(0, 1);
    switch (lcd_print) {
        case 1: lcd_1.print("1. DATA en vivo"); break;
        case 2: lcd_1.print("2. Historial EEPROM"); break;
        default: lcd_1.print("ERROR           "); break;
    }
}
//--------------------




//----------- epprom
void saveEEPROM(int co2, int dist) {
    EEPROM.put(0, co2);
    EEPROM.put(sizeof(int), dist);
    Serial.println("Datos guardados en EEPROM.");
}

// obtener la data
void getEEPROM(int &co2, int &dist) {
  // SE OBTIENE EL LUGAR DE MEMORIA
    EEPROM.get(0, co2);
    EEPROM.get(sizeof(int), dist);
}



void setup(){

 
  Serial.begin(9600); // Inicio serial
  lcd_1.begin(16, 2); // 16 columnas y 2 filas
  lcd_1.setCursor(0, 0); // Empieza en la esquina izq
  lcd_1.print("   Bienvenidos G9  ");
  delay(2000);  // 2 segundos para el menu
  lcd_1.clear();
  
  pinMode(TRIG, OUTPUT); // Salida
  pinMode(ECHO, INPUT);  // Entrada
  pinMode(LED, OUTPUT);  // Pin como Salida
  pinMode(A0, INPUT);    // ANALOG --> INPUT para leer la data
  
  menu_print(screen);
  
}

void loop(){
  // *** activacion del trig - envio y recepcion
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10); // Aumentado para mayor precisión
  digitalWrite(TRIG, LOW);
  
  // *** tiempo de respuesta - medir
  echoTime = pulseIn(ECHO, HIGH);
  
  // *** se calcula la distancia
  distancia = echoTime / 58.2; 
  
  if (distancia < 15){
    digitalWrite(LED, HIGH);
    Serial.print("Detectado: ");
    Serial.print(distancia);
    Serial.println(" cm");
  }
  else{
    digitalWrite(LED, LOW);
    Serial.println("-----");
  }
  
  
  
  // Leer valores del sensor de CO2
  CO2_Sensor = analogRead(A0);
  
  
  
  
  //-----------SELECCION 

  lcd_key = read_LCD_buttons();
 if (menu_active) {
        switch (lcd_key) {
            case btnUP:
                screen--;
                if (screen < 1) screen = 2;
                menu_print(screen);
                break;
            case btnDOWN:
                screen++;
                if (screen > 2) screen = 1;
                menu_print(screen);
                break;
            case btnSELECT:
                lcd_1.clear();
                menu_active = false;  // Salimos del menu
                Serial.print("Opción seleccionada: ");
                Serial.println(screen);
                if (screen == 1) {
                    CO2_Sensor = analogRead(A0);
                    lcd_1.setCursor(0, 0);
                    lcd_1.print("CO2: ");
                    lcd_1.print(CO2_Sensor);
                  Serial.println("-----live-----");
              		Serial.print("CO2: ");
                  Serial.println(CO2_Sensor);
                } else if (screen == 2) {
                   int co2_epprom, dist_epprom;
                    getEEPROM(co2_epprom, dist_epprom);
                    lcd_1.setCursor(0, 0);
                    lcd_1.print("CO2: ");
                    lcd_1.print(co2_epprom);
                    lcd_1.setCursor(0, 1);
                    lcd_1.print("Dist: ");
                    lcd_1.print(dist_epprom);
                    Serial.print("Datos EEPROM -> CO2: ");
                    Serial.print(co2_epprom);
                    Serial.print(", Dist: ");
                    Serial.println(dist_epprom);
                }
                break;
          
              case btnRIGHT:
                saveEEPROM(CO2_Sensor, distancia);
                Serial.print("saved data!! -> epprom");
                delay(1000);
                menu_print(screen);
                break;
        }
    } 
    // left es return!!!
    else {
        if (lcd_key == btnLEFT) {
            lcd_1.clear();
            menu_active = true;
            menu_print(screen);
        }
    }
  
  delay(500); // delay para la actualizacion
}