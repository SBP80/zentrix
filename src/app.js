import { renderInicio } from "./core/views/inicio.js";
import { renderAgenda } from "./core/views/agenda.js";
import { renderPersonal } from "./core/views/personal.js";

const app = document.getElementById("app");

let currentView = "inicio";

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
        max-width:1100px;
        margin:0 auto;
        background:#fff;
        border:1px solid #dbe4ee;
        border-radius:16px;
        padding:20px;
      ">
        <h1 style="margin:0 0 20px 0;color:#0f172a;">Zentryx</h1>

        <div style="
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(160px,1fr));
          gap:10px;
          margin-bottom:20px;
        ">
          <button onclick="setView('inicio')" style="${btn(currentView === "inicio")}">Inicio</button>
          <button onclick="setView('agenda')" style="${btn(currentView === "agenda")}">Agenda</button>
          <button onclick="setView('personal')" style="${btn(currentView === "personal")}">Personal</button>
          <button onclick="setView('configuracion')" style="${btn(currentView === "configuracion")}">Configuración</button>
        </div>

        <div id="viewContainer">
          ${renderView()}
        </div>
      </div>
    </div>
  `;
}

function renderView() {
  if (currentView === "inicio") return renderInicio();
  if (currentView === "agenda") return renderAgenda();
  if (currentView === "personal") return renderPersonal();
  if (currentView === "configuracion") return renderConfiguracionSimple();
  return renderInicio();
}

function renderConfiguracionSimple() {
  return `
    <div style="display:grid;gap:18px;">
      <div style="
        border:1px solid #dbe4ee;
        border-radius:16px;
        background:#f8fafc;
        padding:20px;
      ">
        <div style="font-size:28px;font-weight:800;color:#0f172a;">Configuración</div>
        <div style="margin-top:8px;font-size:15px;color:#64748b;">
          Base simple estable para seguir reconstruyendo.
        </div>
      </div>

      <div style="
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
        gap:14px;
      ">
        ${card("Usuarios", "Pendiente")}
        ${card("Roles", "Pendiente")}
        ${card("Permisos", "Pendiente")}
        ${card("Ajustes", "Pendiente")}
      </div>
    </div>
  `;
}

function card(titulo, texto) {
  return `
    <div style="
      border:1px solid #dbe4ee;
      border-radius:14px;
      background:#fff;
      padding:16px;
    ">
      <div style="font-size:15px;color:#64748b;margin-bottom:8px;">${titulo}</div>
      <div style="font-size:22px;font-weight:800;color:#0f172a;">${texto}</div>
    </div>
  `;
}

function btn(active) {
  return `
    height:44px;
    border:none;
    border-radius:10px;
    background:${active ? "#2563eb" : "#1e293b"};
    color:#fff;
    font-weight:700;
    cursor:pointer;
  `;
}

window.setView = function (view) {
  currentView = view;
  renderApp();
};

renderApp();