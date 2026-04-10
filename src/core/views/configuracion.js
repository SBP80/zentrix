import { getCalendarioLaboral, getFestivosEmpresa } from "../agenda.js";

const EMPRESA_CONFIG_KEY = "zentrix_empresa_config_v1";

export function renderConfiguracion() {
  const year = String(new Date().getFullYear());
  const calendarioCompleto = getCalendarioLaboral();
  const festivosEmpresa = getFestivosEmpresa();
  const config = getEmpresaConfig();

  const todos = calendarioCompleto[year] || [];
  const empresa = festivosEmpresa[year] || [];

  setTimeout(() => {
    window.addFestivoUI = function () {
      const fecha = document.getElementById("festivoFecha")?.value;
      if (!fecha) return;

      const data = JSON.parse(localStorage.getItem("zentrix_festivos_empresa_v1") || "{}");

      if (!Array.isArray(data[year])) data[year] = [];

      if (!data[year].includes(fecha)) {
        data[year].push(fecha);
        data[year].sort();
      }

      localStorage.setItem("zentrix_festivos_empresa_v1", JSON.stringify(data));
      refrescar();
    };

    window.deleteFestivoUI = function (fecha) {
      const data = JSON.parse(localStorage.getItem("zentrix_festivos_empresa_v1") || "{}");

      if (!Array.isArray(data[year])) return;

      data[year] = data[year].filter((f) => f !== fecha);

      localStorage.setItem("zentrix_festivos_empresa_v1", JSON.stringify(data));
      refrescar();
    };

    window.saveEmpresaConfigUI = function () {
      const nueva = {
        trabajaSabados: document.getElementById("cfgTrabajaSabados")?.value === "true",
        modoValidacionAgenda: document.getElementById("cfgModoValidacionAgenda")?.value || "aviso",
        horaInicio: document.getElementById("cfgHoraInicio")?.value || "08:00",
        horaFin: document.getElementById("cfgHoraFin")?.value || "18:00"
      };

      localStorage.setItem(EMPRESA_CONFIG_KEY, JSON.stringify(nueva));
      alert("Configuración guardada");
      refrescar();
    };
  }, 0);

  return `
    <div style="max-width:900px;width:100%;display:grid;gap:18px;">
      <div class="panel-card">
        <h3 style="margin-top:0;">Configuración de empresa</h3>

        <div style="display:grid;gap:12px;">
          <div style="display:grid;gap:4px;">
            <label style="${labelStyle()}" for="cfgTrabajaSabados">¿La empresa trabaja los sábados?</label>
            <select id="cfgTrabajaSabados" style="${inputStyle()}">
              <option value="true" ${config.trabajaSabados ? "selected" : ""}>Sí</option>
              <option value="false" ${!config.trabajaSabados ? "selected" : ""}>No</option>
            </select>
          </div>

          <div style="display:grid;gap:4px;">
            <label style="${labelStyle()}" for="cfgModoValidacionAgenda">Modo de validación de Agenda</label>
            <select id="cfgModoValidacionAgenda" style="${inputStyle()}">
              <option value="aviso" ${config.modoValidacionAgenda === "aviso" ? "selected" : ""}>Aviso</option>
              <option value="estricto" ${config.modoValidacionAgenda === "estricto" ? "selected" : ""}>Estricto</option>
            </select>
          </div>

          <div style="
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
            gap:12px;
          ">
            <div style="display:grid;gap:4px;">
              <label style="${labelStyle()}" for="cfgHoraInicio">Hora inicio jornada</label>
              <input id="cfgHoraInicio" type="time" value="${escapeHtmlAttr(config.horaInicio)}" style="${inputStyle()}">
            </div>

            <div style="display:grid;gap:4px;">
              <label style="${labelStyle()}" for="cfgHoraFin">Hora fin jornada</label>
              <input id="cfgHoraFin" type="time" value="${escapeHtmlAttr(config.horaFin)}" style="${inputStyle()}">
            </div>
          </div>

          <button onclick="saveEmpresaConfigUI()" style="${btn()}">Guardar configuración</button>
        </div>
      </div>

      <div class="panel-card">
        <h3 style="margin-top:0;">Calendario laboral ${year}</h3>

        <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
          <input id="festivoFecha" type="date" style="${inputStyle()}">
          <button onclick="addFestivoUI()" style="${btn()}">Añadir festivo empresa</button>
        </div>

        <div style="display:grid;gap:10px;">
          ${
            todos.length
              ? todos.map((f) => {
                  const esEmpresa = empresa.includes(f);

                  return `
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
                      <div style="display:grid;gap:4px;">
                        <div>${formatear(f)}</div>
                        <div style="font-size:12px;color:#64748b;">
                          ${esEmpresa ? "Festivo empresa" : "Festivo base"}
                        </div>
                      </div>

                      ${
                        esEmpresa
                          ? `<button onclick="deleteFestivoUI('${f}')" style="${btnRojo()}">✕</button>`
                          : `<div style="${badgeBase()}">Base</div>`
                      }
                    </div>
                  `;
                }).join("")
              : `<div style="color:#64748b;">No hay festivos definidos</div>`
          }
        </div>
      </div>
    </div>
  `;
}

function getEmpresaConfig() {
  try {
    const raw = JSON.parse(localStorage.getItem(EMPRESA_CONFIG_KEY) || "{}");
    return {
      trabajaSabados: raw.trabajaSabados === true,
      modoValidacionAgenda: raw.modoValidacionAgenda === "estricto" ? "estricto" : "aviso",
      horaInicio: raw.horaInicio || "08:00",
      horaFin: raw.horaFin || "18:00"
    };
  } catch {
    return {
      trabajaSabados: false,
      modoValidacionAgenda: "aviso",
      horaInicio: "08:00",
      horaFin: "18:00"
    };
  }
}

function refrescar() {
  const container = document.getElementById("viewContainer");
  if (container) container.innerHTML = renderConfiguracion();
}

function formatear(f) {
  const d = new Date(f + "T12:00:00");
  return d.toLocaleDateString("es-ES");
}

function labelStyle() {
  return `
    font-size:12px;
    font-weight:700;
    color:#475569;
  `;
}

function inputStyle() {
  return `
    width:100%;
    min-width:220px;
    height:46px;
    padding:0 12px;
    border:1px solid #cbd5e1;
    border-radius:12px;
    box-sizing:border-box;
    background:#fff;
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

function badgeBase() {
  return `
    min-width:52px;
    height:32px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    border-radius:10px;
    background:#64748b;
    color:#fff;
    font-size:12px;
    font-weight:700;
    padding:0 10px;
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