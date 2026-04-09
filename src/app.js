import { renderInicio } from "./core/views/inicio.js";
import { renderAgenda } from "./core/views/agenda.js";
import { renderPersonal } from "./core/views/personal.js";
import { renderConfiguracion } from "./core/views/configuracion.js";

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
          flex-direction:column;
          gap:10px;
          margin-bottom:16px;
          width:100%;
          min-width:0;
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
          width:100%;
          min-width:0;
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
  if (currentView === "configuracion") return renderConfiguracion();
  return renderInicio();
}

function wrapView(content) {
  return `
    <div style="
      width:100%;
      min-width:0;
      overflow-x:hidden;
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