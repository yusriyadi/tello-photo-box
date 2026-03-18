const STORAGE_KEY = "photobox-session";

const defaultSession = {
  templateId: "aurora",
  eventName: "",
  photos: [],
  createdAt: null,
};

let session = loadSession();

function loadSession() {
  try {
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultSession, ...JSON.parse(saved) } : { ...defaultSession };
  } catch {
    return { ...defaultSession };
  }
}

function persist() {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Failed to persist session.", error);
    window.alert("Foto sesi terlalu besar untuk disimpan. Coba ambil ulang, hasil sekarang sudah dikompres supaya lebih ringan.");
  }
}

export function getSession() {
  return JSON.parse(JSON.stringify(session));
}

export function setTemplate(templateId) {
  session.templateId = templateId;
  persist();
}

export function setEventName(eventName) {
  session.eventName = eventName.trim().slice(0, 40);
  persist();
}

export function setPhotos(photos) {
  session.photos = photos;
  session.createdAt = new Date().toISOString();
  persist();
}

export function resetSession() {
  session = { ...defaultSession };
  persist();
}
