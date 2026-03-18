export function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function downloadDataUrl(filename, dataUrl) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export function formatSessionDate(isoString) {
  if (!isoString) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
}
