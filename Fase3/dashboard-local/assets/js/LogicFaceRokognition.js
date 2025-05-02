const client3 = new Paho.MQTT.Client(
  config.MQTT_BROKER_URL,
  config.MQTT_PORT,
  config.MQTT_CLIENT_ID + "_3"
);

// 1. Configurar eventos
client3.onConnectionLost = (responseObject) => {
  if (responseObject.errorCode !== 0) {
    console.error("Conexión perdida:", responseObject.errorMessage);
  }
};

client3.connect({
  useSSL: true,
  onSuccess: () => {
    console.log("Conectado al broker reconocimiento facial");
    client3.subscribe(config.MQTT_TOPIC_DATA);

    // Ahora podemos publicar el comando, ya que la conexión fue exitoso
  },
  onFailure: (error) => {
    console.error("Error de conexión:", error.errorMessage);
  },
});

// Función para validar el código de verificación
const validateCode = (code) => {
  const validCode = config.CODE; // El código de verificación válido

  // Verificar si el código ingresado es correcto
  return code === validCode;
};

// Función para cambiar de modal
const showModal = (modalIdToShow, modalIdToHide) => {
  // Cerrar el modal actual
  const currentModal = new bootstrap.Modal(
    document.getElementById(modalIdToHide)
  );
  currentModal.hide();

  // Abrir el siguiente modal
  const nextModal = new bootstrap.Modal(document.getElementById(modalIdToShow));
  nextModal.show();
};

// Event listener para el primer modal (para verificar el código de verificación)
document
  .getElementById("verificationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    // Obtener el código ingresado
    const codeInputs = document.querySelectorAll("#verticallyCentered input");
    let code = "";
    codeInputs.forEach((input) => {
      code += input.value; // Concatenar los valores de las entradas
    });

    // Validar el código
    if (validateCode(code)) {
      // Si el código es correcto, cerrar el primer modal y abrir el segundo
      showModal("modalLogin", "verticallyCentered");
    } else {
      // Mostrar la alerta de error
      const errorAlert = document.getElementById("errorAlert");
      errorAlert.classList.remove("d-none"); // Muestra la alerta

      // Ocultar la alerta después de 3 segundos
      setTimeout(() => {
        errorAlert.classList.add("d-none"); // Ocultar la alerta
      }, 3000);
    }
  });

function captureImage() {
  const video = document.getElementById("videoElement");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  // Establecer el tamaño del canvas igual al del video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Dibujar el fotograma actual del video en el canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convertir la imagen del canvas a base64
  return canvas.toDataURL("image/jpeg");
}

// Configuración de AWS SDK con las credenciales directamente 
AWS.config.update({
  region: config.AWS_REGION, 
  credentials: new AWS.Credentials({
    accessKeyId: config.AWS_ACCESS_KEY_ID, 
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY, 
  }),
});

const rekognition = new AWS.Rekognition();

// Función para reconocer la imagen capturada
async function reconocerImagen(imageData) {
  const params = {
    CollectionId: config.COLLECTION_ID, // Nombre de tu colección en Rekognition
    Image: {
      Bytes: new Uint8Array(imageData), // Convierte la imagen a un formato compatible
    },
    MaxFaces: 1,
    FaceMatchThreshold: 90, // Umbral de coincidencia de rostro
  };

  rekognition.searchFacesByImage(params, function (err, data) {
    if (err) {
      console.error("Error de Rekognition:", err);

      const alertError = document.getElementById("errorResult");
      alertError.classList.remove("d-none"); // Muestra la alerta
      alertError.innerText = "Error al procesar la imagen ";

      // Ocultar la alerta después de 3 segundos
      setTimeout(() => {
        alertError.classList.add("d-none"); // Ocultar la alerta
      }, 3000);
    } else {
      err;
      if (data.FaceMatches && data.FaceMatches.length > 0) {
        const matchedName = data.FaceMatches[0].Face?.ExternalImageId;
        console.log("Rostro encontrado:", matchedName);
        //document.getElementById('result').innerText = "Rostro encontrado: " + matchedName;
        const alertSuccess = document.getElementById("successResult");
        alertSuccess.classList.remove("d-none"); // Muestra la alerta

        alertSuccess.innerText = "Rostro encontrado: " + matchedName;

        document.getElementById("descAccess").innerText =
          "Accesos Correcto: ";

        

        console.log("Accediendo Datacenter");
        
        const command = "facetrue"; // Comando para encender la luz

        // 3. Enviar el comando al topic correspondiente
        const payload = {
          command: command, // Enviar el comando al topic
        };

        // 4. Publicar el mensaje a través del cliente MQTT
        const message = new Paho.MQTT.Message(JSON.stringify(payload));
        message.destinationName = config.MQTT_TOPIC_COMMANDS;

        client3.send(message);

        console.log(
          "Mensaje enviado automáticamente:",
          JSON.stringify(payload)
        );

        // Ocultar la alerta después de 3 segundos
        setTimeout(() => {
          alertSuccess.classList.add("d-none"); // Ocultar la alerta
          closeModals();  // Cerrar ambos modales
        }, 3000);
      } else {
        // document.getElementById('result').innerText = "No se encontró el rostro en la colección.";
        console.log("No se encontró el rostro en la colección.");
        const alertError = document.getElementById("errorResult");
        alertError.classList.remove("d-none"); // Muestra la alerta
        alertError.innerText = "No se encontró el rostro en la colección.";

        // Ocultar la alerta después de 3 segundos
        setTimeout(() => {
          alertError.classList.add("d-none"); // Ocultar la alerta
        }, 3000);
      }
    }
  });
}

// Event listener para el botón de verificación (reconocimiento facial)
document.getElementById("verifyImage").addEventListener("click", function () {
  const imageData = captureImage(); // Captura la imagen del video
  const byteArray = atob(imageData.split(",")[1]); // Convierte la imagen base64 a bytes
  const byteArrayBuffer = new ArrayBuffer(byteArray.length);
  const byteArrayView = new Uint8Array(byteArrayBuffer);

  for (let i = 0; i < byteArray.length; i++) {
    byteArrayView[i] = byteArray.charCodeAt(i);
  }

  // Llamar a la función de reconocimiento facial con la imagen capturada
  reconocerImagen(byteArrayBuffer);
});

// Iniciar la cámara cuando el modal de reconocimiento facial se abra
document
  .getElementById("modalLogin")
  .addEventListener("shown.bs.modal", function () {
    startCamera();
  });
// Función para iniciar la cámara
function startCamera() {
  const video = document.getElementById("videoElement");

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(function (stream) {
        video.srcObject = stream;
      })
      .catch(function (error) {
        console.error("Error al acceder a la cámara: ", error);
      });
  }
}

// Función para detener la cámara cuando el modal se cierra
document
  .getElementById("modalLogin")
  .addEventListener("hidden.bs.modal", function () {
    const video = document.getElementById("videoElement");
    const stream = video.srcObject;
    const tracks = stream.getTracks();

    // Detener todos los tracks de video (cámara)
    tracks.forEach((track) => track.stop());
  });

  function closeModals() {

  }