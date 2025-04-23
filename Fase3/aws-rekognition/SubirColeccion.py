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

def subir_coleccion(nombre_coleccion, path_imagen, external_image_id):
    try:
        with open(path_imagen, 'rb') as img_file:
            buffer_img = img_file.read()

        response = rekognition_client.index_faces(
            CollectionId=nombre_coleccion,
            Image={'Bytes': buffer_img},
            ExternalImageId=external_image_id,
            DetectionAttributes=['ALL']
        )

        print(f'Rostro "{external_image_id}" subido a la colección "{nombre_coleccion}" con éxito')
        if response['FaceRecords']:
            print("ID asignado:", external_image_id)
            print("Detalles:", response['FaceRecords'][0]['Face'])
        else:
            print("No se detectaron rostros.")

        return response
    except rekognition_client.exceptions.ResourceNotFoundException:
        print("La colección no existe")
    except (BotoCoreError, ClientError) as error:
        print("Error al indexar el rostro:", error)
        raise

# Leer argumentos desde la línea de comandos
if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Faltan argumentos: nombre de la colección, ruta de la imagen y ID externo")
        sys.exit(1)

    collection_name = sys.argv[1]
    path = sys.argv[2]
    external_image_id = sys.argv[3]

    subir_coleccion(collection_name, path, external_image_id)
