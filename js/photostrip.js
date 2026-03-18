import { formatSessionDate } from "./utils.js";

export async function renderPhotostrip({ canvas, photos, template, createdAt }) {
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const margin = 44;
  const gap = 24;
  const headerHeight = 140;
  const footerHeight = 120;
  const frameHeight = (height - headerHeight - footerHeight - margin * 2 - gap * 3) / 4;

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
    frameHeight,
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
  frameHeight,
}) {
  const availableWidth = width - margin * 2;
  const startY = margin + headerHeight;
  const bottomLimit = height - margin - footerHeight;

  if (template.layout === "stackedHero") {
    const heroHeight = 240;
    const rowHeight = 250;
    const footerFrameHeight = Math.max(0, bottomLimit - (startY + heroHeight + gap + rowHeight + gap));
    drawCoverImage(context, images[0], margin, startY, availableWidth, heroHeight);
    drawCoverImage(context, images[1], margin, startY + heroHeight + gap, (availableWidth - gap) / 2, rowHeight);
    drawCoverImage(
      context,
      images[2],
      margin + (availableWidth + gap) / 2,
      startY + heroHeight + gap,
      (availableWidth - gap) / 2,
      rowHeight
    );
    drawCoverImage(context, images[3], margin, startY + heroHeight + gap + rowHeight + gap, availableWidth, footerFrameHeight);
    return;
  }

  if (template.layout === "duoSplit") {
    const topHeight = 390;
    const bottomHeight = Math.max(0, bottomLimit - (startY + topHeight + gap));
    drawCoverImage(context, images[0], margin, startY, (availableWidth - gap) / 2, topHeight);
    drawCoverImage(
      context,
      images[1],
      margin + (availableWidth + gap) / 2,
      startY,
      (availableWidth - gap) / 2,
      topHeight
    );
    drawCoverImage(context, images[2], margin, startY + topHeight + gap, (availableWidth - gap) / 2, bottomHeight);
    drawCoverImage(
      context,
      images[3],
      margin + (availableWidth + gap) / 2,
      startY + topHeight + gap,
      (availableWidth - gap) / 2,
      bottomHeight
    );
    return;
  }

  if (template.layout === "postcard") {
    const topHeight = 220;
    const middleHeight = 260;
    const bottomHeight = Math.max(0, bottomLimit - (startY + topHeight + gap + middleHeight + gap));
    drawCoverImage(context, images[0], margin, startY, availableWidth, topHeight);
    drawCoverImage(context, images[1], margin, startY + topHeight + gap, availableWidth, middleHeight);
    drawCoverImage(context, images[2], margin, startY + topHeight + gap + middleHeight + gap, (availableWidth - gap) / 2, bottomHeight);
    drawCoverImage(
      context,
      images[3],
      margin + (availableWidth + gap) / 2,
      startY + topHeight + gap + middleHeight + gap,
      (availableWidth - gap) / 2,
      bottomHeight
    );
    return;
  }

  images.forEach((image, index) => {
    const y = startY + index * (frameHeight + gap);
    drawCoverImage(context, image, margin, y, availableWidth, frameHeight);
  });
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
