import os
import sys
import boto3
from dotenv import load_dotenv
from botocore.exceptions import BotoCoreError, ClientError

# Cargar variables de entorno
load_dotenv()

# Crear cliente de Rekognition
rekognition_client = boto3.client(
    'rekognition',
    region_name=os.getenv("AWS_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

def reconocer_imagen_local(path_img):
    try:
        with open(path_img, 'rb') as image_file:
            buffer_img = image_file.read()

        params = {
            'CollectionId': 'mi-coleccion',
            'Image': {
                'Bytes': buffer_img,
            },
            'MaxFaces': 1,
            'FaceMatchThreshold': 90
        }

        response = rekognition_client.search_faces_by_image(**params)

        matches = response.get('FaceMatches', [])
        if matches:
            matched_name = matches[0]['Face'].get('ExternalImageId', '')
            if matched_name:
                return matched_name if matched_name.endswith('.jpg') else f'{matched_name}.jpg'

        print("No se encontró el rostro en la colección")
        return None

    except rekognition_client.exceptions.InvalidParameterException as error:
        if "No face detected" in str(error):
            print("No se detectó ningún rostro en la imagen")
            return None
        else:
            raise
    except (BotoCoreError, ClientError) as error:
        print("Error al buscar el rostro:", error)
        raise

def main():
    if len(sys.argv) < 2:
        print("Faltan argumentos")
        print("Uso: python reconocer_imagen.py <ruta de la imagen>")
        return

    image_path = sys.argv[1]
    result = reconocer_imagen_local(image_path)

    if result:
        print("Rostro encontrado:", result)
    else:
        print("No se encontró el rostro")

if __name__ == "__main__":
    main()
