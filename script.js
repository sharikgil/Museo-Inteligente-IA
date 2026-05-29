const MODEL_URL = "./my_model/";

let model;
let webcam;
let labelContainer;
let isCameraRunning = false;

window.onload = async function () {

    const modelURL = MODEL_URL + "model.json";
    const metadataURL = MODEL_URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);

    labelContainer = document.getElementById("label-container");

    console.log("Modelo cargado correctamente");
};

async function initCamera() {

    if (isCameraRunning) return;

    document.getElementById("uploaded-image").src = "";

    document.getElementById("label-container").innerHTML = "";

    isCameraRunning = true;

    const btn = document.getElementById("start-btn");

    btn.disabled = true;
    btn.innerText = "Cámara iniciada";

    webcam = new tmImage.Webcam(300, 300, true);

    await webcam.setup();

    await webcam.play();

    document.getElementById("webcam-container")
        .appendChild(webcam.canvas);

    loop();
}

function stopCamera() {

    isCameraRunning = false;

    if (webcam) {

        webcam.stop();

        webcam = null;
    }

    document.getElementById("webcam-container").innerHTML = "";

    document.getElementById("label-container").innerHTML = "";

    const btn = document.getElementById("start-btn");

    btn.disabled = false;
    btn.innerText = "Iniciar cámara";
}

async function loop() {

    // Si cámara apagada, detener
    if (!isCameraRunning || !webcam) {
        return;
    }

    webcam.update();

    const prediction = await model.predict(webcam.canvas);

    // Verificar otra vez
    if (!isCameraRunning || !webcam) {
        return;
    }

    displayPredictions(prediction);

    requestAnimationFrame(loop);
}

document.getElementById("image-upload")
.addEventListener("change", function (event) {

    // Si la cámara está activa
    if (isCameraRunning) {

        alert("Apaga la cámara antes de subir una imagen.");

        // Limpiar selección del input
        event.target.value = "";

        return;
    }

    const file = event.target.files[0];

    if (!file) return;

    const image = document.getElementById("uploaded-image");

    image.src = URL.createObjectURL(file);

    image.onload = async function () {

        const prediction = await model.predict(image);

        displayPredictions(prediction);
    };
});

function displayPredictions(predictions) {

    labelContainer.innerHTML = "";

    predictions.forEach(prediction => {

        const div = document.createElement("div");

        div.classList.add("prediction");

        div.innerHTML =
            `${prediction.className}: ${(prediction.probability * 100).toFixed(1)}%`;

        labelContainer.appendChild(div);
    });
}