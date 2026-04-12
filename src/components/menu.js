export function renderMenu(activo = "inicio") {
  return `
    <div style="
      position:fixed;
      left:0;
      right:0;
      bottom:0;
      height:70px;
      background:#ffffff;
      border-top:1px solid #dbe4ee;
      display:flex;
      z-index:999;
      font-family:Arial,sans-serif;
      box-shadow:0 -4px 18px rgba(0,0,0,0.06);
    ">
      <button data-nav="inicio" style="${getButtonStyle(activo === "inicio")}">Inicio</button>
      <button data-nav="agenda" style="${getButtonStyle(activo === "agenda")}">Agenda</button>
      <button data-nav="fichajes" style="${getButtonStyle(activo === "fichajes")}">Fichajes</button>
    </div>
  `;
}

function getButtonStyle(isActive) {
  return `
    flex:1;
    height:100%;
    border:none;
    background:${isActive ? "#4361ee" : "#ffffff"};
    color:${isActive ? "#ffffff" : "#111827"};
    font-size:15px;
    font-weight:800;
    cursor:pointer;
  `;
}

export function activarMenu() {
  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const destino = btn.getAttribute("data-nav");

      if (destino === "inicio") {
        const mod = await import("../core/views/inicio.js");
        if (mod && typeof mod.renderInicio === "function") {
          mod.renderInicio();
        }
        return;
      }

      if (destino === "agenda") {
        const mod = await import("../core/views/agenda.js");
        if (mod && typeof mod.renderAgenda === "function") {
          mod.renderAgenda();
        }
        return;
      }

      if (destino === "fichajes") {
        const mod = await import("../core/views/fichajes.js");
        if (mod && typeof mod.renderFichajes === "function") {
          mod.renderFichajes();
        }
      }
    });
  });
}