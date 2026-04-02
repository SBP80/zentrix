import { state } from "./core/state.js";
import { getConfig, saveConfig } from "./core/storage.js";
import { escapeHtml } from "./core/utils.js";
import { renderInicio } from "./core/views/inicio.js";
import { renderAgenda } from "./core/views/agenda.js";

const app = document.getElementById("app");

const defaultConfig = {
  empresa: "Zentryx",
  tema: "claro",
  mostrarSegundos: true,
  formato24h: true,
};

function ensureConfig() {
  const current = getConfig();
  const merged = { ...defaultConfig, ...current };
  saveConfig(merged);
  return merged;
}

function render() {
  if (!state.logged) {
    renderLogin();
    return;
  }

  renderApp();
}

function renderLogin() {
  const config = ensureConfig();

  app.innerHTML = `
    <div class="login-shell theme-${config.tema}">
      <div class="login-wrap">
        <div class="login-brand">
          <div class="login-logo">Z</div>
          <div class="login-brand-text">
            <h1>${escapeHtml(config.empresa)}</h1>
            <p>Base modular en preparación</p>
          </div>
        </div>

        <div class="login-card">
          <h2>Acceso</h2>

          <label class="field-label" for="user">Usuario</label>
          <input id="user" class="field-input" placeholder="admin" />

          <label class="field-label" for="pass">Contraseña</label>
          <input id="pass" class="field-input" type="password" placeholder="1234" />

          <button id="loginBtn" class="primary-btn">Entrar</button>

          <p id="loginMsg" class="login-msg"></p>
        </div>
      </div>
    </div>
  `;
  const userInput = document.getElementById("user");
const passInput = document.getElementById("pass");

[userInput, passInput].forEach((input) => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      document.getElementById("loginBtn").click();
    }
  });
});

  document.getElementById("loginBtn").addEventListener("click", () => {
    const user = document.getElementById("user").value.trim();
    const pass = document.getElementById("pass").value.trim();
if (user === "admin" && pass === "1234") {
  state.logged = true;
  localStorage.setItem("zentrix_logged", "true");
  render();
  return;
}
 

    document.getElementById("loginMsg").textContent = "Usuario o contraseña incorrectos.";
  });
}

function renderApp() {
  const config = ensureConfig();

  app.innerHTML = `
    <div class="app-shell theme-${config.tema}">
      <div class="mobile-topbar">
        <button id="menuToggle" class="icon-btn">☰</button>
        <div class="mobile-topbar-title">${escapeHtml(config.empresa)}</div>
      </div>

      <div id="appOverlay" class="app-overlay ${state.menuOpen ? "show" : ""}"></div>

      <aside class="sidebar ${state.menuOpen ? "open" : ""}">
        <div class="sidebar-head">
          <div class="sidebar-logo">Z</div>
          <div class="sidebar-brand">
            <h2>${escapeHtml(config.empresa)}</h2>
            <p>Base modular</p>
          </div>
        </div>

        <nav class="sidebar-nav">
          <button class="nav-btn ${state.view === "inicio" ? "active" : ""}" data-view="inicio">Inicio</button>
          <button class="nav-btn ${state.view === "agenda" ? "active" : ""}" data-view="agenda">Agenda</button>
          <button class="nav-btn ${state.view === "personal" ? "active" : ""}" data-view="personal">Personal</button>
          <button class="nav-btn ${state.view === "configuracion" ? "active" : ""}" data-view="configuracion">Configuración</button>
        </nav>

        <button id="logoutBtn" class="logout-btn">Cerrar sesión</button>
      </aside>

      <main class="main-content">
        <header class="desktop-header">
          <div>
            <h1>${getViewTitle()}</h1>
            <p>${getViewSubtitle()}</p>
          </div>
        </header>

        <section id="viewContainer" class="view-container"></section>
      </main>
    </div>
  `;

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.view = btn.dataset.view;
      state.menuOpen = false;
      renderApp();
    });
  });

document.getElementById("logoutBtn").addEventListener("click", () => {
  state.logged = false;
  state.menuOpen = false;
  localStorage.removeItem("zentrix_logged");
  render();
});

  document.getElementById("menuToggle").addEventListener("click", () => {
    state.menuOpen = !state.menuOpen;
    renderApp();
  });

  document.getElementById("appOverlay").addEventListener("click", () => {
    state.menuOpen = false;
    renderApp();
  });

  renderView();
}
function renderView() {
  const container = document.getElementById("viewContainer");
  if (!container) return;

  if (state.view === "inicio") {
    container.innerHTML = renderInicio();
    return;
  }
  if (state.view === "agenda") {
  container.innerHTML = renderAgenda();
  return;
}

  container.innerHTML = `
    <div class="panel-card">
      <h3>${state.view}</h3>
      <p>Vista en construcción.</p>
    </div>
  `;
}

function getViewTitle() {
  const titles = {
    inicio: "Inicio",
    agenda: "Agenda",
    personal: "Personal",
    configuracion: "Configuración",
  };

  return titles[state.view] || "Inicio";
}

function getViewSubtitle() {
  const subtitles = {
    inicio: "Punto de arranque del sistema.",
    agenda: "Organización de eventos y avisos.",
    personal: "Empleados, roles y permisos.",
    configuracion: "Ajustes generales.",
  };

  return subtitles[state.view] || "";
}

render();
