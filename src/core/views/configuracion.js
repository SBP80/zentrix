import { getCalendarioLaboral } from "../agenda.js";

export function renderConfiguracion() {
  const calendario = getCalendarioLaboral();
  const year = new Date().getFullYear();
  const festivos = calendario[year] || [];

  setTimeout(() => {
    window.addFestivoUI = function () {
      const fecha = document.getElementById("festivoFecha")?.value;
      if (!fecha) return;

      const data = JSON.parse(localStorage.getItem("zentrix_festivos_empresa_v1") || "{}");

      if (!data[year]) data[year] = [];

      if (!data[year].includes(fecha)) {
        data[year].push(fecha);
      }

      localStorage.setItem("zentrix_festivos_empresa_v1", JSON.stringify(data));
      refrescar();
    };

    window.deleteFestivoUI = function (fecha) {
      const data = JSON.parse(localStorage.getItem("zentrix_festivos_empresa_v1") || "{}");

      if (!data[year]) return;

      data[year] = data[year].filter(f => f !== fecha);

      localStorage.setItem("zentrix_festivos_empresa_v1", JSON.stringify(data));
      refrescar();
    };
  }, 0);

  return `
    <div style="max-width:800px;width:100%;">
      <div class="panel-card">
        <h3 style="margin-top:0;">Calendario laboral ${year}</h3>

        <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
          <input id="festivoFecha" type="date" style="${inputStyle()}" />
          <button onclick="addFestivoUI()" style="${btn()}">Añadir</button>
        </div>

        <div style="display:grid;gap:10px;">
          ${
            festivos.length
              ? festivos.map(f => `
                <div style="
                  display:flex;
                  justify-content:space-between;
                  align-items:center;
                  gap:10px;
                  padding:12px;
                  border:1px solid #dbe4ee;
                  border-radius:10px;
                  background:#f8fafc;
                ">
                  <div>${formatear(f)}</div>
                  <button onclick="deleteFestivoUI('${f}')" style="${btnRojo()}">✕</button>
                </div>
              `).join("")
              : `<div style="color:#64748b;">No hay festivos definidos</div>`
          }
        </div>
      </div>
    </div>
  `;
}

function refrescar() {
  const container = document.getElementById("viewContainer");
  if (container) container.innerHTML = renderConfiguracion();
}

function formatear(f) {
  const d = new Date(f + "T12:00:00");
  return d.toLocaleDateString("es-ES");
}

function inputStyle() {
  return `
    flex:1;
    min-width:220px;
    height:46px;
    padding:0 12px;
    border:1px solid #cbd5e1;
    border-radius:12px;
    box-sizing:border-box;
  `;
}

function btn() {
  return `
    height:46px;
    padding:0 16px;
    border:none;
    border-radius:12px;
    background:#2563eb;
    color:#fff;
    font-weight:700;
    cursor:pointer;
  `;
}

function btnRojo() {
  return `
    width:40px;
    height:40px;
    border:none;
    border-radius:10px;
    background:#dc2626;
    color:#fff;
    cursor:pointer;
  `;
}