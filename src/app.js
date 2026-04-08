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
      padding:12px;
      box-sizing:border-box;
      font-family:Arial,sans-serif;
      overflow-x:hidden;
    ">
      <div style="
        width:100%;
        max-width:1100px;
        margin:0 auto;
        background:#fff;
        border:1px solid #dbe4ee;
        border-radius:16px;
        padding:14px;
        box-sizing:border-box;
        overflow-x:hidden;
      ">
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          flex-wrap:wrap;
          margin-bottom:16px;
        ">
          <h1 style="
            margin:0;
            color:#0f172a;
            font-size:clamp(34px, 8vw, 52px);
            line-height:1;
            word-break:break-word;
          ">Zentryx</h1>
        </div>

        <div style="
          display:grid;
          grid-template-columns:1fr;
          gap:10px;
          margin-bottom:16px;
        ">
          <button onclick="setView('inicio')" style="${btn(currentView === "inicio")}">Inicio</button>
          <button onclick="setView('agenda')" style="${btn(currentView === "agenda")}">Agenda</button>
          <button onclick="setView('personal')" style="${btn(currentView === "personal")}">Personal</button>
          <button onclick="setView('configuracion')" style="${btn(currentView === "configuracion")}">Configuración</button>
        </div>

        <div id="viewContainer" style="
          width:100%;
          min-width:0;
          overflow-x:hidden;
        ">
          ${wrapView(renderView())}
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

function wrapView(content) {
  return `
    <div style="
      width:100%;
      min-width:0;
      overflow-x:auto;
    ">
      <div style="
        width:100%;
        min-width:0;
      ">
        ${content}
      </div>
    </div>
  `;
}

function renderConfiguracionSimple() {
  return `
    <div style="display:grid;gap:14px;width:100%;min-width:0;">
      <div style="
        border:1px solid #dbe4ee;
        border-radius:16px;
        background:#f8fafc;
        padding:16px;
        box-sizing:border-box;
      ">
        <div style="
          font-size:clamp(28px, 7vw, 40px);
          font-weight:800;
          color:#0f172a;
          line-height:1.05;
          word-break:break-word;
        ">Configuración</div>

        <div style="
          margin-top:8px;
          font-size:16px;
          color:#64748b;
          line-height:1.45;
        ">
          Base simple estable para seguir reconstruyendo.
        </div>
      </div>

      <div style="
        display:grid;
        grid-template-columns:1fr;
        gap:12px;
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
      box-sizing:border-box;
      width:100%;
      min-width:0;
    ">
      <div style="
        font-size:15px;
        color:#64748b;
        margin-bottom:8px;
        line-height:1.3;
        word-break:break-word;
      ">${titulo}</div>

      <div style="
        font-size:30px;
        font-weight:800;
        color:#0f172a;
        line-height:1.05;
        word-break:break-word;
      ">${texto}</div>
    </div>
  `;
}

function btn(active) {
  return `
    width:100%;
    min-height:58px;
    border:none;
    border-radius:18px;
    background:${active ? "#3f63dd" : "#1e2c46"};
    color:#fff;
    font-weight:800;
    font-size:17px;
    cursor:pointer;
    padding:0 16px;
    box-sizing:border-box;
  `;
}

window.setView = function (view) {
  currentView = view;
  renderApp();
};

renderApp();
