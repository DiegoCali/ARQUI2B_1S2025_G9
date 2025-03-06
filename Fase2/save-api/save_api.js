const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
//npm install mysql2

const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 4000;

// -------------------------------------------

function getMySQLDateTime() {
    const date = new Date();
    const pad = (n) => (n < 10 ? '0' + n : n);
    return (
      date.getFullYear() + '-' +
      pad(date.getMonth() + 1) + '-' +
      pad(date.getDate()) + ' ' +
      pad(date.getHours()) + ':' +
      pad(date.getMinutes()) + ':' +
      pad(date.getSeconds())
    );
  }

// PUERTO SERIAL -> Configurar segun sea necesario
const serialPort = new SerialPort({
    path: 'COM3', // como estoy en window usa com, linux usa distinto puerto
    baudRate: 9600,
});

//Linea por linea, aca es donde se lee la informacion del codigo
const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

// Conexion con la base en aws
const dbConnection = mysql.createConnection({
    host: 'arqui2project.czc68qcuezkl.us-east-2.rds.amazonaws.com',   
    user: 'admin',
    password: 'arqui2Project2025*',
    database: 'arqui2db'
});

// intenta conectarse
dbConnection.connect((err) => {
    if (err) {
        console.error('Error intentando conectar a la db:', err);
    } else {
        console.log('¡Conexión a la db realizada!');

//-----------------eliminar esto al conectar con arduino------------------------------
        // Insertar datos dummy para probar la conexión
        const dummyData = {
            distance: 100.00,
            co2: 400.00,
            temperature: 25.50,
            humidity: 50.3,
            light: 200.20,
            current: 5.10,
            timestamp: getMySQLDateTime()
        };

        const insertQuery = `
            INSERT INTO sensor_data 
                (distance, co2, temperature, humidity, light, current, date_time)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            dummyData.distance,
            dummyData.co2,
            dummyData.temperature,
            dummyData.humidity,
            dummyData.light,
            dummyData.current,
            dummyData.timestamp,
        ];

        dbConnection.query(insertQuery, values, (err, results) => {
            if (err) {
                console.error('Error al insertar data dummy en la db:', err);
            } else {
                console.log(`>>>> Data dummy insertada con ID: ${results.insertId}`);
            }
        });
 //-----------------eliminar esto al conectar con arduino------------------------------
    }
});

// No tiene usa, era pra pruebas del endpoint (no se usa)
let latestData = null;

// data del puerto serial
parser.on('data', (data) => {
    console.log(`Received raw data: ${data}`);

    //  "distance;co2;temperature;humidity;light;current" + timestamp
    const parts = data.trim().split(';');

    if (parts.length === 6) {
        // Objeto con toda la info de un envio
        const dataUnit = {
            distance: parts[0],
            co2: parts[1],
            temperature: parts[2],
            humidity: parts[3],
            light: parts[4],
            current: parts[5],
            timestamp: getMySQLDateTime(),
        };

        // solo guarda lo ultimo, hasta ahora no tiene funcionalidad
        latestData = dataUnit;
        console.log('Informacion recibida:', dataUnit);

        // Aca se inserta la info a la tabla
        const insertQuery = `
            INSERT INTO sensor_data 
                (distance, co2, temperature, humidity, light, current, timestamp) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            dataUnit.distance,
            dataUnit.co2,
            dataUnit.temperature,
            dataUnit.humidity,
            dataUnit.light,
            dataUnit.current,
            dataUnit.timestamp,
        ];

        dbConnection.query(insertQuery, values, (err, results) => {
            if (err) {
                console.error('Error al insertar la data a la db:', err);
            } else {
                console.log(`>>>> data insertada: ${results.insertId}`);
            }
        });
    } else {
        console.error('formato incorrecto (Serial port');
    }
});

// endpoint, para tener data - No tiene uso
app.get('/arduino-data', (req, res) => {
    if (latestData) {
        res.json(latestData);
    } else {
        res.status(404).json({ error: 'No sensor data received yet.' });
    }
});

// errores de data
serialPort.on('error', (err) => {
    console.error('Serial Port Error:', err.message);
});

// Iniaciarl el servicio, no sera tan necesario
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});