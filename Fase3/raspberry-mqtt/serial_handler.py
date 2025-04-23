import serial
import time

class SerialHandler:
    def __init__(self, port, baudrate):
        self.ser = serial.Serial(port, baudrate)

    def read_line(self):
        # Example of reading data from the serial port: [distance];[co2];[temperature];[humidity];[light];[current]\n
        line = self.ser.readline().decode('utf-8').strip()
        data = line.split(';')
        return {
            "distance": data[0],
            "co2": data[1],
            "temperature": data[2],
            "humidity": data[3],
            "light": data[4],
            "current": data[5],
            "date-time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
    
    def write_line(self, data):
        # Example of writing data to the serial port: [command];[value]\n
        self.ser.write((data + '\n').encode('utf-8'))

    def close(self):
        self.ser.close()
        print("Serial port closed")


        