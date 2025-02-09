void setup() {
    size(512, 512);
}

void drawTermometer(float fill){
    // Draw thermometer
    float thermometerHeight = height / 4;
    float thermometerWidth = width / 20;
    float thermometerX = width / 8;
    float thermometerY = height / 8;
    float thermometerFill = fill; // 50% fill
    float labelX = thermometerX + thermometerWidth + 10;
    float labelY = thermometerY + thermometerHeight / 2;

    // Thermometer outline
    fill(0);
    rect(thermometerX, thermometerY, thermometerWidth, thermometerHeight);

    // Thermometer fill    
    fill(255, 0, 0);
    rect(thermometerX, thermometerY + thermometerHeight * (1 - thermometerFill), thermometerWidth, thermometerHeight * thermometerFill);    

    // Thermometer label
    fill(0);
    int truncatedFill = int(fill * 100);
    text(truncatedFill + "°C", labelX, labelY);
}

void drawDrop(float fill){
    // Draw drop gauge
    float dropGaugeHeight = height / 4;
    float dropGaugeWidth = width / 20;
    float dropGaugeX = width / 4;
    float dropGaugeY = height / 8;
    float dropGaugeFill = fill; // 50% fill
    float labelX = dropGaugeX + dropGaugeWidth + 10;
    float labelY = dropGaugeY + dropGaugeHeight / 2;

    // Drop gauge outline
    fill(0);
    rect(dropGaugeX, dropGaugeY, dropGaugeWidth, dropGaugeHeight);

    // Drop gauge fill    
    fill(0, 0, 255);
    rect(dropGaugeX, dropGaugeY + dropGaugeHeight * (1 - dropGaugeFill), dropGaugeWidth, dropGaugeHeight * dropGaugeFill);    

    // Drop gauge label
    fill(0);
    int truncatedFill = int(fill * 100);
    text(truncatedFill + "%", labelX, labelY);
}

void drawRadar(float distance){
    // Draw radar semicircle
    float radarRadius = width / 2;
    float radarX = width * 7 / 8;
    float radarY = height * 3 / 8;
    float radarDistance = 0.5; // 50% distance
    float labelX = radarX - 50;
    float labelY = radarY + 20;

    // Radar outline   
    fill(0);
    arc(radarX, radarY, radarRadius, radarRadius, PI, PI + PI * radarDistance, PIE);

    // Radar fill
    stroke(1);
    fill(0, 255, 0);
    arc(radarX, radarY, radarRadius * distance, radarRadius * distance, PI, PI + PI * radarDistance, PIE);

    // Radar label
    fill(0);
    int truncatedDistance = int(distance * 100);
    text(truncatedDistance + "cm", labelX, labelY);
}

void drawLightBulb(boolean on){
    // Draw light bulb
    float lightBulbRadius = width / 4;
    float lightBulbX = width / 4;
    float lightBulbY = height * 3 / 4;
    float labelX = lightBulbX + lightBulbRadius - 40;
    float labelY = lightBulbY;

    // Light bulb outline
    fill(0);
    ellipse(lightBulbX, lightBulbY, lightBulbRadius, lightBulbRadius);

    // Light bulb fill
    if (on){
        fill(255, 255, 0);
    } else {
        fill(0);
    }
    ellipse(lightBulbX, lightBulbY, lightBulbRadius * 0.9, lightBulbRadius * 0.9);

    // Light bulb label
    fill(0);
    if (on){
        text("ON", labelX, labelY);
    } else {
        text("OFF", labelX, labelY);
    }
}

void drawCo2Gauge(float concentration){
    // Draw Co2 gauge
    float co2GaugeHeight = height / 4;
    float co2GaugeWidth = width / 20;
    float co2GaugeX = width * 3 / 4;
    float co2GaugeY = height * 5 / 8;
    float co2GaugeFill = concentration; // 50% fill
    float labelX = co2GaugeX + co2GaugeWidth + 10;
    float labelY = co2GaugeY + co2GaugeHeight / 2;

    // Co2 gauge outline
    fill(0);
    rect(co2GaugeX, co2GaugeY, co2GaugeWidth, co2GaugeHeight);

    // Co2 gauge fill    
    fill(128, 128, 128);
    rect(co2GaugeX, co2GaugeY + co2GaugeHeight * (1 - co2GaugeFill), co2GaugeWidth, co2GaugeHeight * co2GaugeFill);    

    // Co2 gauge label
    fill(0);
    int truncatedFill = int(concentration * 100);
    text(truncatedFill + "%", labelX, labelY);
}

void draw() {
    background(255);
    
    // This cuadrant is for the temperature and humidity
    fill(255);
    rect(0, 0, width/2, height/2);
    // Draw thermometer
    drawTermometer(0.75);

    // Draw drop gauge
    drawDrop(0.35);
    
    // This cuadrant is for the movement
    fill(255);
    rect(width/2, 0, width/2, height/2);

    // Draw radar
    drawRadar(0.3);
    
    // This cuadrant is for the light
    fill(255);
    rect(0, height/2, width/2, height/2);

    // Draw light bulb
    drawLightBulb(false);
    
    // This cuadrant is for Co2 concentration    
    fill(255);
    rect(width/2, height/2, width/2, height/2);

    // Draw Co2 gauge
    drawCo2Gauge(0.6);
}
