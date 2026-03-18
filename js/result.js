import { renderPhotostrip } from "./photostrip.js";
import { getSession } from "./state.js";
import { getTemplateById } from "./templates.js";
import { downloadDataUrl, formatSessionDate } from "./utils.js";

const resultCanvas = document.querySelector("#resultCanvas");
const downloadButton = document.querySelector("#downloadButton");
const sessionMeta = document.querySelector("#sessionMeta");
const resultSummary = document.querySelector("#resultSummary");
const resultFrame = document.querySelector("#resultFrame");

const session = getSession();

if (!session.photos.length) {
  window.location.href = "./index.html";
} else {
  const template = getTemplateById(session.templateId);
  let exportDataUrl = "";

  applyTemplateTheme(template);
  renderSessionMeta();
  renderResult();

  downloadButton.addEventListener("click", () => {
    if (!exportDataUrl) {
      return;
    }

    downloadDataUrl(`photostrip-${template.id}.png`, exportDataUrl);
  });

  async function renderResult() {
    exportDataUrl = await renderPhotostrip({
      canvas: resultCanvas,
      photos: session.photos,
      template,
      createdAt: session.createdAt,
    });
  }

  function renderSessionMeta() {
    sessionMeta.innerHTML = `
      <div>
        <span>Template</span>
        <strong>${template.name}</strong>
      </div>
      <div>
        <span>Captured</span>
        <strong>${formatSessionDate(session.createdAt)}</strong>
      </div>
    `;
  }
}

function applyTemplateTheme(template) {
  document.body.classList.add("result-themed");
  document.body.style.setProperty("--result-bg", template.background);
  document.body.style.setProperty("--result-bg-accent", mixColor(template.background, "#ffffff", 0.45));
  document.body.style.setProperty("--result-surface", mixColor(template.panelColor, "#ffffff", 0.2));
  document.body.style.setProperty("--result-panel", template.panelColor);
  document.body.style.setProperty("--result-accent", template.accentColor);
  document.body.style.setProperty("--result-text", template.textColor);
  document.body.style.setProperty("--result-muted", mixColor(template.textColor, "#ffffff", 0.56));

  resultSummary.style.borderColor = mixColor(template.accentColor, "#ffffff", 0.72);
  resultFrame.style.border = `1px solid ${mixColor(template.accentColor, "#ffffff", 0.66)}`;
}

function mixColor(hexA, hexB, weight = 0.5) {
  const colorA = hexToRgb(hexA);
  const colorB = hexToRgb(hexB);

  const mixed = {
    r: Math.round(colorA.r * (1 - weight) + colorB.r * weight),
    g: Math.round(colorA.g * (1 - weight) + colorB.g * weight),
    b: Math.round(colorA.b * (1 - weight) + colorB.b * weight),
  };

  return `rgb(${mixed.r}, ${mixed.g}, ${mixed.b})`;
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const fullHex = normalized.length === 3
    ? normalized
        .split("")
        .map((char) => char + char)
        .join("")
    : normalized;

  return {
    r: parseInt(fullHex.slice(0, 2), 16),
    g: parseInt(fullHex.slice(2, 4), 16),
    b: parseInt(fullHex.slice(4, 6), 16),
  };
}
