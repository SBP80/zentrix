import { state } from "./core/state.js";
import { getConfig, saveConfig } from "./core/storage.js";
import { escapeHtml } from "./core/utils.js";
import { renderInicio } from "./core/views/inicio.js";
import { renderAgenda } from "./core/views/agenda.js";

const app = document.getElementById("app");

const SESSION_KEY = "zentrix_session_user_v1";
const USERS_KEY = "zentrix_users_v1";

const defaultConfig = {
  empresa: "Zentrix",
  tema: "claro",
  mostrarSegundos: true,
  formato24h: true,
};

const defaultUsers = [
  {
    id: "u_admin",
    username: "admin",
    password: "1234",
    nombre: "Administrador",
    rol: "admin",
    activo: true,
  },
  {
    id: "u_encargado",
    username: "encargado",
    password: "1234",
    nombre: "Encargado",
    rol: "encargado",
    activo: true,
  },
  {
    id: "u_operario1",
    username: "operario1",
    password: "1234",
    nombre: "Operario 1",
    rol: "operario",
    activo: true,
  },
];

function ensureConfig() {
  const current = getConfig() || {};
  const merged = { ...defaultConfig, ...current };
  saveConfig(merged);
  return merged;
}

function ensureUsers() {
  try {
    const saved = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (error) {
    // nada
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
}

function getUsers() {
  ensureUsers();
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch (error) {
    return [];
  }
}

function getCurrentUser() {
  const sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) return null;

  const user = getUsers().find((u) => u.id === sessionId && u.activo);
  return user || null;
}

function setCurrentUser(userId) {
  localStorage.setItem(SESSION_KEY, userId);
}

function clearCurrentUser() {
  localStorage.removeItem(SESSION_KEY);
}

function getVisibleViewsByRole(role) {
  if (role === "admin") {
    return ["inicio", "agenda", "personal", "configuracion"];
  }

  if (role === "encargado") {
    return ["inicio", "agenda", "personal"];
  }

  return ["inicio", "agenda"];
}

function getRoleLabel(role) {
  if (role === "admin") return "Administrador";
  if (role === "encargado") return "Encargado";
  return "Operario";
}

function render() {
  const user = getCurrentUser();

  state.logged = Boolean(user);

  if (!state.logged) {
    renderLogin();
    return;
  }

  renderApp(user);
}

function renderLogin() {
  const config = ensureConfig();
  ensureUsers();

  app.innerHTML = `
    <div class="login-shell theme-${config.tema}">
      <div class="login-wrap">
        <div class="login-brand">
          <div class="login-logo">Z</div>
          <div class="login-brand-text">
            <h1>${escapeHtml(config.empresa)}</h1>
            <p>Acceso profesional</p>
          </div>
        </div>

        <div class="login-card">
          <h2>Iniciar sesión</h2>

          <label class="field-label" for="user">Usuario</label>
          <input id="user" class="field-input" placeholder="admin" autocomplete="username" />

          <label class="field-label" for="pass">Contraseña</label>
          <input id="pass" class="field-input" type="password" placeholder="1234" autocomplete="current-password" />

          <button id="loginBtn" class="primary-btn">Entrar</button>

          <p id="loginMsg" class="login-msg"></p>

          <div style="margin-top:14px; color:#64748b; font-size:13px; line-height:1.5;">
            Usuarios iniciales:<br>
            admin / 1234<br>
            encargado / 1234<br>
            operario1 / 1234
          </div>
        </div>
      </div>
    </div>
  `;

  const userInput = document.getElementById("user");
  const passInput = document.getElementById("pass");
  const loginBtn = document.getElementById("loginBtn");
  const loginMsg = document.getElementById("loginMsg");

  function tryLogin() {
    const username = userInput.value.trim();
    const password = passInput.value.trim();

    const user = getUsers().find(
      (u) =>
        u.activo &&
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === password
    );

    if (!user) {
      loginMsg.textContent = "Usuario o contraseña incorrectos.";
      return;
    }

    setCurrentUser(user.id);
    state.logged = true;
    state.menuOpen = false;
    state.view = "inicio";
    render();
  }

  [userInput, passInput].forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        loginBtn.click();
      }
    });
  });

  loginBtn.addEventListener("click", tryLogin);
}

function renderApp(user) {
  const config = ensureConfig();
  const visibleViews = getVisibleViewsByRole(user.rol);

  if (!visibleViews.includes(state.view)) {
    state.view = "inicio";
  }

  app.innerHTML = `
    <div class="app-shell theme-${config.tema}">
      <div class="mobile-topbar">
        <button id="menuToggle" class="icon-btn" type="button">☰</button>
        <div class="mobile-topbar-title">${escapeHtml(config.empresa)}</div>
      </div>

      <div id="appOverlay" class="app-overlay ${state.menuOpen ? "show" : ""}"></div>

      <aside class="sidebar ${state.menuOpen ? "open" : ""}">
        <div class="sidebar-head">
          <div class="sidebar-logo">Z</div>
          <div class="sidebar-brand">
            <h2>${escapeHtml(config.empresa)}</h2>
            <p>${escapeHtml(user.nombre)} · ${escapeHtml(getRoleLabel(user.rol))}</p>
          </div>
        </div>

        <nav class="sidebar-nav">
          ${renderNavButton("inicio", "Inicio", visibleViews)}
          ${renderNavButton("agenda", "Agenda", visibleViews)}
          ${renderNavButton("personal", "Personal", visibleViews)}
          ${renderNavButton("configuracion", "Configuración", visibleViews)}
        </nav>

        <button id="logoutBtn" class="logout-btn" type="button">Cerrar sesión</button>
      </aside>

      <main class="main-content">
        <header class="desktop-header">
          <div>
            <h1>${getViewTitle()}</h1>
            <p>${getViewSubtitle(user)}</p>
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
      render();
    });
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    state.logged = false;
    state.menuOpen = false;
    clearCurrentUser();
    render();
  });

  document.getElementById("menuToggle").addEventListener("click", () => {
    state.menuOpen = !state.menuOpen;
    render();
  });

  document.getElementById("appOverlay").addEventListener("click", () => {
    state.menuOpen = false;
    render();
  });

  renderView(user);
}

function renderNavButton(view, label, visibleViews) {
  if (!visibleViews.includes(view)) return "";

  return `
    <button
      class="nav-btn ${state.view === view ? "active" : ""}"
      data-view="${view}"
      type="button"
    >
      ${label}
    </button>
  `;
}

function renderView(user) {
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

  if (state.view === "personal") {
    container.innerHTML = `
      <div class="panel-card">
        <h3>Personal</h3>
        <p>Módulo en preparación.</p>
      </div>
    `;
    return;
  }

  if (state.view === "configuracion") {
    if (user.rol !== "admin") {
      container.innerHTML = `
        <div class="panel-card">
          <h3>Configuración</h3>
          <p>No tienes permiso para acceder a esta sección.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="panel-card">
        <h3>Configuración</h3>
        <p>Módulo en preparación.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="panel-card">
      <h3>${getViewTitle()}</h3>
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

function getViewSubtitle(user) {
  const subtitles = {
    inicio: `Panel principal de ${user.nombre}.`,
    agenda: "Planificación, revisiones, vacaciones y avisos.",
    personal: "Equipo, roles y permisos.",
    configuracion: "Empresa, usuarios y ajustes generales.",
  };

  return subtitles[state.view] || "";
}

render();
