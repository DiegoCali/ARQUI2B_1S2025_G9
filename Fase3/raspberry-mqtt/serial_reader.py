import serial
import os

from dotenv import load_dotenv
load_dotenv()

ser = serial.Serial(
    port=os.getenv("SERIAL_PORT"),
    baudrate=int(os.getenv("BAUD_RATE")),    
)

def read_serial():
    # Example of reading data from the serial port: [distance];[co2];[temperature];[humidity];[light];[current]\n
    while True:
        line = ser.readline().decode('utf-8').strip()
        if line:
            data = line.split(';')
            if len(data) == 6:
                distance, co2, temperature, humidity, light, current = data
                print(f"Distance: {distance}, CO2: {co2}, Temperature: {temperature}, Humidity: {humidity}, Light: {light}, Current: {current}")
            else:
                print("Invalid data format received")        

if __name__ == "__main__":
    read_serial()