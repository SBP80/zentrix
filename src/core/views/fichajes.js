import {
  addFichaje,
  getFichajes,
  deleteFichaje,
  getResumenHoyPorTrabajador,
  getResumenesHoy
} from "../fichajes.js";
import { db } from "../db.js";

export function renderFichajes() {
  const personal = db.personal.getAll();
  const trabajadorActual =
    document.getElementById("f_usuario")?.value ||
    (personal[0]?.nombre || personal[0]?.usuario || "");

  const fichajes = getFichajes().slice().reverse();
  const resumenActual = getResumenHoyPorTrabajador(trabajadorActual);
  const resumenesHoy = getResumenesHoy();

  setTimeout(() => {
    window.ficharUI = function (tipo) {
      const usuario = document.getElementById("f_usuario")?.value || "";
      const nota = document.getElementById("f_nota")?.value?.trim() || "";

      if (!usuario) {
        alert("Selecciona trabajador");
        return;
      }

      addFichaje({
        trabajador: usuario,
        tipo,
        nota
      });

      refrescar();
    };

    window.borrarFichajeUI = function (id) {
      const ok = window.confirm("¿Borrar fichaje?");
      if (!ok) return;
      deleteFichaje(id);
      refrescar();
    };

    document.getElementById("f_usuario")?.addEventListener("change", () => {
      refrescar();
    });
  }, 0);

  return `
    <div style="max-width:100%;width:100%;display:grid;gap:16px;">
      <div class="panel-card">
        <h3 style="margin-top:0;margin-bottom:14px;">Fichajes</h3>

        <div style="display:grid;gap:10px;margin-bottom:16px;">
          <div>
            <label for="f_usuario" style="${labelStyle()}">Trabajador</label>
            <select id="f_usuario" style="${inputStyle()}">
              ${
                personal.length
                  ? personal.map((p) => {
                      const nombre = p.nombre || p.usuario || "Trabajador";
                      return `<option value="${escapeHtmlAttr(nombre)}" ${nombre === trabajadorActual ? "selected" : ""}>${escapeHtml(nombre)}</option>`;
                    }).join("")
                  : `<option value="">Sin trabajadores</option>`
              }
            </select>
          </div>

          <div>
            <label for="f_nota" style="${labelStyle()}">Nota opcional</label>
            <input id="f_nota" placeholder="Ej: desayuno, comida, salida obra..." style="${inputStyle()}">
          </div>
        </div>

        <div style="
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
          gap:10px;
          margin-bottom:18px;
        ">
          <button onclick="ficharUI('entrada')" style="${btn('#16a34a')}">Entrada</button>
          <button onclick="ficharUI('salida')" style="${btn('#dc2626')}">Salida</button>
          <button onclick="ficharUI('inicio_descanso')" style="${btn('#f59e0b')}">Inicio descanso</button>
          <button onclick="ficharUI('fin_descanso')" style="${btn('#ea580c')}">Fin descanso</button>
          <button onclick="ficharUI('inicio_comida')" style="${btn('#7c3aed')}">Inicio comida</button>
          <button onclick="ficharUI('fin_comida')" style="${btn('#4c1d95')}">Fin comida</button>
        </div>

        <div style="
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
          gap:10px;
        ">
          ${cardResumen("Bruto hoy", resumenActual.brutoTexto)}
          ${cardResumen("Descanso hoy", resumenActual.descansoTexto)}
          ${cardResumen("Comida hoy", resumenActual.comidaTexto)}
          ${cardResumen("Neto hoy", resumenActual.netoTexto)}
        </div>

        <div style="margin-top:10px;font-size:13px;color:#64748b;">
          Estado: ${resumenActual.abierto ? "jornada abierta" : "jornada cerrada o sin entrada"}
        </div>
      </div>

      <div class="panel-card">
        <h3 style="margin-top:0;margin-bottom:14px;">Resumen de hoy</h3>

        <div style="display:grid;gap:10px;">
          ${
            resumenesHoy.length
              ? resumenesHoy.map((r) => `
                <div style="
                  padding:12px;
                  border:1px solid #e2e8f0;
                  border-radius:12px;
                  background:#fff;
                  display:grid;
                  gap:6px;
                ">
                  <div style="font-weight:800;color:#0f172a;">
                    ${escapeHtml(r.trabajador)}
                  </div>
                  <div style="font-size:13px;color:#475569;">
                    Bruto: ${escapeHtml(r.brutoTexto)} · Descanso: ${escapeHtml(r.descansoTexto)} · Comida: ${escapeHtml(r.comidaTexto)}
                  </div>
                  <div style="font-size:13px;color:#0f172a;font-weight:700;">
                    Neto: ${escapeHtml(r.netoTexto)}
                  </div>
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
                  No hay fichajes hoy.
                </div>
              `
          }
        </div>
      </div>

      <div class="panel-card">
        <h3 style="margin-top:0;margin-bottom:14px;">Historial</h3>

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
                  <div style="min-width:0;flex:1;">
                    <div style="font-weight:800;color:#0f172a;">
                      ${escapeHtml(f.trabajador)}
                    </div>
                    <div style="margin-top:4px;font-size:13px;color:#475569;">
                      ${escapeHtml(tipoBonito(f.tipo))}
                    </div>
                    <div style="margin-top:4px;font-size:12px;color:#64748b;">
                      ${formatearFechaHora(f.fecha)}
                    </div>
                    ${f.nota ? `<div style="margin-top:6px;font-size:12px;color:#64748b;">${escapeHtml(f.nota)}</div>` : ""}
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

function cardResumen(titulo, valor) {
  return `
    <div style="
      padding:12px;
      border:1px solid #e2e8f0;
      border-radius:12px;
      background:#f8fafc;
    ">
      <div style="font-size:12px;color:#64748b;margin-bottom:6px;">${escapeHtml(titulo)}</div>
      <div style="font-size:20px;font-weight:800;color:#0f172a;">${escapeHtml(valor)}</div>
    </div>
  `;
}

function tipoBonito(tipo) {
  if (tipo === "entrada") return "Entrada";
  if (tipo === "salida") return "Salida";
  if (tipo === "inicio_descanso") return "Inicio descanso";
  if (tipo === "fin_descanso") return "Fin descanso";
  if (tipo === "inicio_comida") return "Inicio comida";
  if (tipo === "fin_comida") return "Fin comida";
  return tipo || "-";
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
    width:100%;
    min-height:46px;
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
