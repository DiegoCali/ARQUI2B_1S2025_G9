require("dotenv").config();
const {
  RekognitionClient,
  ListCollectionsCommand,
} = require("@aws-sdk/client-rekognition");

//configura el cliente de Rekognition
const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function listarColecciones() {
  try {
    const command = new ListCollectionsCommand({});
    const response = await rekognitionClient.send(command);
    console.log("Lista de colecciones:");
    response.CollectionIds.forEach((collectionId) => {
      console.log(collectionId);
    });
  } catch (error) {
    console.log("Error al listar las colecciones:", error);
  }
}

listarColecciones();
