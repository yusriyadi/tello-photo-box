import { templates } from "../data/templates.js";
import { getSession, setTemplate } from "./state.js";

export function getTemplates() {
  return templates;
}

export function getTemplateById(id) {
  return templates.find((template) => template.id === id) ?? templates[0];
}

export function renderTemplatePicker(container, nameElement) {
  const { templateId } = getSession();
  const groups = [...new Set(templates.map((template) => template.group))];

  container.innerHTML = groups
    .map((groupName) => {
      const cards = templates
        .filter((template) => template.group === groupName)
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
        .join("");

      return `
        <section class="template-group">
          <div class="template-group-heading">
            <strong>${groupName}</strong>
          </div>
          <div class="template-row">
            ${cards}
          </div>
        </section>
      `;
    })
    .join("");

  const selected = getTemplateById(templateId);
  nameElement.textContent = selected.name;

  container.querySelectorAll("[data-template-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTemplateId = button.dataset.templateId;
      setTemplate(nextTemplateId);
      renderTemplatePicker(container, nameElement);
    });
  });
}

function renderPreviewStrip(layout) {
  if (layout === "stackedHero") {
    return `
      <div class="template-preview-strip template-preview-strip-stacked">
        <span class="template-preview-header"></span>
        <div class="template-preview-grid">
          <span class="template-preview-frame template-preview-frame-hero"></span>
          <div class="template-preview-row-two">
            <span class="template-preview-frame"></span>
            <span class="template-preview-frame"></span>
          </div>
          <span class="template-preview-frame template-preview-frame-wide"></span>
        </div>
        <span class="template-preview-footer"></span>
      </div>
    `;
  }

  if (layout === "duoSplit") {
    return `
      <div class="template-preview-strip template-preview-strip-split">
        <span class="template-preview-header"></span>
        <div class="template-preview-grid">
          <div class="template-preview-row-two template-preview-row-tall">
            <span class="template-preview-frame"></span>
            <span class="template-preview-frame"></span>
          </div>
          <div class="template-preview-row-two">
            <span class="template-preview-frame template-preview-frame-wide"></span>
            <span class="template-preview-frame template-preview-frame-wide"></span>
          </div>
        </div>
        <span class="template-preview-footer"></span>
      </div>
    `;
  }

  if (layout === "postcard") {
    return `
      <div class="template-preview-strip template-preview-strip-postcard">
        <span class="template-preview-header"></span>
        <div class="template-preview-grid">
          <span class="template-preview-frame template-preview-frame-wide"></span>
          <span class="template-preview-frame template-preview-frame-mid"></span>
          <div class="template-preview-row-two">
            <span class="template-preview-frame"></span>
            <span class="template-preview-frame"></span>
          </div>
        </div>
        <span class="template-preview-footer"></span>
      </div>
    `;
  }

  return `
    <div class="template-preview-strip">
      <span class="template-preview-header"></span>
      <div class="template-preview-grid">
        <span class="template-preview-frame"></span>
        <span class="template-preview-frame"></span>
        <span class="template-preview-frame"></span>
        <span class="template-preview-frame"></span>
      </div>
      <span class="template-preview-footer"></span>
    </div>
  `;
}
