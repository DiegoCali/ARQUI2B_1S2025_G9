require("dotenv").config();
const fs = require("fs");
const {
  RekognitionClient,
  SearchFacesByImageCommand,
} = require("@aws-sdk/client-rekognition");
const path = require("path");

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function ReconocerImagenLocal(pathImg) {
  try {
    const bufferImg = fs.readFileSync(pathImg);

    const params = {
      CollectionId: "mi-coleccion",
      Image: {
        Bytes: bufferImg,
      },
      MaxFaces: 1,
      FaceMatchThreshold: 90, //porcentaje similitud
    };

    const command = new SearchFacesByImageCommand(params);
    const result = await rekognitionClient.send(command);

    if (result.FaceMatches && result.FaceMatches.length > 0) {
      const matchedName = result.FaceMatches[0].Face?.ExternalImageId;
      return matchedName.endsWith(".jpg") ? matchedName : `${matchedName}.jpg`;
    }

    console.log("No se encontró el rostro en la colección");
    return null;
  } catch (error) {
    if (
      error.name === "InvalidParameterException" &&
      error.message.includes("No face detected")
    ) {
      console.log("No se detectó ningún rostro en la imagen");
      return null;
    }

    console.error("Error al buscar el rostro:", error);
    throw error;
  }
}

async function main() {
  if (process.argv.lenght < 3) {
    console.log("Faltan argumentos");
    console.log("Uso: node ReconocerImagen.js <ruta de la imagen>");
    return;
  }

  const imagePath = process.argv[2];
  const result = await ReconocerImagenLocal(imagePath);

  if (result) {
    console.log("Rostro encontrado:", result);
  } else {
    console.log("No se encontró el rostro");
  }
}

main();
