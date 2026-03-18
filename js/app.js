import { startCamera, stopCamera } from "./camera.js";
import { runCountdown } from "./countdown.js";
import { captureFrame } from "./capture.js";
import { getSession, resetSession, setPhotos } from "./state.js";
import { getTemplateById, renderTemplatePicker } from "./templates.js";

const videoElement = document.querySelector("#cameraFeed");
const canvasElement = document.querySelector("#captureCanvas");
const startSessionButton = document.querySelector("#startSessionButton");
const captureButton = document.querySelector("#captureButton");
const resultButton = document.querySelector("#resultButton");
const retakeButton = document.querySelector("#retakeButton");
const countdownBadge = document.querySelector("#countdownBadge");
const cameraStatus = document.querySelector("#cameraStatus");
const cameraEmptyState = document.querySelector("#cameraEmptyState");
const capturedThumbs = document.querySelector("#capturedThumbs");
const templateGrid = document.querySelector("#templateGrid");
const selectedTemplateName = document.querySelector("#selectedTemplateName");

const TOTAL_SHOTS = 4;

let isCapturing = false;
let cameraReady = false;

renderTemplatePicker(templateGrid, selectedTemplateName);
syncSessionPreview();
syncButtons();

startSessionButton.addEventListener("click", async () => {
  if (cameraReady) {
    cameraStatus.textContent = "Camera ready";
    return;
  }

  try {
    await startCamera(videoElement);
    cameraReady = true;
    cameraStatus.textContent = "Camera ready";
    cameraEmptyState.classList.add("is-hidden");
  } catch (error) {
    cameraStatus.textContent = "Camera blocked";
    cameraEmptyState.classList.remove("is-hidden");
    cameraEmptyState.innerHTML = "<p>Izin kamera belum diberikan. Coba allow webcam lalu start lagi.</p>";
    console.error(error);
  }

  syncButtons();
});

captureButton.addEventListener("click", async () => {
  if (!cameraReady || isCapturing) {
    return;
  }

  isCapturing = true;
  syncButtons();
  cameraStatus.textContent = "Capturing strip";

  const capturedPhotos = [];

  for (let index = 0; index < TOTAL_SHOTS; index += 1) {
    cameraStatus.textContent = `Shot ${index + 1} of ${TOTAL_SHOTS}`;
    await runCountdown(countdownBadge, 3);
    const photo = captureFrame(videoElement, canvasElement);
    capturedPhotos.push(photo);
    renderThumbs(capturedPhotos);
  }

  setPhotos(capturedPhotos);
  cameraStatus.textContent = `Photostrip ready · ${getTemplateById(getSession().templateId).name}`;
  isCapturing = false;
  syncButtons();
});

resultButton.addEventListener("click", () => {
  if (!getSession().photos.length) {
    return;
  }

  window.location.href = "./result.html";
});

retakeButton.addEventListener("click", () => {
  resetSession();
  syncSessionPreview();
  cameraStatus.textContent = cameraReady ? "Camera ready" : "Camera idle";
  syncButtons();
});

window.addEventListener("beforeunload", () => {
  stopCamera(videoElement);
});

function syncButtons() {
  captureButton.disabled = !cameraReady || isCapturing;
  resultButton.disabled = !getSession().photos.length || isCapturing;
  startSessionButton.disabled = isCapturing;
  retakeButton.disabled = isCapturing;
}

function syncSessionPreview() {
  const session = getSession();
  renderThumbs(session.photos);
  if (session.photos.length) {
    cameraStatus.textContent = `Photostrip ready · ${getTemplateById(session.templateId).name}`;
  }
  syncButtons();
}

function renderThumbs(photos) {
  capturedThumbs.innerHTML = photos.length
    ? photos
        .map(
          (photo, index) => `
            <div class="thumb-card">
              <img src="${photo}" alt="Captured shot ${index + 1}" />
            </div>
          `
        )
        .join("")
    : Array.from({ length: TOTAL_SHOTS }, () => '<div class="thumb-card"></div>').join("");
}
