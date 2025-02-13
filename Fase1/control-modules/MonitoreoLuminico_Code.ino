// Definiciones de sus variables globales.
int args;
const int Sensor = 7;
const int ledPin = 12;
const int ledPin2 = 13;
const int ledPin3 = 11;
const int ledPin4 = 10;
const int pinLDR = A1;  // Sensor de luz
int valorLDR = 0;       // Variable para almacenar los datos del sensor LDR

void setup() {
    // put your setup code here, to run once:
    Serial.begin(9600);
    pinMode(ledPin, OUTPUT);
    pinMode(ledPin2, OUTPUT);
    pinMode(ledPin3, OUTPUT);
    pinMode(ledPin4, OUTPUT);
}

float functionController(int args) {
    // Logica de su controlador y conversion de datos
    long duration, cm;

    // Leer distancia del sensor ultrasónico
    pinMode(Sensor, OUTPUT);
    digitalWrite(Sensor, LOW);
    delayMicroseconds(2);
    digitalWrite(Sensor, HIGH);
    delayMicroseconds(5);
    digitalWrite(Sensor, LOW);

    pinMode(Sensor, INPUT);
    duration = pulseIn(Sensor, HIGH);
    cm = duration / 29 / 2;

    // Leer intensidad de luz
    valorLDR = analogRead(pinLDR);

    Serial.print("Distancia: ");
    Serial.print(cm);
    Serial.print(" cm  |  Luz: ");
    Serial.println(valorLDR);

    //Si alguien está cerca Y hay poca luz, encender luces
    if (cm <= 200 && valorLDR <= 500) {
        digitalWrite(ledPin, HIGH);
        digitalWrite(ledPin2, HIGH);
        digitalWrite(ledPin3, HIGH);
        digitalWrite(ledPin4, HIGH);
    } else {
        digitalWrite(ledPin, LOW);
        digitalWrite(ledPin2, LOW);
        digitalWrite(ledPin3, LOW);
        digitalWrite(ledPin4, LOW);
    }
    return cm; 
}

void loop() {
    // Llamada d    e su función del controlador
    float response = functionController(args);
    delay(100); 
}
