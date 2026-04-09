import { renderInicio } from "./core/views/inicio.js";

const app = document.getElementById("app");

function renderApp() {
  app.innerHTML = `
    <div style="padding:20px;font-family:Arial;">
      <h1>Zentryx</h1>
      ${renderInicio()}
    </div>
  `;
}

renderApp();