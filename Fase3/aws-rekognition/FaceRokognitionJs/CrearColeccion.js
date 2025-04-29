require("dotenv").config();
const {
  RekognitionClient,
  CreateCollectionCommand,
} = require("@aws-sdk/client-rekognition");

//configura el cliente de Rekognition
const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function crearColeccion(collectionName) {
  try {
    const command = new CreateCollectionCommand({
      CollectionId: collectionName,
    });
    const response = await rekognitionClient.send(command);
    console.log(`Colección "${collectionName}" creada con éxito`);
    console.log("codigo de estado:", response.StatusCode);
    console.log("ARN de la coleccion:", response.CollectionArn);

    return response;
  } catch (error) {
    if (error.name === "ResourceAlreadyExistsException") {
      console.log("La colección ya existe");
    } else {
      console.log("Error al crear la colección:", error);
      throw error;
    }
  }
}

const collectionName = process.argv[2] || "mi-coleccion";
crearColeccion(collectionName);
