import { state } from "./core/state.js";
import { db } from "./core/db.js";
import { renderInicio } from "./core/views/inicio.js";
import { renderAgenda } from "./core/views/agenda.js";
import { renderConfiguracion } from "./core/views/configuracion.js?v=9024";
import { renderPersonal } from "./core/views/personal.js";

const app = document.getElementById("app");

const SESSION_KEY = "zentrix_logged";
const SESSION_USER_KEY = "zentrix_session_user_v1";

state.logged = localStorage.getItem(SESSION_KEY) === "true";

function renderApp() {
  if (!state.logged) {
    renderLogin();
    return;
  }

  const usuario = getUsuarioActual();
  const permisos = usuario.permisosModulos || {};

  const vistasPermitidas = getVistasPermitidas(permisos);

  if (!vistasPermitidas.includes(state.view)) {
    state.view = vistasPermitidas[0] || "inicio";
  }

  let content = "";

  if (state.view === "inicio") content = renderInicio();
  if (state.view === "agenda") content = renderAgenda();
  if (state.view === "personal") content = renderPersonal();
  if (state.view === "configuracion") content = renderConfiguracion();

  app.innerHTML = `
    <div style="
      display:flex;
      height:100vh;
      background:#f1f5f9;
      overflow:hidden;
    ">
      <aside style="
        width:220px;
        min-width:220px;
        background:#0f172a;
        color:#fff;
        padding:20px;
        box-sizing:border-box;
        display:flex;
        flex-direction:column;
        justify-content:space-between;
        height:100vh;
      ">
        <div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:22px;">
            <div style="
              width:42px;
              height:42px;
              border-radius:12px;
              background:#2563eb;
              display:flex;
              align-items:center;
              justify-content:center;
              font-weight:800;
              font-size:22px;
              flex:0 0 auto;
            ">Z</div>

            <div style="min-width:0;">
              <div style="font-size:16px;font-weight:800;line-height:1;">Zentryx</div>
              <div style="
                font-size:12px;
                color:#cbd5e1;
                margin-top:4px;
                line-height:1.2;
                word-break:break-word;
              ">
                ${escapeHtml(usuario.nombre || "Usuario")} · ${escapeHtml(usuario.puesto || "sin rol")}
              </div>
            </div>
          </div>

          ${renderBotonMenu("inicio", "Inicio", state.view === "inicio", permisos.inicio)}
          ${renderBotonMenu("agenda", "Agenda", state.view === "agenda", permisos.agenda)}
          ${renderBotonMenu("personal", "Personal", state.view === "personal", permisos.personal)}
          ${renderBotonMenu("configuracion", "Configuración", state.view === "configuracion", permisos.configuracion)}
        </div>

        <div>
          <button id="btnLogout" style="
            width:100%;
            margin-top:18px;
            padding:12px;
            border:none;
            border-radius:10px;
            background:#dc2626;
            color:#fff;
            cursor:pointer;
            font-weight:700;
          ">
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main id="viewContainer" style="
        flex:1;
        padding:20px;
        background:#f1f5f9;
        box-sizing:border-box;
        overflow:auto;
        height:100vh;
      ">
        ${content}
      </main>
    </div>
  `;

  activarMenu();
  activarLogout();
}

function renderLogin() {
  app.innerHTML = `
    <div style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      background:linear-gradient(135deg,#0f172a 0%, #1e293b 45%, #2563eb 100%);
      padding:24px;
      box-sizing:border-box;
    ">
      <div style="
        width:100%;
        max-width:980px;
        display:grid;
        grid-template-columns:1.1fr 0.9fr;
        gap:24px;
        align-items:stretch;
      ">
        <div style="
          color:#fff;
          padding:28px;
          border-radius:24px;
          background:rgba(255,255,255,0.08);
          backdrop-filter:blur(8px);
          border:1px solid rgba(255,255,255,0.14);
        ">
          <div style="
            width:64px;
            height:64px;
            border-radius:18px;
            background:#ffffff22;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:34px;
            font-weight:900;
            margin-bottom:20px;
          ">Z</div>

          <div style="font-size:40px;font-weight:900;line-height:1.05;margin-bottom:12px;">
            Zentryx
          </div>

          <div style="font-size:18px;color:#dbeafe;line-height:1.5;max-width:520px;">
            Plataforma interna para control de agenda, personal y gestión de empresa.
          </div>

          <div style="
            margin-top:28px;
            display:grid;
            gap:10px;
            color:#e2e8f0;
            font-size:14px;
          ">
            <div>• Acceso por usuario y contraseña</div>
            <div>• Panel centralizado</div>
            <div>• Gestión de trabajadores y ausencias</div>
          </div>
        </div>

        <div style="
          background:#ffffff;
          border-radius:24px;
          padding:28px;
          box-shadow:0 20px 50px rgba(15,23,42,0.28);
        ">
          <div style="font-size:30px;font-weight:900;color:#0f172a;margin-bottom:8px;">
            Iniciar sesión
          </div>

          <div style="font-size:14px;color:#64748b;margin-bottom:22px;">
            Acceso profesional
          </div>

          <div style="display:grid;gap:14px;">
            <div>
              <label for="loginUsuario" style="${labelStyle()}">Usuario</label>
              <input id="loginUsuario" autocomplete="username" style="${loginInputStyle()}">
            </div>

            <div>
              <label for="loginPassword" style="${labelStyle()}">Contraseña</label>
              <input id="loginPassword" type="password" autocomplete="current-password" style="${loginInputStyle()}">
            </div>

            <button id="btnLogin" style="
              height:50px;
              border:none;
              border-radius:14px;
              background:#2563eb;
              color:#fff;
              font-size:16px;
              font-weight:800;
              cursor:pointer;
            ">
              Entrar
            </button>

            <div id="loginError" style="
              display:none;
              padding:12px 14px;
              border-radius:12px;
              background:#fef2f2;
              color:#b91c1c;
              font-size:14px;
              font-weight:700;
            ">
              Usuario o contraseña incorrectos.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("btnLogin")?.addEventListener("click", intentarLogin);
  document.getElementById("loginPassword")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") intentarLogin();
  });
  document.getElementById("loginUsuario")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") intentarLogin();
  });
}

function intentarLogin() {
  const usuarioTxt = document.getElementById("loginUsuario")?.value.trim() || "";
  const passwordTxt = document.getElementById("loginPassword")?.value || "";
  const errorBox = document.getElementById("loginError");

  const usuarios = db.personal.getAll();
  const user = usuarios.find(
    (u) =>
      String(u.usuario || "").trim().toLowerCase() === usuarioTxt.toLowerCase() &&
      String(u.password || "") === passwordTxt &&
      u.activo !== false
  );

  if (!user) {
    if (errorBox) errorBox.style.display = "block";
    return;
  }

  localStorage.setItem(SESSION_KEY, "true");
  localStorage.setItem(SESSION_USER_KEY, String(user.id));
  state.logged = true;
  state.view = getVistaInicial(user);
  renderApp();
}

function activarMenu() {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.view = btn.dataset.view;
      renderApp();
    });
  });
}

function activarLogout() {
  document.getElementById("btnLogout")?.addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
    state.logged = false;
    state.view = "inicio";
    renderApp();
  });
}

function getUsuarioActual() {
  const id = localStorage.getItem(SESSION_USER_KEY) || "";
  const usuarios = db.personal.getAll();
  return usuarios.find((u) => String(u.id) === String(id)) || {
    nombre: "Usuario",
    puesto: "sin rol",
    permisosModulos: {
      inicio: true,
      agenda: false,
      personal: false,
      configuracion: false
    }
  };
}

function getVistaInicial(usuario) {
  const permisos = usuario?.permisosModulos || {};

  if (permisos.inicio) return "inicio";
  if (permisos.agenda) return "agenda";
  if (permisos.personal) return "personal";
  if (permisos.configuracion) return "configuracion";

  return "inicio";
}

function getVistasPermitidas(permisos) {
  const vistas = [];
  if (permisos?.inicio) vistas.push("inicio");
  if (permisos?.agenda) vistas.push("agenda");
  if (permisos?.personal) vistas.push("personal");
  if (permisos?.configuracion) vistas.push("configuracion");
  return vistas.length ? vistas : ["inicio"];
}

function renderBotonMenu(view, texto, active, permitido) {
  if (!permitido) return "";
  return `
    <button class="nav-btn" data-view="${view}" style="${btnStyle(active)}">${texto}</button>
  `;
}

function btnStyle(active) {
  return `
    width:100%;
    margin-bottom:10px;
    padding:12px 12px;
    border:none;
    border-radius:10px;
    background:${active ? "#2563eb" : "#1e293b"};
    color:#fff;
    cursor:pointer;
    text-align:left;
    font-weight:700;
  `;
}

function labelStyle() {
  return `
    display:block;
    margin-bottom:6px;
    font-size:13px;
    font-weight:700;
    color:#334155;
  `;
}

function loginInputStyle() {
  return `
    width:100%;
    height:48px;
    padding:0 14px;
    border:1px solid #cbd5e1;
    border-radius:14px;
    background:#fff;
    box-sizing:border-box;
    font-size:15px;
  `;
}

function escapeHtml(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

renderApp();
