#include <Adafruit_LiquidCrystal.h>
// En cero por si acaso
int CO2_Sensor = 0;

Adafruit_LiquidCrystal lcd_1(0); // Inicializa el LCD

void setup() {
  pinMode(A0, INPUT); // ANALOG --> INPUT para leer la data
  Serial.begin(9600);
  lcd_1.begin(16, 2); // 2 columnas y 2 filas
  lcd_1.setCursor(0, 0); // empiezaen la esquina izq
  
  lcd_1.print("  CO2 Sensor "); 
  lcd_1.print("              ");
}

void loop() {
  CO2_Sensor = analogRead(A0); // leer los valores
  Serial.println(CO2_Sensor); // mostrarlo en serial

  // ************ MOSTRAR VALORES ***************
  delay(500);
  lcd_1.setCursor(0, 0);
  lcd_1.print("CO2: ");
  lcd_1.print(CO2_Sensor);
  lcd_1.print("     "); // clr

  delay(500); // tiempo para updatear
}