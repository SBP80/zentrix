import { renderLoginView } from "./auth/login-view.js";
import { renderInicio } from "./core/views/inicio.js";

function getSesion() {
  try {
    return JSON.parse(localStorage.getItem("usuario") || "null");
  } catch {
    return null;
  }
}

function renderLogin() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = renderLoginView();
}

function renderApp() {
  const sesion = getSesion();

  if (!sesion) {
    renderLogin();
    return;
  }

  renderInicio();
}

function boot() {
  try {
    renderApp();
  } catch (error) {
    const app = document.getElementById("app");
    if (!app) return;

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
          border:1px solid #fecaca;
          border-radius:20px;
          padding:24px;
          box-sizing:border-box;
        ">
          <h1 style="
            margin:0 0 14px 0;
            font-size:32px;
            color:#991b1b;
          ">Error cargando la app</h1>

          <div style="
            padding:16px;
            border:1px solid #fecaca;
            border-radius:14px;
            background:#fef2f2;
            color:#991b1b;
            white-space:pre-wrap;
            word-break:break-word;
            font-size:15px;
          ">${String(error?.message || error)}</div>

          <button id="btn_reset_app" type="button" style="
            margin-top:16px;
            height:48px;
            border:none;
            border-radius:12px;
            background:#4361ee;
            color:#ffffff;
            font-size:16px;
            font-weight:800;
            padding:0 18px;
            cursor:pointer;
          ">
            Volver al login
          </button>
        </div>
      </div>
    `;

    document.getElementById("btn_reset_app")?.addEventListener("click", () => {
      localStorage.removeItem("usuario");
      location.reload();
    });
  }
}

boot();