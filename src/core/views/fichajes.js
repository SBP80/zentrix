import { renderMenu, activarMenu } from "../../components/menu.js";

export function renderFichajes() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <div style="
      min-height:100vh;
      background:#f3f4f6;
      padding:24px 24px 110px 24px;
      box-sizing:border-box;
      font-family:Arial,sans-serif;
    ">
      <div style="
        max-width:900px;
        margin:0 auto;
        background:#ffffff;
        border:1px solid #dbe4ee;
        border-radius:20px;
        padding:24px;
        box-sizing:border-box;
      ">
        <h1 style="
          margin:0 0 18px 0;
          font-size:34px;
          color:#111827;
        ">Fichajes</h1>

        <div style="
          display:grid;
          gap:14px;
        ">
          <button id="btn_volver_inicio_fichajes" type="button" style="
            height:52px;
            border:none;
            border-radius:14px;
            background:#4361ee;
            color:#fff;
            font-size:18px;
            font-weight:800;
            cursor:pointer;
          ">
            Volver a inicio
          </button>

          <button id="btn_ir_agenda_fichajes" type="button" style="
            height:52px;
            border:none;
            border-radius:14px;
            background:#1e293b;
            color:#fff;
            font-size:18px;
            font-weight:800;
            cursor:pointer;
          ">
            Ir a agenda
          </button>
        </div>

        <div style="
          margin-top:20px;
          padding:18px;
          border:1px solid #dbe4ee;
          border-radius:16px;
          background:#f8fafc;
          color:#111827;
          font-size:16px;
          line-height:1.6;
        ">
          Pantalla de fichajes cargada correctamente dentro de la app.
          <br><br>
          En el siguiente paso conectaremos aquí el fichaje real con usuario activo.
        </div>
      </div>

      ${renderMenu("fichajes")}
    </div>
  `;

  activarMenu();

  document.getElementById("btn_volver_inicio_fichajes")?.addEventListener("click", async () => {
    const mod = await import("./inicio.js");
    if (mod && typeof mod.renderInicio === "function") {
      mod.renderInicio();
    } else {
      alert("Error cargando inicio");
    }
  });

  document.getElementById("btn_ir_agenda_fichajes")?.addEventListener("click", async () => {
    const mod = await import("./agenda.js");
    if (mod && typeof mod.renderAgenda === "function") {
      mod.renderAgenda();
    } else {
      alert("Error cargando agenda");
    }
  });
}