import { templates } from "../data/templates.js";
import { getSession, setTemplate } from "./state.js";

export function getTemplates() {
  return templates;
}

export function getTemplateById(id) {
  return templates.find((template) => template.id === id) ?? templates[0];
}

export function renderTemplatePicker(container, nameElement, onChange = null) {
  const { templateId } = getSession();
  const existingRow = container.querySelector(".template-row");
  const scrollLeft = existingRow ? existingRow.scrollLeft : 0;

  container.innerHTML = `
    <div class="template-row">
      ${templates
        .map((template) => {
          const activeClass = template.id === templateId ? "is-active" : "";

          return `
            <button class="template-card ${activeClass}" data-template-id="${template.id}" type="button">
              <div class="template-swatch" style="background:${template.background}; --template-accent:${template.accentColor}; --template-panel:${template.panelColor};">
                ${renderPreviewStrip(template.layout)}
              </div>
              <div class="template-meta">
                <strong>${template.name}</strong>
                <span>${template.subtitle}</span>
              </div>
            </button>
          `;
        })
        .join("")}
    </div>
  `;

  const selected = getTemplateById(templateId);
  nameElement.textContent = selected.name;
  const templateRow = container.querySelector(".template-row");

  if (templateRow) {
    templateRow.scrollLeft = scrollLeft;
  }

  container.querySelectorAll("[data-template-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTemplateId = button.dataset.templateId;
      setTemplate(nextTemplateId);
      renderTemplatePicker(container, nameElement, onChange);
      if (onChange) {
        onChange(nextTemplateId);
      }
    });
  });
}

function renderPreviewStrip(layout) {
  const map = {
    stackedHero: ["hero", "two-up", "wide"],
    duoSplit: ["two-tall", "two-up"],
    postcard: ["wide", "mid", "two-up"],
    leftHero: ["left-hero"],
    quadMix: ["quad-even"],
    ribbonTop: ["ribbon", "two-up", "wide"],
    centerStage: ["mid", "two-up", "wide"],
    tallCard: ["tall-card"],
    offsetGrid: ["offset-grid"],
  };

  const blocks = (map[layout] ?? ["quad-even"])
    .map((pattern) => renderPreviewBlock(pattern))
    .join("");

  return `
    <div class="template-preview-strip">
      <span class="template-preview-header"></span>
      <div class="template-preview-grid">
        ${blocks}
      </div>
      <span class="template-preview-footer"></span>
    </div>
  `;
}

function renderPreviewBlock(pattern) {
  if (pattern === "hero") {
    return '<span class="template-preview-frame template-preview-frame-hero"></span>';
  }

  if (pattern === "wide") {
    return '<span class="template-preview-frame template-preview-frame-wide"></span>';
  }

  if (pattern === "mid") {
    return '<span class="template-preview-frame template-preview-frame-mid"></span>';
  }

  if (pattern === "ribbon") {
    return '<span class="template-preview-frame template-preview-frame-ribbon"></span>';
  }

  if (pattern === "two-up") {
    return `
      <div class="template-preview-row-two">
        <span class="template-preview-frame"></span>
        <span class="template-preview-frame"></span>
      </div>
    `;
  }

  if (pattern === "two-tall") {
    return `
      <div class="template-preview-row-two template-preview-row-tall">
        <span class="template-preview-frame"></span>
        <span class="template-preview-frame"></span>
      </div>
    `;
  }

  if (pattern === "left-hero") {
    return `
      <div class="template-preview-row-asym">
        <span class="template-preview-frame template-preview-frame-hero"></span>
        <div class="template-preview-grid-side">
          <span class="template-preview-frame"></span>
          <span class="template-preview-frame template-preview-frame-wide"></span>
        </div>
      </div>
    `;
  }

  if (pattern === "quad-even") {
    return `
      <div class="template-preview-grid-quad">
        <span class="template-preview-frame"></span>
        <span class="template-preview-frame"></span>
        <span class="template-preview-frame"></span>
        <span class="template-preview-frame"></span>
      </div>
    `;
  }

  if (pattern === "tall-card") {
    return `
      <div class="template-preview-grid-side">
        <span class="template-preview-frame template-preview-frame-hero"></span>
        <div class="template-preview-row-two">
          <span class="template-preview-frame"></span>
          <span class="template-preview-frame"></span>
        </div>
      </div>
    `;
  }

  if (pattern === "offset-grid") {
    return `
      <div class="template-preview-grid-offset">
        <span class="template-preview-frame template-preview-frame-mid"></span>
        <div class="template-preview-row-two">
          <span class="template-preview-frame"></span>
          <span class="template-preview-frame"></span>
        </div>
        <span class="template-preview-frame template-preview-frame-wide template-preview-frame-offset"></span>
      </div>
    `;
  }

  return '<span class="template-preview-frame"></span>';
}
