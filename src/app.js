import { state } from "./core/state.js";

import { renderInicio } from "./core/views/inicio.js";
import { renderAgenda } from "./core/views/agenda.js";
import { renderConfiguracion } from "./core/views/configuracion.js";
import { renderPersonal } from "./core/views/personal.js";

const app = document.getElementById("app");

function renderApp() {
  let content = "";

  if (state.view === "inicio") content = renderInicio();
  if (state.view === "agenda") content = renderAgenda();
  if (state.view === "personal") content = renderPersonal();
  if (state.view === "configuracion") content = renderConfiguracion();

  app.innerHTML = `
    <div style="display:flex;min-height:100vh;">

      <div style="
        width:220px;
        background:#0f172a;
        color:#fff;
        padding:20px;
      ">
        <h2>Zentryx</h2>

        <button class="nav-btn" data-view="inicio" style="${btn()}">Inicio</button>
        <button class="nav-btn" data-view="agenda" style="${btn()}">Agenda</button>
        <button class="nav-btn" data-view="personal" style="${btn()}">Personal</button>
        <button class="nav-btn" data-view="configuracion" style="${btn()}">Configuración</button>
      </div>

      <div id="viewContainer" style="
        flex:1;
        padding:20px;
        background:#f1f5f9;
      ">
        ${content}
      </div>

    </div>
  `;

  activarMenu();
}

function activarMenu() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.onclick = () => {
      state.view = btn.dataset.view;
      renderApp();
    };
  });
}

function btn() {
  return `
    width:100%;
    margin-bottom:10px;
    padding:10px;
    border:none;
    border-radius:8px;
    background:#1e293b;
    color:white;
    cursor:pointer;
  `;
}

renderApp();
