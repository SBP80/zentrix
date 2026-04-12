import { loginUsuario } from "./core/data/personal.js";

function guardarSesion(usuario) {
  localStorage.setItem("zentryx_user", JSON.stringify(usuario));
}

function leerSesion() {
  try {
    return JSON.parse(localStorage.getItem("zentryx_user") || "null");
  } catch {
    return null;
  }
}

function cerrarSesion() {
  localStorage.removeItem("zentryx_user");
  location.reload();
}

function renderLogin() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <div style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:24px;
      background:#f3f4f6;
      font-family:Arial,sans-serif;
    ">
      <div style="
        width:100%;
        max-width:420px;
        background:#ffffff;
        border:1px solid #dbe4ee;
        border-radius:20px;
        padding:24px;
      ">
        <h1 style="margin:0 0 10px 0;font-size:34px;">Zentryx</h1>

        <div style="display:grid;gap:14px;">
          <input id="login_usuario" placeholder="Usuario" style="height:48px;padding:10px;">
          <input id="login_password" type="password" placeholder="Contraseña" style="height:48px;padding:10px;">

          <div id="login_error" style="color:red;"></div>

          <button id="btn_login" style="height:50px;background:#4361ee;color:#fff;">
            Entrar
          </button>
        </div>
      </div>
    </div>
  `;

  const usuarioEl = document.getElementById("login_usuario");
  const passwordEl = document.getElementById("login_password");
  const errorEl = document.getElementById("login_error");

  document.getElementById("btn_login").addEventListener("click", entrar);

  async function entrar() {
    const usuario = usuarioEl.value.trim();
    const password = passwordEl.value;

    errorEl.textContent = "";

    try {
      const user = await loginUsuario(usuario, password);

      guardarSesion(user);

      renderApp();
    } catch (e) {
      errorEl.textContent = e.message;
    }
  }
}

async function renderApp() {
  const app = document.getElementById("app");
  const sesion = leerSesion();

  if (!sesion) {
    renderLogin();
    return;
  }

  app.innerHTML = `<div style="padding:20px;">Cargando...</div>`;

  const mod = await import("./core/views/inicio.js");
  mod.renderInicio();
}

if (leerSesion()) {
  renderApp();
} else {
  renderLogin();
}