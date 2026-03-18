let stream;

export async function startCamera(videoElement) {
  stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "user",
      width: { ideal: 1080 },
      height: { ideal: 1440 },
    },
    audio: false,
  });

  videoElement.srcObject = stream;
  await videoElement.play();
}

export function stopCamera(videoElement) {
  if (videoElement) {
    videoElement.pause();
    videoElement.srcObject = null;
  }

  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
}
