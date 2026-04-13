import { renderMenu, activarMenu } from "../../components/menu.js";
import { requireAuth, logout } from "../guards.js";

export function renderInicio() {
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
          margin:0 0 10px 0;
          font-size:34px;
          color:#111827;
        ">Inicio</h1>

        <div style="
          margin-bottom:18px;
          color:#475569;
          font-size:16px;
          font-weight:700;
        ">
          Usuario activo: ${escapeHtml(sesion.nombre || sesion.usuario || "Sin usuario")}
          <br>
          Rol: ${escapeHtml(sesion.rol || "Sin rol")}
        </div>

        <div style="
          display:grid;
          gap:14px;
        ">
          <button id="btn_ir_fichajes" type="button" style="
            height:52px;
            border:none;
            border-radius:14px;
            background:#4361ee;
            color:#fff;
            font-size:18px;
            font-weight:800;
            cursor:pointer;
          ">
            Ir a fichajes
          </button>

          <button id="btn_ir_agenda" type="button" style="
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

          <button id="btn_cerrar_sesion_inicio" type="button" style="
            height:52px;
            border:none;
            border-radius:14px;
            background:#dc2626;
            color:#fff;
            font-size:18px;
            font-weight:800;
            cursor:pointer;
          ">
            Cerrar sesión
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
          Pantalla de inicio protegida correctamente.
          <br><br>
          Solo entra quien tenga sesión activa.
        </div>
      </div>

      ${renderMenu("inicio")}
    </div>
  `;

  activarMenu();

  document.getElementById("btn_ir_fichajes")?.addEventListener("click", async () => {
    const mod = await import("./fichajes.js");
    if (mod && typeof mod.renderFichajes === "function") {
      mod.renderFichajes();
    }
  });

  document.getElementById("btn_ir_agenda")?.addEventListener("click", async () => {
    const mod = await import("./agenda.js");
    if (mod && typeof mod.renderAgenda === "function") {
      mod.renderAgenda();
    }
  });

  document.getElementById("btn_cerrar_sesion_inicio")?.addEventListener("click", () => {
    logout();
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