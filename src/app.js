import { renderLoginView } from "./auth/login-view.js";
import { getCurrentUser, isLoggedIn, clearSession } from "./auth/session.js";
import { login } from "./auth/auth.js";

function boot() {
  if (!isLoggedIn()) {
    renderLogin();
    return;
  }

  renderPrivateApp();
}

function renderLogin() {
  const root = document.getElementById("app");
  if (!root) return;

  root.innerHTML = renderLoginView();

  const usuarioEl = document.getElementById("login_usuario");
  const passwordEl = document.getElementById("login_password");
  const estadoEl = document.getElementById("login_estado");
  const btnLogin = document.getElementById("btn_login");

  function setError(msg) {
    if (estadoEl) estadoEl.textContent = msg || "";
  }

  function tryLogin() {
    const usuario = usuarioEl?.value || "";
    const password = passwordEl?.value || "";

    setError("");

    try {
      login(usuario, password);
      renderPrivateApp();
    } catch (error) {
      setError(error?.message || "Error de acceso");
    }
  }

  btnLogin?.addEventListener("click", tryLogin);

  passwordEl?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryLogin();
  });

  usuarioEl?.focus();
}

function renderPrivateApp() {
  const root = document.getElementById("app");
  if (!root) return;

  const user = getCurrentUser();

  root.innerHTML = `
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
              Usuario: ${escapeHtml(user?.nombre || user?.usuario || "Usuario")}
            </div>

            <div style="
              color:#64748b;
              font-size:14px;
              margin-top:4px;
            ">
              Rol: ${escapeHtml(user?.rol || "sin rol")}
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
          Login base funcionando correctamente.
          <br><br>
          Siguiente paso: conectar esta sesión con la app principal
          y proteger Inicio, Agenda, Personal, Fichajes y Configuración.
        </div>
      </div>
    </div>
  `;

  document.getElementById("btn_logout")?.addEventListener("click", () => {
    clearSession();
    renderLogin();
  });
}

function escapeHtml(texto) {
  return String(texto || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

boot();