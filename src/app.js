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
  if (currentView === "agenda") return renderSimple("Agenda");
  if (currentView === "personal") return renderSimple("Personal");
  if (currentView === "configuracion") return renderSimple("Configuración");
  return renderInicio();
}

function renderInicio() {
  const ahora = new Date();

  const fecha = ahora.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  const hora = ahora.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return `
    <div style="display:grid;gap:18px;">
      <div style="
        border:1px solid #dbe4ee;
        border-radius:16px;
        background:#f8fafc;
        padding:20px;
        display:flex;
        justify-content:space-between;
        gap:20px;
        flex-wrap:wrap;
      ">
        <div>
          <div style="font-size:30px;font-weight:800;color:#0f172a;">Inicio</div>
          <div style="margin-top:8px;font-size:16px;color:#64748b;text-transform:capitalize;">
            ${fecha}
          </div>
        </div>

        <div style="text-align:right;">
          <div style="font-size:38px;font-weight:800;color:#0f172a;">
            ${hora}
          </div>
          <div style="margin-top:8px;font-size:14px;color:#64748b;">
            Portada recuperada correctamente
          </div>
        </div>
      </div>

      <div style="
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
        gap:14px;
      ">
        ${card("Agenda", "Pendiente de reconstruir")}
        ${card("Personal", "Pendiente de reconstruir")}
        ${card("Configuración", "Pendiente de reconstruir")}
        ${card("Notas rápidas", "Las añadimos después")}
      </div>

      <div style="
        border:1px solid #dbe4ee;
        border-radius:16px;
        background:#fff;
        padding:20px;
      ">
        <div style="font-size:20px;font-weight:800;color:#0f172a;margin-bottom:12px;">
          Accesos rápidos
        </div>

        <div style="
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
          gap:10px;
        ">
          <button onclick="setView('agenda')" style="${quickBtn("#2563eb")}">Abrir agenda</button>
          <button onclick="setView('personal')" style="${quickBtn("#0f766e")}">Abrir personal</button>
          <button onclick="setView('configuracion')" style="${quickBtn("#7c3aed")}">Abrir configuración</button>
        </div>
      </div>
    </div>
  `;
}

function renderSimple(nombre) {
  return `
    <div style="
      border:1px solid #dbe4ee;
      border-radius:16px;
      background:#f8fafc;
      padding:24px;
      color:#0f172a;
    ">
      <div style="font-size:28px;font-weight:800;margin-bottom:10px;">${nombre}</div>
      <div style="font-size:15px;color:#64748b;">
        Módulo aislado para reconstrucción segura.
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

function quickBtn(color) {
  return `
    min-height:48px;
    border:none;
    border-radius:12px;
    background:${color};
    color:#ffffff;
    font-size:15px;
    font-weight:700;
    cursor:pointer;
    padding:0 14px;
    text-align:left;
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
