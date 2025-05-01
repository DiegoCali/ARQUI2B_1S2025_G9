from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import shutil
import os
from FRpiton.ReconocerImagen import reconocer_imagen_local

app = FastAPI()

UPLOAD_DIR = "imagenes_temporales"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/reconocer/")
async def reconocer(file: UploadFile = File(...)):
    try:
        # Guardar la imagen temporalmente
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Llamar la función de reconocimiento
        resultado = reconocer_imagen_local(file_path)

        # Eliminar la imagen después de usarla
        os.remove(file_path)

        if resultado:
            return {"mensaje": "Rostro encontrado", "imagen": resultado}
        else:
            return JSONResponse(status_code=404, content={"mensaje": "No se encontró el rostro"})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
