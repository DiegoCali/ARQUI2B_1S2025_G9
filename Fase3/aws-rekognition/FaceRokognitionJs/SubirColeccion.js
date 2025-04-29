require("dotenv").config();
const fs = require("fs");
const {
  RekognitionClient,
  IndexFacesCommand,
} = require("@aws-sdk/client-rekognition");

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function subirColeccion(nombreColeccion, path, externalImageId) {
  try {
    const bufferImg = fs.readFileSync(path);

    const command = new IndexFacesCommand({
      CollectionId: nombreColeccion,
      Image: {
        Bytes: bufferImg,
      },
      ExternalImageId: externalImageId,
      DetectionAttributes: ["ALL"],
    });

    const response = await rekognitionClient.send(command);

    console.log(
      `Rostro "${externalImageId}" subido a la colección "${nombreColeccion}" con éxito`
    );
    console.log(`ID asignado:", ${externalImageId}`);
    console.log("Detalles: ", response.FaceRecords[0].Face);

    return response;
  } catch (error) {
    console.error("Error al indexar el rostro ", error.name);
    if (error.name === "ResourceNotFoundException") {
      console.log("La colección no existe");
    }
    throw error;
  }
}

const [, , collectionName, path, externalImageId] = process.argv;
if (!collectionName || !path || !externalImageId) {
  console.log(
    "Faltan argumentos: nombre de la colección, ruta de la imagen y ID externo"
  );
  process.exit(1);
}

subirColeccion(collectionName, path, externalImageId);
