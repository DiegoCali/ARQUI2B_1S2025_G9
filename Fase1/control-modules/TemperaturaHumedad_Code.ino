#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

int args;


LiquidCrystal_I2C lcd(0x27, 16, 2);

// Configuración del sensor DHT22
#define DHTPIN A3 
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// Definir pines de los LEDs
#define LED_ROJO 11
#define LED_VERDE 10
#define LED_AZUL 9

void setup() {
    
    lcd.begin(16, 2);  
    lcd.backlight();   

    dht.begin();

    pinMode(LED_ROJO, OUTPUT);
    pinMode(LED_VERDE, OUTPUT);
    pinMode(LED_AZUL, OUTPUT);

    lcd.setCursor(0, 0);
    lcd.print("Sensor DHT22");
    lcd.setCursor(0, 1);
    lcd.print("Iniciando...");
    delay(2000);
    lcd.clear();
}

float functionController(int args) {
    
    float humedad = dht.readHumidity();
    float temperatura = dht.readTemperature();

    // Verificar si la lectura es válida
    if (isnan(temperatura) || isnan(humedad)) {
        lcd.setCursor(0, 0);
        lcd.print("Error leyendo");
        lcd.setCursor(0, 1);
        lcd.print("DHT22...");
        delay(2000);
        return -1;
    }

    // Mostrar los valores en el LCD
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Temp: ");
    lcd.print(temperatura);
    lcd.print(" C");

    lcd.setCursor(0, 1);
    lcd.print("Hum: ");
    lcd.print(humedad);
    lcd.print(" %");

    // Control de LEDs según la temperatura
    if (temperatura >= 30) {
        digitalWrite(LED_ROJO, HIGH);
        digitalWrite(LED_VERDE, LOW);
        digitalWrite(LED_AZUL, LOW);
    } else if (temperatura <= 18) {
        digitalWrite(LED_ROJO, LOW);
        digitalWrite(LED_VERDE, LOW);
        digitalWrite(LED_AZUL, HIGH);
    } else {
        digitalWrite(LED_ROJO, LOW);
        digitalWrite(LED_VERDE, HIGH);
        digitalWrite(LED_AZUL, LOW);
    }
    return temperatura;
}

void loop() {
    float response = functionController(args);
    delay(2000);
}
