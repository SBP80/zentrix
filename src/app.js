import { state } from "./core/state.js";
import { getConfig, saveConfig } from "./core/storage.js";
import { escapeHtml } from "./core/utils.js";
import { renderInicio } from "./core/views/inicio.js";
import { renderAgenda } from "./core/views/agenda.js";
import { renderConfiguracion } from "./core/views/configuracion.js";
import { renderPersonal } from "./core/views/personal.js";
import { getPersonal } from "./core/data/personal.js";

const app = document.getElementById("app");

const SESSION_KEY = "zentrix_session_user_v2";

const defaultConfig = {
  empresa: "Zentryx",
  tema: "claro",
  mostrarSegundos: true,
  formato24h: true
};

function ensureConfig() {
  const current = getConfig() || {};
  const merged = { ...defaultConfig, ...current };
  saveConfig(merged);
  return merged;
}

function getCurrentUser() {
  const sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) return null;

  const personal = getPersonal();
  return personal.find((p) => String(p.id) === String(sessionId) && p.activo !== false) || null;
}

function setCurrentUser(userId) {
  localStorage.setItem(SESSION_KEY, String(userId));
}

function clearCurrentUser() {
  localStorage.removeItem(SESSION_KEY);
}

function esAdmin(user) {
  return user?.permisosModulos?.configuracion === true;
}

function tienePermisoModulo(user, modulo) {
  if (!user) return false;
  if (esAdmin(user)) return true;
  return !!user?.permisosModulos?.[modulo];
}

function getVisibleViews(user) {
  const views = [];

  if (tienePermisoModulo(user, "inicio")) views.push("inicio");
  if (tienePermisoModulo(user, "agenda")) views.push("agenda");
  if (tienePermisoModulo(user, "personal")) views.push("personal");
  if (tienePermisoModulo(user, "configuracion")) views.push("configuracion");

  return views;
}

function getRoleLabel(user) {
  if (esAdmin(user)) return "Administrador";
  return user?.puesto || "Trabajador";
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
          <input id="user" class="field-input" placeholder="Usuario" autocomplete="username" />

          <label class="field-label" for="pass">Contraseña</label>
          <input id="pass" class="field-input" type="password" placeholder="Contraseña" autocomplete="current-password" />

          <button id="loginBtn" class="primary-btn" type="button">Entrar</button>

          <p id="loginMsg" class="login-msg"></p>
        </div>
      </div>
    </div>
  `;

  const userInput = document.getElementById("user");
  const passInput = document.getElementById("pass");
  const loginBtn = document.getElementById("loginBtn");
  const loginMsg = document.getElementById("loginMsg");

  function tryLogin() {
    const username = userInput.value.trim().toLowerCase();
    const password = passInput.value.trim();

    const personal = getPersonal();
    const user = personal.find((p) =>
      p.activo !== false &&
      String(p.usuario || "").trim().toLowerCase() === username &&
      String(p.password || "") === password
    );

    if (!user) {
      loginMsg.textContent = "Usuario o contraseña incorrectos.";
      return;
    }

    setCurrentUser(user.id);
    state.logged = true;
    state.menuOpen = false;

    if (!tienePermisoModulo(user, "inicio")) {
      const visibles = getVisibleViews(user);
      state.view = visibles[0] || "inicio";
    } else {
      state.view = "inicio";
    }

    render();
  }

  [userInput, passInput].forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        loginBtn.click();
      }
    });
  });

  loginBtn.addEventListener("click", tryLogin);
}

function renderApp(user) {
  const config = ensureConfig();
  const visibleViews = getVisibleViews(user);

  if (!visibleViews.includes(state.view)) {
    state.view = visibleViews[0] || "inicio";
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
            <p>${escapeHtml(user.nombre || "")} · ${escapeHtml(getRoleLabel(user))}</p>
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
      const nextView = btn.dataset.view;
      if (!visibleViews.includes(nextView)) return;

      state.view = nextView;
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

  if (!tienePermisoModulo(user, state.view)) {
    const visibles = getVisibleViews(user);
    state.view = visibles[0] || "inicio";
  }

  if (state.view === "inicio") {
    container.innerHTML = renderInicio();
    return;
  }

  if (state.view === "agenda") {
    container.innerHTML = renderAgenda();
    return;
  }

  if (state.view === "personal") {
    container.innerHTML = renderPersonal();
    return;
  }

  if (state.view === "configuracion") {
    if (!tienePermisoModulo(user, "configuracion")) {
      container.innerHTML = `
        <div class="panel-card">
          <h3>Configuración</h3>
          <p>No tienes permiso para acceder a esta sección.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = renderConfiguracion();
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
    configuracion: "Configuración"
  };

  return titles[state.view] || "Inicio";
}

function getViewSubtitle(user) {
  const subtitles = {
    inicio: `Panel principal de ${user.nombre || "usuario"}.`,
    agenda: "Planificación, revisiones, vacaciones y avisos.",
    personal: "Equipo, roles y permisos.",
    configuracion: "Empresa, usuarios y ajustes generales."
  };

  return subtitles[state.view] || "";
}

render();
