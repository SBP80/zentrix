import { renderMenu, activarMenu } from "../../components/menu.js";
import { requireAuth } from "../guards.js";

export function renderAgenda() {
  const sesion = requireAuth();
  if (!sesion) return;

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
        ">Agenda</h1>

        <div style="
          margin-bottom:18px;
          color:#475569;
          font-size:16px;
          font-weight:700;
        ">
          Usuario activo: ${escapeHtml(sesion.nombre || sesion.usuario || "Sin usuario")}
        </div>

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
          Agenda protegida correctamente.
        </div>
      </div>

      ${renderMenu("agenda")}
    </div>
  `;

  activarMenu();

  document.getElementById("btn_volver_inicio")?.addEventListener("click", async () => {
    const mod = await import("./inicio.js");
    if (mod && typeof mod.renderInicio === "function") {
      mod.renderInicio();
    }
  });

  document.getElementById("btn_ir_fichajes_agenda")?.addEventListener("click", async () => {
    const mod = await import("./fichajes.js");
    if (mod && typeof mod.renderFichajes === "function") {
      mod.renderFichajes();
    }
  });
}

function escapeHtml(texto) {
  return String(texto || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}