#include <SPI.h>
#include <MFRC522.h>

#define RST_PIN 5     // Puedes usar otro, pero asegúrate de que esté conectado
#define SS_PIN 53     // Pin SDA del lector conectado al pin 53 en el Mega

MFRC522 mfrc522(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(9600);
  SPI.begin();
  mfrc522.PCD_Init();
  Serial.println("Acerque una tarjeta al lector...");
}

void loop() {
  if (mfrc522.PICC_IsNewCardPresent()) {
    Serial.println("¡Tarjeta detectada!");
  } else {
    Serial.println("No hay tarjeta...");
  }
  delay(1000); // para no saturar el serial
}

