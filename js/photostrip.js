import { formatSessionDate } from "./utils.js";

export async function renderPhotostrip({ canvas, photos, template, createdAt, eventName = "" }) {
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const margin = 44;
  const gap = 24;
  const headerHeight = 140;
  const footerHeight = 120;

  context.clearRect(0, 0, width, height);
  context.fillStyle = template.background;
  context.fillRect(0, 0, width, height);

  context.fillStyle = template.panelColor;
  roundRect(context, 24, 24, width - 48, height - 48, 28);
  context.fill();

  context.fillStyle = template.textColor;
  context.font = '72px "Bebas Neue"';
  context.fillText("PHOTO BOOTH", margin, 100);

  context.font = '28px "DM Sans"';
  context.fillText(formatSessionDate(createdAt), margin, 132);

  if (eventName) {
    context.fillStyle = template.accentColor;
    context.font = '30px "DM Sans"';
    context.fillText(eventName.toUpperCase(), margin, 170);
    context.fillStyle = template.textColor;
  }

  const images = await Promise.all(photos.map(loadImage));

  drawFramesByLayout({
    context,
    images,
    template,
    width,
    height,
    margin,
    gap,
    headerHeight,
    footerHeight,
  });

  context.fillStyle = template.accentColor;
  context.font = '40px "Bebas Neue"';
  context.fillText(template.name.toUpperCase(), margin, height - 48);

  context.textAlign = "right";
  context.fillText("TELLO PHOTO BOX", width - margin, height - 48);
  context.textAlign = "left";

  return canvas.toDataURL("image/png");
}

function drawFramesByLayout({
  context,
  images,
  template,
  width,
  height,
  margin,
  gap,
  headerHeight,
  footerHeight,
}) {
  const availableWidth = width - margin * 2;
  const startY = margin + headerHeight;
  const framesHeight = height - startY - footerHeight - margin;
  const frameRects = getFrameRects(template.layout, availableWidth, framesHeight, gap);

  frameRects.forEach((rect, index) => {
    if (!images[index]) {
      return;
    }

    drawCoverImage(
      context,
      images[index],
      margin + rect.x,
      startY + rect.y,
      rect.width,
      rect.height
    );
  });
}

function getFrameRects(layout, width, height, gap) {
  const halfWidth = (width - gap) / 2;
  const oneThirdWidth = (width - gap * 2) / 3;
  const halfHeight = (height - gap) / 2;

  const layouts = {
    classicStack: [
      { x: 0, y: 0, width, height: (height - gap * 3) / 4 },
      { x: 0, y: (height - gap * 3) / 4 + gap, width, height: (height - gap * 3) / 4 },
      { x: 0, y: ((height - gap * 3) / 4 + gap) * 2, width, height: (height - gap * 3) / 4 },
      { x: 0, y: ((height - gap * 3) / 4 + gap) * 3, width, height: (height - gap * 3) / 4 },
    ],
    stackedHero: [
      { x: 0, y: 0, width, height: 235 },
      { x: 0, y: 259, width: halfWidth, height: 215 },
      { x: halfWidth + gap, y: 259, width: halfWidth, height: 215 },
      { x: 0, y: 498, width, height: height - 498 },
    ],
    duoSplit: [
      { x: 0, y: 0, width: halfWidth, height: 360 },
      { x: halfWidth + gap, y: 0, width: halfWidth, height: 360 },
      { x: 0, y: 384, width: halfWidth, height: height - 384 },
      { x: halfWidth + gap, y: 384, width: halfWidth, height: height - 384 },
    ],
    postcard: [
      { x: 0, y: 0, width, height: 190 },
      { x: 0, y: 214, width, height: 225 },
      { x: 0, y: 463, width: halfWidth, height: height - 463 },
      { x: halfWidth + gap, y: 463, width: halfWidth, height: height - 463 },
    ],
    leftHero: [
      { x: 0, y: 0, width: width * 0.56, height: height * 0.66 },
      { x: width * 0.56 + gap, y: 0, width: width * 0.44 - gap, height: height * 0.31 },
      { x: width * 0.56 + gap, y: height * 0.31 + gap, width: width * 0.44 - gap, height: height * 0.35 - gap },
      { x: 0, y: height * 0.66 + gap, width, height: height * 0.34 - gap },
    ],
    quadMix: [
      { x: 0, y: 0, width: halfWidth, height: halfHeight },
      { x: halfWidth + gap, y: 0, width: halfWidth, height: halfHeight * 0.78 },
      { x: halfWidth + gap, y: halfHeight * 0.78 + gap, width: halfWidth, height: height - (halfHeight * 0.78 + gap) },
      { x: 0, y: halfHeight + gap, width: halfWidth, height: height - (halfHeight + gap) },
    ],
    ribbonTop: [
      { x: 0, y: 0, width, height: 145 },
      { x: 0, y: 169, width: halfWidth, height: 255 },
      { x: halfWidth + gap, y: 169, width: halfWidth, height: 255 },
      { x: 0, y: 448, width, height: height - 448 },
    ],
    centerStage: [
      { x: oneThirdWidth * 0.18, y: 0, width: width - oneThirdWidth * 0.36, height: 205 },
      { x: 0, y: 229, width: halfWidth, height: 190 },
      { x: halfWidth + gap, y: 229, width: halfWidth, height: 190 },
      { x: 0, y: 443, width, height: height - 443 },
    ],
    tallCard: [
      { x: 0, y: 0, width, height: 325 },
      { x: 0, y: 349, width: halfWidth, height: 170 },
      { x: halfWidth + gap, y: 349, width: halfWidth, height: 170 },
      { x: 0, y: 543, width, height: height - 543 },
    ],
    offsetGrid: [
      { x: oneThirdWidth * 0.42, y: 0, width: width - oneThirdWidth * 0.42, height: 190 },
      { x: 0, y: 214, width: halfWidth, height: 210 },
      { x: halfWidth + gap, y: 214, width: halfWidth, height: 210 },
      { x: 0, y: 448, width: width * 0.72, height: height - 448 },
    ],
  };

  return (layouts[layout] ?? layouts.stackedHero).map((rect) => ({
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.max(120, Math.round(rect.height)),
  }));
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawCoverImage(context, image, x, y, width, height) {
  const targetRatio = width / height;
  const sourceRatio = image.width / image.height;

  let sx = 0;
  let sy = 0;
  let sw = image.width;
  let sh = image.height;

  if (sourceRatio > targetRatio) {
    sw = image.height * targetRatio;
    sx = (image.width - sw) / 2;
  } else {
    sh = image.width / targetRatio;
    sy = (image.height - sh) / 2;
  }

  context.save();
  roundRect(context, x, y, width, height, 24);
  context.clip();
  context.drawImage(image, sx, sy, sw, sh, x, y, width, height);
  context.restore();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}
