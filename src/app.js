const app = document.getElementById("app");

function renderApp() {
  app.innerHTML = `
    <div style="
      min-height:100vh;
      background:#f1f5f9;
      padding:24px;
      font-family:Arial,sans-serif;
    ">
      <div style="
        max-width:1000px;
        margin:0 auto;
        background:#fff;
        border:1px solid #dbe4ee;
        border-radius:16px;
        padding:20px;
      ">
        <h1 style="margin:0 0 20px 0;">Zentryx</h1>

        <div style="
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(150px,1fr));
          gap:10px;
          margin-bottom:20px;
        ">
          <button onclick="setView('inicio')" style="${btn()}">Inicio</button>
          <button onclick="setView('agenda')" style="${btn()}">Agenda</button>
          <button onclick="setView('personal')" style="${btn()}">Personal</button>
          <button onclick="setView('config')" style="${btn()}">Configuración</button>
        </div>

        <div id="view"></div>
      </div>
    </div>
  `;

  setView("inicio");
}

window.setView = function (view) {
  const container = document.getElementById("view");

  if (view === "inicio") {
    container.innerHTML = "Pantalla Inicio OK";
  }

  if (view === "agenda") {
    container.innerHTML = "Pantalla Agenda OK";
  }

  if (view === "personal") {
    container.innerHTML = "Pantalla Personal OK";
  }

  if (view === "config") {
    container.innerHTML = "Pantalla Configuración OK";
  }
};

function btn() {
  return `
    height:42px;
    border:none;
    border-radius:10px;
    background:#2563eb;
    color:#fff;
    font-weight:700;
    cursor:pointer;
  `;
}

renderApp();
