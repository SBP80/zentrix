import { renderInicio } from "./core/views/inicio.js";
import { renderAgenda } from "./core/views/agenda.js";
import { renderPersonal } from "./core/views/personal.js";

const app = document.getElementById("app");

let vista = "inicio";

function renderApp() {
  app.innerHTML = `
    <div style="
      min-height:100vh;
      background:#f1f5f9;
      padding:20px;
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
        box-sizing:border-box;
      ">
        <h1 style="margin:0 0 20px 0;color:#0f172a;">Zentryx</h1>

        <div style="
          display:grid;
          grid-template-columns:1fr;
          gap:10px;
          margin-bottom:20px;
        ">
          <button onclick="setView('inicio')" style="${btn(vista === "inicio")}">Inicio</button>
          <button onclick="setView('agenda')" style="${btn(vista === "agenda")}">Agenda</button>
          <button onclick="setView('personal')" style="${btn(vista === "personal")}">Personal</button>
          <button onclick="setView('configuracion')" style="${btn(vista === "configuracion")}">Configuración</button>
        </div>

        <div id="viewContainer">
          ${renderVista()}
        </div>
      </div>
    </div>
  `;
}

function renderVista() {
  if (vista === "inicio") return renderInicio();
  if (vista === "agenda") return renderAgenda();
  if (vista === "personal") return renderPersonal();
  if (vista === "configuracion") return renderConfiguracion();
  return renderInicio();
}

function renderConfiguracion() {
  return `
    <div style="display:grid; gap:16px;">
      <div style="
        border:1px solid #dbe4ee;
        border-radius:16px;
        background:#f8fafc;
        padding:20px;
      ">
        <div style="font-size:22px;font-weight:800;color:#0f172a;">
          Configuración
        </div>
        <div style="margin-top:8px;font-size:14px;color:#64748b;">
          Módulo base listo para ampliar.
        </div>
      </div>

      <div style="
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
        gap:12px;
      ">
        ${card("Usuarios")}
        ${card("Roles")}
        ${card("Permisos")}
        ${card("Calendario laboral")}
      </div>
    </div>
  `;
}

function card(titulo) {
  return `
    <div style="
      border:1px solid #dbe4ee;
      border-radius:14px;
      background:#fff;
      padding:16px;
    ">
      <div style="font-size:14px;color:#64748b;margin-bottom:6px;">
        ${titulo}
      </div>
      <div style="font-size:18px;font-weight:800;color:#0f172a;">
        Próximamente
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
  `;
}

window.setView = function (view) {
  vista = view;
  renderApp();
};

renderApp();
