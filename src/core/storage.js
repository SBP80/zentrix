export function getConfig() {
  return JSON.parse(localStorage.getItem("config")) || null;
}

export function saveConfig(config) {
  localStorage.setItem("config", JSON.stringify(config));
}