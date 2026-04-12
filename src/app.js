import { validarUsuario } from "./core/data/personal.js";

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
      box-sizing:border-box;
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
        box-sizing:border-box;
      ">
        <h1 style="
          margin:0 0 10px 0;
          font-size:34px;
          line-height:1.1;
          color:#111827;
        ">Zentryx</h1>

        <p style="
          margin:0 0 24px 0;
          color:#6b7280;
          font-size:16px;
        ">
          Acceso al sistema
        </p>

        <div style="display:grid;gap:14px;">
          <div>
            <label for="login_usuario" style="
              display:block;
              margin-bottom:6px;
              font-weight:700;
              color:#111827;
            ">Usuario</label>

            <input
              id="login_usuario"
              type="text"
              autocomplete="username"
              placeholder="Introduce tu usuario"
              style="
                width:100%;
                height:48px;
                border:1px solid #cbd5e1;
                border-radius:12px;
                padding:0 14px;
                box-sizing:border-box;
                font-size:16px;
              "
            />
          </div>

          <div>
            <label for="login_password" style="
              display:block;
              margin-bottom:6px;
              font-weight:700;
              color:#111827;
            ">Contraseña</label>

            <input
              id="login_password"
              type="password"
              autocomplete="current-password"
              placeholder="Introduce tu contraseña"
              style="
                width:100%;
                height:48px;
                border:1px solid #cbd5e1;
                border-radius:12px;
                padding:0 14px;
                box-sizing:border-box;
                font-size:16px;
              "
            />
          </div>

          <div id="login_error" style="
            min-height:20px;
            color:#b91c1c;
            font-size:14px;
            font-weight:700;
          "></div>

          <button
            id="btn_login"
            type="button"
            style="
              height:50px;
              border:none;
              border-radius:14px;
              background:#4361ee;
              color:#ffffff;
              font-size:18px;
              font-weight:800;
              cursor:pointer;
            "
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  `;

  const usuarioEl = document.getElementById("login_usuario");
  const passwordEl = document.getElementById("login_password");
  const errorEl = document.getElementById("login_error");
  const btnLogin = document.getElementById("btn_login");

  function entrar() {
    const usuario = String(usuarioEl?.value || "").trim().toLowerCase();
    const password = String(passwordEl?.value || "");

    if (errorEl) errorEl.textContent = "";

    const user = validarUsuario(usuario, password);

    if (!user) {
      if (errorEl) errorEl.textContent = "Usuario o contraseña incorrectos";
      return;
    }

    guardarSesion({
      usuario: user.usuario,
      nombre: user.nombre,
      rol: user.rol
    });

    renderApp();
  }

  btnLogin?.addEventListener("click", entrar);

  passwordEl?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") entrar();
  });
}

function renderApp() {
  const app = document.getElementById("app");
  if (!app) return;

  const sesion = leerSesion();

  if (!sesion) {
    renderLogin();
    return;
  }

  app.innerHTML = `
    <div style="
      min-height:100vh;
      background:#f3f4f6;
      padding:24px;
      box-sizing:border-box;
      font-family:Arial,sans-serif;
    ">
      <div style="
        max-width:900px;
        margin:0 auto;
        background:#ffffff;
        border:1px solid #dbe4ee;
        border-radius:20px;
        padding:24px;
        box-sizing:border-box;
      ">
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          flex-wrap:wrap;
          margin-bottom:20px;
        ">
          <div>
            <h1 style="
              margin:0 0 8px 0;
              font-size:34px;
              color:#111827;
            ">Zentryx</h1>

            <div style="
              color:#475569;
              font-size:16px;
              font-weight:700;
            ">
              Usuario: ${escapeHtml(sesion.nombre)}
            </div>

            <div style="
              color:#64748b;
              font-size:14px;
              margin-top:4px;
            ">
              Rol: ${escapeHtml(sesion.rol)}
            </div>
          </div>

          <button
            id="btn_logout"
            type="button"
            style="
              height:46px;
              border:none;
              border-radius:12px;
              background:#dc2626;
              color:#ffffff;
              font-size:15px;
              font-weight:800;
              padding:0 16px;
              cursor:pointer;
            "
          >
            Cerrar sesión
          </button>
        </div>

        <div style="
          padding:18px;
          border:1px solid #dbe4ee;
          border-radius:16px;
          background:#f8fafc;
          color:#111827;
          font-size:16px;
          line-height:1.5;
        ">
          Login funcionando correctamente.
          <br><br>
          Usuario activo: <strong>${escapeHtml(sesion.nombre)}</strong>
        </div>
      </div>
    </div>
  `;

  document.getElementById("btn_logout")?.addEventListener("click", cerrarSesion);
}

function escapeHtml(texto) {
  return String(texto || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (leerSesion()) {
  renderApp();
} else {
  renderLogin();
}