export function renderMenu(activo = "inicio") {
  return `
    <div style="
      position:fixed;
      bottom:0;
      left:0;
      width:100%;
      height:70px;
      background:#ffffff;
      border-top:1px solid #dbe4ee;
      display:flex;
      justify-content:space-around;
      align-items:center;
      z-index:999;
      font-family:Arial,sans-serif;
    ">
      <button data-nav="inicio" style="${estilo(activo === "inicio")}">Inicio</button>
      <button data-nav="agenda" style="${estilo(activo === "agenda")}">Agenda</button>
      <button data-nav="fichajes" style="${estilo(activo === "fichajes")}">Fichajes</button>
    </div>
  `;
}

function estilo(activo) {
  return `
    flex:1;
    height:100%;
    border:none;
    background:${activo ? "#4361ee" : "transparent"};
    color:${activo ? "#fff" : "#111"};
    font-weight:800;
    font-size:14px;
    cursor:pointer;
  `;
}

export function activarMenu() {
  document.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const destino = btn.getAttribute("data-nav");

      if (destino === "inicio") {
        const mod = await import("../core/views/inicio.js");
        mod.renderInicio();
      }

      if (destino === "agenda") {
        const mod = await import("../core/views/agenda.js");
        mod.renderAgenda();
      }

      if (destino === "fichajes") {
        const mod = await import("../core/views/fichajes.js");
        mod.renderFichajes();
      }
    });
  });
}