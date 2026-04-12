export function renderAgenda() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <div style="
      min-height:100vh;
      background:#f3f4f6;
      padding:24px;
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
        ">Agenda</h1>

        <div style="
          display:grid;
          gap:14px;
        ">
          <button id="btn_volver_inicio" type="button" style="
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

          <button id="btn_ir_fichajes_agenda" type="button" style="
            height:52px;
            border:none;
            border-radius:14px;
            background:#1e293b;
            color:#fff;
            font-size:18px;
            font-weight:800;
            cursor:pointer;
          ">
            Ir a fichajes
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
          Pantalla de agenda cargada correctamente.
          <br><br>
          Siguiente fase: conectar eventos reales y sincronización completa.
        </div>
      </div>
    </div>
  `;

  document.getElementById("btn_volver_inicio")?.addEventListener("click", () => {
    import("./inicio.js").then(mod => {
      if (mod && typeof mod.renderInicio === "function") {
        mod.renderInicio();
      } else {
        alert("Error cargando inicio");
      }
    });
  });

  document.getElementById("btn_ir_fichajes_agenda")?.addEventListener("click", () => {
    import("./fichajes.js").then(mod => {
      if (mod && typeof mod.renderFichajes === "function") {
        mod.renderFichajes();
      } else {
        alert("Error cargando fichajes");
      }
    });
  });
}