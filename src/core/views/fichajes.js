import { addFichaje, getFichajes, deleteFichaje } from "../fichajes.js";
import { db } from "../db.js";

export function renderFichajes() {
  const personal = db.personal.getAll();
  const fichajes = getFichajes().slice().reverse();

  setTimeout(() => {
    window.ficharEntrada = function () {
      const usuario = document.getElementById("f_usuario")?.value || "";
      if (!usuario) {
        alert("Selecciona trabajador");
        return;
      }

      addFichaje({
        trabajador: usuario,
        tipo: "entrada"
      });

      refrescar();
    };

    window.ficharSalida = function () {
      const usuario = document.getElementById("f_usuario")?.value || "";
      if (!usuario) {
        alert("Selecciona trabajador");
        return;
      }

      addFichaje({
        trabajador: usuario,
        tipo: "salida"
      });

      refrescar();
    };

    window.borrarFichajeUI = function (id) {
      const ok = window.confirm("¿Borrar fichaje?");
      if (!ok) return;
      deleteFichaje(id);
      refrescar();
    };
  }, 0);

  return `
    <div style="max-width:900px;width:100%;">
      <div class="panel-card">
        <h3 style="margin-top:0;">Fichajes</h3>

        <div style="display:grid;gap:10px;margin-bottom:20px;">
          <div>
            <label for="f_usuario" style="${labelStyle()}">Trabajador</label>
            <select id="f_usuario" style="${inputStyle()}">
              ${
                personal.length
                  ? personal.map((p) => `<option value="${escapeHtml(p.nombre || p.usuario || "Trabajador")}">${escapeHtml(p.nombre || p.usuario || "Trabajador")}</option>`).join("")
                  : `<option value="">Sin trabajadores</option>`
              }
            </select>
          </div>

          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button onclick="ficharEntrada()" style="${btn('#16a34a')}">Entrada</button>
            <button onclick="ficharSalida()" style="${btn('#dc2626')}">Salida</button>
          </div>
        </div>

        <div style="display:grid;gap:10px;">
          ${
            fichajes.length
              ? fichajes.map((f) => `
                <div style="
                  padding:12px;
                  border:1px solid #e2e8f0;
                  border-radius:12px;
                  background:#fff;
                  display:flex;
                  justify-content:space-between;
                  gap:10px;
                  align-items:flex-start;
                ">
                  <div>
                    <div style="font-weight:800;color:#0f172a;">
                      ${escapeHtml(f.trabajador)}
                    </div>
                    <div style="margin-top:4px;font-size:13px;color:#475569;">
                      ${escapeHtml(f.tipo.toUpperCase())}
                    </div>
                    <div style="margin-top:4px;font-size:12px;color:#64748b;">
                      ${formatearFechaHora(f.fecha)}
                    </div>
                  </div>

                  <button onclick="borrarFichajeUI('${escapeHtmlAttr(f.id)}')" style="${btnMiniRojo()}">✕</button>
                </div>
              `).join("")
              : `
                <div style="
                  padding:14px;
                  border:1px dashed #cbd5e1;
                  border-radius:12px;
                  background:#f8fafc;
                  color:#64748b;
                ">
                  No hay fichajes todavía.
                </div>
              `
          }
        </div>
      </div>
    </div>
  `;
}

function refrescar() {
  const c = document.getElementById("viewContainer");
  if (!c) return;
  c.innerHTML = renderFichajes();
}

function formatearFechaHora(valor) {
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return valor;
  return d.toLocaleString("es-ES");
}

function labelStyle() {
  return `
    display:block;
    margin-bottom:6px;
    font-size:14px;
    font-weight:700;
    color:#0f172a;
  `;
}

function inputStyle() {
  return `
    width:100%;
    height:46px;
    padding:0 12px;
    border:1px solid #cbd5e1;
    border-radius:12px;
    background:#fff;
    color:#0f172a;
    font-size:15px;
    box-sizing:border-box;
  `;
}

function btn(color) {
  return `
    flex:1;
    min-width:140px;
    padding:12px;
    border:none;
    border-radius:12px;
    background:${color};
    color:#fff;
    font-weight:700;
    cursor:pointer;
    box-sizing:border-box;
  `;
}

function btnMiniRojo() {
  return `
    width:40px;
    height:40px;
    border:none;
    border-radius:10px;
    background:#dc2626;
    color:#fff;
    font-weight:700;
    cursor:pointer;
    box-sizing:border-box;
  `;
}

function escapeHtml(texto) {
  return String(texto || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeHtmlAttr(texto) {
  return escapeHtml(texto);
}