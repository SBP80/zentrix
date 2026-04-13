import { renderLoginView } from "./auth/login-view.js";

const app = document.getElementById("app");

function getSesion() {
  try {
    return JSON.parse(localStorage.getItem("usuario") || "null");
  } catch {
    return null;
  }
}

function renderInicio(user) {
  return `
    <div style="
      min-height:100vh;
      background:#f3f4f6;
      padding:24px;
      box-sizing:border-box;
      font-family:Arial,sans-serif;
    ">
      <div style="
        max-width:800px;
        margin:0 auto;
        background:#ffffff;
        border:1px solid #dbe4ee;
        border-radius:20px;
        padding:24px;
        box-sizing:border-box;
      ">
        <h1 style="
          margin:0 0 12px 0;
          font-size:34px;
          color:#111827;
        ">Bienvenido ${escapeHtml(user.nombre || user.usuario || "")}</h1>

        <div style="
          margin-bottom:18px;
          color:#475569;
          font-size:16px;
          font-weight:700;
        ">
          Rol: ${escapeHtml(user.rol || "")}
        </div>

        <button
          id="btn_logout"
          type="button"
          style="
            height:48px;
            border:none;
            border-radius:12px;
            background:#dc2626;
            color:#ffffff;
            font-size:16px;
            font-weight:800;
            padding:0 16px;
            cursor:pointer;
          "
        >
          Cerrar sesión
        </button>
      </div>
    </div>
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

function boot() {
  if (!app) return;

  const user = getSesion();

  if (!user) {
    app.innerHTML = renderLoginView();
    return;
  }

  app.innerHTML = renderInicio(user);

  document.getElementById("btn_logout")?.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    location.reload();
  });
}

boot();