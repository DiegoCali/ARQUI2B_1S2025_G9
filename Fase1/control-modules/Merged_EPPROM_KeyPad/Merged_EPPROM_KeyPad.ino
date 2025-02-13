#include <Keypad.h>
#include <Wire.h> 
#include <LiquidCrystal_I2C.h>
#include <EEPROM.h>


/* ULTRASONICO - DETECTAR PERSONA */

//********led ****
int LED = 52;   // Pin digital 6

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
LiquidCrystal_I2C lcd_1(0x27,20,4); // Inicializa el LCD


//--------------------
int screen = 1; 
int last_screen = 0;  // Para evitar refrescos innecesarios
char lcd_key;
int adc_key_in = 0;
bool menu_active = true;  // controla menu


//********* keypad************
const byte numRows= 4; //row
const byte numCols= 4; //col

//mappeo
char keymap[numRows][numCols]= 
{
{'1', '2', '3', 'A'}, 
{'4', '5', '6', 'B'}, 
{'7', '8', '9', 'C'},
{'*', '0', '#', 'D'}
};

//pinz
byte rowPins[numRows] = {9,8,7,6}; 
byte colPins[numCols]= {5,4,3,2}; 

//instancia
Keypad myKeypad= Keypad(makeKeymap(keymap), rowPins, colPins, numRows, numCols);

//***************************

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
  lcd_1.init();

  lcd_1.setCursor(2, 0); // Empieza en la esquina izq
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

  lcd_key = myKeypad.getKey();
 if (menu_active) {
        switch (lcd_key) {
            case '2':
                screen--;
                if (screen < 1) screen = 2;
                menu_print(screen);
                break;
            case '8':
                screen++;
                if (screen > 2) screen = 1;
                menu_print(screen);
                break;
            case '5':
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
          
              case '6':
                saveEEPROM(CO2_Sensor, distancia);
                Serial.print("saved data!! -> epprom");
                delay(1000);
                menu_print(screen);
                break;
        }
    } 
    // left es return!!!
    else {
        if (lcd_key == '4') {
            lcd_1.clear();
            menu_active = true;
            menu_print(screen);
        }
    }
  
  delay(500); // delay para la actualizacion
}