import os
import boto3
from dotenv import load_dotenv
from botocore.exceptions import BotoCoreError, ClientError

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Configurar el cliente de Rekognition
rekognition_client = boto3.client(
    'rekognition',
    region_name=os.getenv("AWS_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

def listar_colecciones():
    try:
        response = rekognition_client.list_collections()
        print("Lista de colecciones:")
        for collection_id in response.get("CollectionIds", []):
            print(collection_id)
    except (BotoCoreError, ClientError) as error:
        print("Error al listar las colecciones:", error)

# Ejecutar la función
if __name__ == "__main__":
    listar_colecciones()
