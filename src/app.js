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
      <aside style="
        width:220px;
        background:#0f172a;
        color:#fff;
        padding:20px;
        box-sizing:border-box;
      ">
        <h2 style="margin:0 0 20px 0;">Zentryx</h2>

        <button class="nav-btn" data-view="inicio" style="${btnStyle(state.view === "inicio")}">Inicio</button>
        <button class="nav-btn" data-view="agenda" style="${btnStyle(state.view === "agenda")}">Agenda</button>
        <button class="nav-btn" data-view="personal" style="${btnStyle(state.view === "personal")}">Personal</button>
        <button class="nav-btn" data-view="configuracion" style="${btnStyle(state.view === "configuracion")}">Configuración</button>
      </aside>

      <main id="viewContainer" style="
        flex:1;
        padding:20px;
        background:#f1f5f9;
        box-sizing:border-box;
      ">
        ${content}
      </main>
    </div>
  `;

  activarMenu();
}

function activarMenu() {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.view = btn.dataset.view;
      renderApp();
    });
  });
}

function btnStyle(active) {
  return `
    width:100%;
    margin-bottom:10px;
    padding:10px 12px;
    border:none;
    border-radius:8px;
    background:${active ? "#2563eb" : "#1e293b"};
    color:#fff;
    cursor:pointer;
    text-align:left;
    font-weight:700;
  `;
}

renderApp();
