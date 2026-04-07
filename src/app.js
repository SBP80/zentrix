import { state } from "./core/state.js";

const app = document.getElementById("app");

function renderApp() {
  app.innerHTML = `
    <div style="
      min-height:100vh;
      background:#f1f5f9;
      padding:24px;
      box-sizing:border-box;
      font-family:Arial,sans-serif;
    ">
      <div style="
        max-width:900px;
        margin:0 auto;
        background:#fff;
        border:1px solid #dbe4ee;
        border-radius:16px;
        padding:24px;
      ">
        <h1 style="margin:0 0 12px 0;color:#0f172a;">Zentryx</h1>

        <p style="margin:0 0 20px 0;color:#64748b;">
          Modo recuperación activo.
        </p>

        <div style="
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
          gap:12px;
        ">
          <button id="btn_inicio" style="${btnStyle()}">Inicio</button>
          <button id="btn_agenda" style="${btnStyle()}">Agenda</button>
          <button id="btn_personal" style="${btnStyle()}">Personal</button>
          <button id="btn_config" style="${btnStyle()}">Configuración</button>
        </div>

        <div id="panel" style="
          margin-top:20px;
          padding:18px;
          border:1px solid #dbe4ee;
          border-radius:12px;
          background:#f8fafc;
          color:#0f172a;
          min-height:120px;
        ">
          App recuperada. Ahora ya sabemos si el problema viene de los módulos.
        </div>
      </div>
    </div>
  `;

  document.getElementById("btn_inicio")?.addEventListener("click", () => {
    setPanel("Inicio cargado correctamente.");
  });

  document.getElementById("btn_agenda")?.addEventListener("click", () => {
    setPanel("Agenda aislada correctamente.");
  });

  document.getElementById("btn_personal")?.addEventListener("click", () => {
    setPanel("Personal aislado correctamente.");
  });

  document.getElementById("btn_config")?.addEventListener("click", () => {
    setPanel("Configuración aislada correctamente.");
  });
}

function setPanel(texto) {
  const panel = document.getElementById("panel");
  if (!panel) return;
  panel.textContent = texto;
}

function btnStyle() {
  return `
    height:48px;
    border:none;
    border-radius:12px;
    background:#2563eb;
    color:#fff;
    font-size:15px;
    font-weight:700;
    cursor:pointer;
  `;
}

renderApp();
