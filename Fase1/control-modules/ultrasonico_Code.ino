/* ULTRASONICO - DETECTAR PERSONA */

//********led ****
int LED = 6;   // Pin digital 5

// ************ SENSOR
// TRIG - signal de salida. arduino -> sensor
int TRIG = 13; // Pin digital 13

// signal de entrada al arduino - al rebotar activa el echo.
int ECHO = 12; // Pin digital 12


// arduino mide el tiempo en el que echo estuvo en high
int echoTime;

// se va a calcular
int distancia=0 ;

void setup(){
  
  pinMode(TRIG, OUTPUT); //Salida
  pinMode(ECHO, INPUT);  //Entrada
  
  
  //------led 
  pinMode(LED, OUTPUT);  // Pin como Salida
  
  Serial.begin(9600); // inicio serial
}

void loop(){
  
  // *** activacion del trig - envio y recepcion
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(1);
  digitalWrite(TRIG, LOW);
  delayMicroseconds(1);
  
  // *** tiempo de respuesta - medit
  echoTime = pulseIn(ECHO, HIGH);
  
  // *** se vuelve la distancia
  distancia = echoTime/58.2; 
  
  if (distancia < 15){
    digitalWrite(LED, HIGH);
    Serial.print("Detectado:");
    Serial.print(distancia);
    Serial.println("");
  }
  else{
    digitalWrite(LED, LOW);
    Serial.println("-----");
  }
  
  delay(500);
}