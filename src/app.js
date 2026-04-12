import { renderInicio } from "./core/views/inicio.js";
import { renderAgenda } from "./core/views/agenda.js";
import { renderPersonal } from "./core/views/personal.js";
import { renderConfiguracion } from "./core/views/configuracion.js";
import { renderFichajes } from "./core/views/fichajes.js";
import {
  loginWithCredentials,
  clearSession,
  getCurrentUser,
  getAllowedViews,
  canAccessView,
  getDisplayName
} from "./core/session.js";

const app = document.getElementById("app");

let vista = "inicio";
let mobileMenuOpen = false;

function renderApp() {
  if (!app) return;

  const user = getCurrentUser();

  if (!user) {
    renderLogin();
    return;
  }

  const allowedViews = getAllowedViews(user);

  if (!allowedViews.includes(vista)) {
    vista = allowedViews[0] || "inicio";
  }

  app.innerHTML = `
    <div class="app-shell">
      <div class="app-layout">
        <aside class="sidebar ${mobileMenuOpen ? "open" : ""}">
          <div class="brand-block">
            <div class="brand-title">Zentryx</div>
            <div class="brand-user">${escapeHtml(getDisplayName(user))}</div>
            <div class="brand-role">${escapeHtml(user.puesto || "Sin rol")}</div>
          </div>

          <nav class="nav-stack">
            ${renderNavButton("inicio", "Inicio", allowedViews)}
            ${renderNavButton("agenda", "Agenda", allowedViews)}
            ${renderNavButton("personal", "Personal", allowedViews)}
            ${renderNavButton("fichajes", "Fichajes", allowedViews)}
            ${renderNavButton("configuracion", "Configuración", allowedViews)}
          </nav>

          <button class="logout-btn" onclick="logoutUI()">Cerrar sesión</button>
        </aside>

        <main class="main-panel">
          <div class="topbar">
            <button class="menu-toggle" onclick="toggleMobileMenuUI()">☰</button>

            <div class="topbar-right">
              <div class="topbar-user">
                <div class="topbar-user-name">${escapeHtml(getDisplayName(user))}</div>
                <div class="topbar-user-role">${escapeHtml(user.puesto || "Sin rol")}</div>
              </div>

              <button class="logout-btn desktop-only" onclick="logoutUI()">Cerrar sesión</button>
            </div>
          </div>

          <div id="viewContainer" class="view-wrap">
            ${renderVista(user)}
          </div>
        </main>
      </div>
    </div>
  `;
}

function renderLogin() {
  app.innerHTML = `
    <div class="login-shell">
      <div class="login-card">
        <div class="login-title">Zentryx</div>
        <div class="login-subtitle">Acceso al sistema</div>

        <div class="login-form">
          <div class="field-block">
            <label class="field-label" for="login_usuario">Usuario</label>
            <input id="login_usuario" class="field-input" autocomplete="username">
          </div>

          <div class="field-block">
            <label class="field-label" for="login_password">Contraseña</label>
            <input id="login_password" class="field-input" type="password" autocomplete="current-password">
          </div>

          <button class="primary-btn" onclick="loginUI()">Entrar</button>

          <div id="login_error" class="login-error" style="display:none;"></div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    document.getElementById("login_usuario")?.focus();

    document.getElementById("login_password")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        window.loginUI();
      }
    });

    document.getElementById("login_usuario")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        document.getElementById("login_password")?.focus();
      }
    });
  }, 0);
}

function renderVista(user) {
  try {
    if (!canAccessView(user, vista)) {
      return renderNoAccess();
    }

    if (vista === "inicio") return renderInicio();
    if (vista === "agenda") return renderAgenda();
    if (vista === "personal") return renderPersonal();
    if (vista === "fichajes") return renderFichajes();
    if (vista === "configuracion") return renderConfiguracion();

    return renderInicio();
  } catch (error) {
    return `
      <div class="error-card">
        Error cargando la vista: ${escapeHtml(error?.message || "desconocido")}
      </div>
    `;
  }
}

function renderNoAccess() {
  return `
    <div class="error-card">
      No tienes permisos para entrar en esta sección.
    </div>
  `;
}

function renderNavButton(view, label, allowedViews) {
  if (!allowedViews.includes(view)) return "";

  return `
    <button
      class="nav-btn ${vista === view ? "active" : ""}"
      data-view="${view}"
      onclick="setView('${view}')"
    >
      ${label}
    </button>
  `;
}

function escapeHtml(texto) {
  return String(texto || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.setView = function (view) {
  vista = view;
  mobileMenuOpen = false;
  renderApp();
};

window.toggleMobileMenuUI = function () {
  mobileMenuOpen = !mobileMenuOpen;
  renderApp();
};

window.logoutUI = function () {
  clearSession();
  vista = "inicio";
  mobileMenuOpen = false;
  renderApp();
};

window.loginUI = function () {
  const usuario = document.getElementById("login_usuario")?.value || "";
  const password = document.getElementById("login_password")?.value || "";

  const result = loginWithCredentials(usuario, password);
  const errorBox = document.getElementById("login_error");

  if (!result.ok) {
    if (errorBox) {
      errorBox.textContent = result.mensaje || "Error de acceso";
      errorBox.style.display = "block";
    }
    return;
  }

  vista = "inicio";
  mobileMenuOpen = false;
  renderApp();
};

renderApp();