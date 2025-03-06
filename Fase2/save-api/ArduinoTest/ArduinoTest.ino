void setup() {

  Serial.begin(9600);
}

void loop() {

  float distance = 100.00;     // cm
  float co2 = 400.00;          // ppm
  float temperature = 25.50;   //  Celsius
  float humidity = 50.30;      //  percentage
  float light = 200.20;        //  lux 
  float current = 5.10;        // amp

  Serial.print(distance, 2);
  Serial.print(";");
  Serial.print(co2, 2);
  Serial.print(";");
  Serial.print(temperature, 2);
  Serial.print(";");
  Serial.print(humidity, 2);
  Serial.print(";");
  Serial.print(light, 2);
  Serial.print(";");
  Serial.println(current, 2);


  delay(1000);
}

