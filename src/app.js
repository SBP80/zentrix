import { renderInicio } from "./core/views/inicio.js";
import { renderAgenda } from "./core/views/agenda.js";
import { renderPersonal } from "./core/views/personal.js";
import { renderConfiguracion } from "./core/views/configuracion.js";
import { buscarGlobal } from "./core/search.js";

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

          <div style="
            display:grid;
            gap:8px;
            width:100%;
            min-width:0;
          ">
            <input
              id="globalSearch"
              placeholder="Buscar trabajador, tarea, agenda..."
              style="
                width:100%;
                height:48px;
                border:1px solid #cbd5e1;
                border-radius:12px;
                padding:0 12px;
                font-size:15px;
                box-sizing:border-box;
                min-width:0;
              "
            >

            <div id="searchResults" style="
              display:grid;
              gap:8px;
              width:100%;
              min-width:0;
            "></div>
          </div>
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

  activarBuscadorGlobal();
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

function activarBuscadorGlobal() {
  const input = document.getElementById("globalSearch");
  if (!input) return;

  input.addEventListener("input", () => {
    const resultados = buscarGlobal(input.value);
    pintarResultados(resultados);
  });
}

function pintarResultados(lista) {
  const cont = document.getElementById("searchResults");
  if (!cont) return;

  if (!Array.isArray(lista) || !lista.length) {
    cont.innerHTML = "";
    return;
  }

  cont.innerHTML = lista
    .slice(0, 10)
    .map((r) => `
      <button
        type="button"
        class="resultado-global"
        data-tipo="${escapeHtmlAttr(r.tipo || "")}"
        data-id="${escapeHtmlAttr(r.id || "")}"
        style="
          width:100%;
          text-align:left;
          padding:10px;
          border:1px solid #e2e8f0;
          border-radius:10px;
          background:#fff;
          cursor:pointer;
          box-sizing:border-box;
        "
      >
        <div style="
          font-weight:700;
          color:#0f172a;
          word-break:break-word;
        ">
          ${escapeHtml(r.titulo || "")}
        </div>

        <div style="
          font-size:12px;
          color:#64748b;
          margin-top:4px;
          word-break:break-word;
        ">
          ${escapeHtml(r.subtitulo || "")}
        </div>
      </button>
    `)
    .join("");

  document.querySelectorAll(".resultado-global").forEach((btn) => {
    btn.addEventListener("click", () => {
      abrirResultadoBusqueda(btn.dataset.tipo || "", btn.dataset.id || "");
    });
  });
}

function abrirResultadoBusqueda(tipo, id) {
  if (tipo === "personal") {
    currentView = "personal";
    renderApp();
    setTimeout(() => {
      const selector = `[data-id="${cssEscape(id)}"]`;
      const boton = document.querySelector(`.btn-editar${selector}, .btn-borrar${selector}`);
      boton?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
    return;
  }

  if (tipo === "agenda") {
    currentView = "agenda";
    renderApp();
    return;
  }

  currentView = "inicio";
  renderApp();
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

function escapeHtml(texto) {
  return String(texto || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeHtmlAttr(texto) {
  return escapeHtml(texto);
}

function cssEscape(value) {
  return String(value || "").replaceAll('"', '\\"');
}

window.setView = function (view) {
  currentView = view;
  renderApp();
};

renderApp();