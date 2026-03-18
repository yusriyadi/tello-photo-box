const MAX_CAPTURE_WIDTH = 900;
const JPEG_QUALITY = 0.86;

export function captureFrame(videoElement, canvasElement) {
  const sourceWidth = videoElement.videoWidth;
  const sourceHeight = videoElement.videoHeight;
  const scale = Math.min(1, MAX_CAPTURE_WIDTH / sourceWidth);
  const width = Math.round(sourceWidth * scale);
  const height = Math.round(sourceHeight * scale);
  const context = canvasElement.getContext("2d");

  canvasElement.width = width;
  canvasElement.height = height;

  context.save();
  context.translate(width, 0);
  context.scale(-1, 1);
  context.drawImage(videoElement, 0, 0, width, height);
  context.restore();

  return canvasElement.toDataURL("image/jpeg", JPEG_QUALITY);
}
