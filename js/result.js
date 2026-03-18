import { renderPhotostrip } from "./photostrip.js";
import { getSession, setTemplate } from "./state.js";
import { getTemplateById, getTemplates } from "./templates.js";
import { downloadDataUrl, formatSessionDate } from "./utils.js";

const downloadButton = document.querySelector("#downloadButton");
const sessionMeta = document.querySelector("#sessionMeta");
const resultSummary = document.querySelector("#resultSummary");
const resultEventName = document.querySelector("#resultEventName");
const resultTrack = document.querySelector("#resultTrack");
const resultDots = document.querySelector("#resultDots");
const resultPrevButton = document.querySelector("#resultPrevButton");
const resultNextButton = document.querySelector("#resultNextButton");

let session = getSession();
const templates = getTemplates();

if (!session.photos.length) {
  window.location.href = "./index.html";
} else {
  let activeTemplateId = getTemplateById(session.templateId).id;
  let exportDataUrl = "";
  let previewItems = [];
  let activeIndex = 0;

  buildCarousel();
  syncActiveTemplate(activeTemplateId, { scroll: false });

  downloadButton.addEventListener("click", () => {
    if (!exportDataUrl) {
      return;
    }

    downloadDataUrl(buildFilename(session.eventName, activeTemplateId), exportDataUrl);
  });

  resultPrevButton.addEventListener("click", () => {
    syncActiveIndex(Math.max(activeIndex - 1, 0));
  });

  resultNextButton.addEventListener("click", () => {
    syncActiveIndex(Math.min(activeIndex + 1, previewItems.length - 1));
  });

  resultTrack.addEventListener("scroll", () => {
    window.clearTimeout(resultTrack._scrollTimer);
    resultTrack._scrollTimer = window.setTimeout(() => {
      const nextIndex = findNearestSlideIndex();
      if (nextIndex !== activeIndex) {
        syncActiveIndex(nextIndex, { scroll: false });
      } else {
        updateCarouselState();
      }
    }, 70);
  });

  async function renderResult(template, canvas) {
    exportDataUrl = await renderPhotostrip({
      canvas,
      photos: session.photos,
      template,
      createdAt: session.createdAt,
      eventName: session.eventName,
    });
  }

  function renderSessionMeta(template) {
    sessionMeta.innerHTML = `
      <div>
        <span>Event</span>
        <strong>${session.eventName || "Open Session"}</strong>
      </div>
      <div>
        <span>Template</span>
        <strong>${template.name}</strong>
      </div>
      <div>
        <span>Captured</span>
        <strong>${formatSessionDate(session.createdAt)}</strong>
      </div>
    `;

    resultEventName.textContent = session.eventName || "Photostrip export ready";
  }

  function buildCarousel() {
    resultTrack.innerHTML = templates
      .map((template) => {
        return `
          <article class="result-slide" data-template-id="${template.id}">
            <div class="strip-frame result-slide-frame">
              <canvas class="result-slide-canvas" width="900" height="1600"></canvas>
            </div>
            <div class="result-slide-meta">
              <strong>${template.name}</strong>
              <span>${template.subtitle}</span>
            </div>
          </article>
        `;
      })
      .join("");

    resultDots.innerHTML = templates
      .map(
        (template, index) => `
          <button
            class="result-dot"
            data-slide-index="${index}"
            type="button"
            aria-label="Preview ${template.name}"
          ></button>
        `
      )
      .join("");

    previewItems = [...resultTrack.querySelectorAll(".result-slide")].map((slide, index) => {
      const template = templates[index];
      const canvas = slide.querySelector("canvas");

      slide.addEventListener("click", () => {
        syncActiveIndex(index);
      });

      return { slide, canvas, template };
    });

    resultDots.addEventListener("click", (event) => {
      const button = event.target.closest("[data-slide-index]");
      if (!button) {
        return;
      }

      syncActiveIndex(Number(button.dataset.slideIndex));
    });

    previewItems.forEach(({ template, canvas }) => {
      renderResult(template, canvas);
    });
  }

  function syncActiveTemplate(templateId, options = {}) {
    const nextIndex = templates.findIndex((template) => template.id === templateId);
    syncActiveIndex(nextIndex >= 0 ? nextIndex : 0, options);
  }

  function syncActiveIndex(index, options = {}) {
    const { scroll = true } = options;
    activeIndex = index;
    const activeItem = previewItems[activeIndex];
    const template = activeItem.template;

    activeTemplateId = template.id;
    setTemplate(template.id);
    session = getSession();

    applyTemplateTheme(template);
    renderSessionMeta(template);
    updateCarouselState();

    if (scroll) {
      activeItem.slide.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }

    renderResult(template, createExportCanvas()).then((dataUrl) => {
      exportDataUrl = dataUrl;
    });
  }

  function updateCarouselState() {
    previewItems.forEach(({ slide, template }, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-current", String(isActive));
      slide.querySelector(".result-slide-frame").style.borderColor = isActive
        ? mixColor(template.accentColor, "#ffffff", 0.48)
        : mixColor(template.accentColor, "#ffffff", 0.74);
    });

    resultDots.querySelectorAll(".result-dot").forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
    });

    resultPrevButton.disabled = activeIndex === 0;
    resultNextButton.disabled = activeIndex === previewItems.length - 1;
  }

  function findNearestSlideIndex() {
    const viewportCenter = resultTrack.scrollLeft + resultTrack.clientWidth / 2;
    let nearestIndex = activeIndex;
    let nearestDistance = Number.POSITIVE_INFINITY;

    previewItems.forEach(({ slide }, index) => {
      const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
      const distance = Math.abs(slideCenter - viewportCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  }
}

function createExportCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1600;
  return canvas;
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

function buildFilename(eventName, templateId) {
  const eventSlug = (eventName || "photostrip")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${eventSlug || "photostrip"}-${templateId}.png`;
}
