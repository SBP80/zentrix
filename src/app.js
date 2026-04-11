import { renderConfiguracion } from "./core/views/configuracion.js";

const app = document.getElementById("app");

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
        <div id="viewContainer">
          ${renderConfiguracion()}
        </div>
      </div>
    </div>
  `;
}

renderApp();