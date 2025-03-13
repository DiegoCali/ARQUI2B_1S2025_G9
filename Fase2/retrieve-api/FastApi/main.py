from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine, Column, Integer, Float, DateTime
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Puedes restringir a ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración de la conexión a MySQL
DATABASE_URL = "mysql+pymysql://adminArqui2:Arqui2Project*@arqui2project.cctkkcomupit.us-east-1.rds.amazonaws.com/arqui2db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

class SensorData(Base):
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, index=True)
    distance = Column(Float)
    co2 = Column(Float)
    temperature = Column(Float)
    humidity = Column(Float)
    light = Column(Float)
    current = Column(Float)
    date_time = Column(DateTime)





# Ruta para obtener todos los datos en un array
@app.get("/all-data/")
def get_all_data():
    db = SessionLocal()
    all_entries = db.query(SensorData).order_by(SensorData.date_time.desc()).all()
    db.close()# Ruta para obtener el último valor de distance
    
    if not all_entries:
        raise HTTPException(status_code=404, detail="No data found")

    return [
        {
            "id": entry.id,
            "distance": entry.distance,
            "co2": entry.co2,
            "temperature": entry.temperature,
            "humidity": entry.humidity,
            "light": entry.light,
            "current": entry.current,
            "date_time": entry.date_time
        }
        for entry in all_entries
    ]

@app.get("/getDistance/")
def get_last_distance():
    db = SessionLocal()
    last_entry = db.query(SensorData).order_by(SensorData.date_time.desc()).first()
    db.close()
    
    if not last_entry:
        raise HTTPException(status_code=404, detail="No data found")

    return {"distance": last_entry.distance}

@app.get("/getCO2/")
def get_last_co2():
    db = SessionLocal()
    last_entry = db.query(SensorData).order_by(SensorData.date_time.desc()).first()
    db.close()
    
    if not last_entry:
        raise HTTPException(status_code=404, detail="No data found")

    return {"co2": last_entry.co2}

@app.get("/getTemperature/")
def get_last_temperature():
    db = SessionLocal()
    last_entry = db.query(SensorData).order_by(SensorData.date_time.desc()).first()
    db.close()
    
    if not last_entry:
        raise HTTPException(status_code=404, detail="No data found")

    return {"temperature": last_entry.temperature}

@app.get("/getHumidity/")
def get_last_humidity():
    db = SessionLocal()
    last_entry = db.query(SensorData).order_by(SensorData.date_time.desc()).first()
    db.close()
    
    if not last_entry:
        raise HTTPException(status_code=404, detail="No data found")

    return {"humidity": last_entry.humidity}

@app.get("/getLight/")
def get_last_light():
    db = SessionLocal()
    last_entry = db.query(SensorData).order_by(SensorData.date_time.desc()).first()
    db.close()
    
    if not last_entry:
        raise HTTPException(status_code=404, detail="No data found")

    return {"light": last_entry.light}

@app.get("/getCurrent/")
def get_last_current():
    db = SessionLocal()
    last_entry = db.query(SensorData).order_by(SensorData.date_time.desc()).first()
    db.close()
    
    if not last_entry:
        raise HTTPException(status_code=404, detail="No data found")

    return {"current": last_entry.current}


@app.get("/getStatus/")
def getStatus():
    return {"Status": "Sucefull"}