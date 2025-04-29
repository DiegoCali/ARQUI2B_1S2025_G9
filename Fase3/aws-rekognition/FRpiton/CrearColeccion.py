import os
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Configurar el cliente de Rekognition
rekognition_client = boto3.client(
    'rekognition',
    region_name=os.getenv('AWS_REGION'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

def crear_coleccion(collection_name):
    try:
        response = rekognition_client.create_collection(
            CollectionId=collection_name
        )
        print(f'Colección "{collection_name}" creada con éxito')
        print("Código de estado:", response['StatusCode'])
        print("ARN de la colección:", response['CollectionArn'])
        return response
    except ClientError as error:
        if error.response['Error']['Code'] == 'ResourceAlreadyExistsException':
            print("La colección ya existe")
        else:
            print("Error al crear la colección:", error)
            raise

if __name__ == '__main__':
    import sys
    collection_name = sys.argv[1] if len(sys.argv) > 1 else "mi-coleccion"
    crear_coleccion(collection_name)
