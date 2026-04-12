import { addFichaje, getFichajes, deleteFichaje } from "../fichajes.js";
import { db } from "../db.js";

export function renderFichajes() {
  const personal = db.personal.getAll();
  const fichajes = getFichajes().slice().reverse();

  setTimeout(() => {
    window.fichar = function (tipo) {
      const usuario = document.getElementById("f_usuario")?.value || "";

      if (!usuario) {
        alert("Selecciona trabajador");
        return;
      }

      addFichaje({
        trabajador: usuario,
        tipo
      });

      refrescar();
    };

    window.borrarFichajeUI = function (id) {
      if (!confirm("¿Borrar fichaje?")) return;
      deleteFichaje(id);
      refrescar();
    };
  }, 0);

  return `
    <div style="max-width:900px;width:100%;">
      <div class="panel-card">
        <h3>Fichajes</h3>

        <div style="display:grid;gap:10px;margin-bottom:20px;">
          <select id="f_usuario" style="${inputStyle()}">
            ${
              personal.length
                ? personal.map(p =>
                    `<option value="${p.nombre}">${p.nombre}</option>`
                  ).join("")
                : `<option value="">Sin trabajadores</option>`
            }
          </select>

          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${btn("Entrada", "entrada", "#16a34a")}
            ${btn("Salida", "salida", "#dc2626")}
            ${btn("Descanso ⏸", "inicio_descanso", "#f59e0b")}
            ${btn("Fin descanso ▶", "fin_descanso", "#92400e")}
            ${btn("Comida 🍽", "inicio_comida", "#2563eb")}
            ${btn("Fin comida ✔", "fin_comida", "#1e3a8a")}
          </div>
        </div>

        <div style="display:grid;gap:10px;">
          ${
            fichajes.length
              ? fichajes.map(f => `
                <div style="padding:10px;border:1px solid #ccc;border-radius:10px;background:#fff;">
                  <b>${f.trabajador}</b><br>
                  ${f.tipo}<br>
                  ${new Date(f.fecha).toLocaleString("es-ES")}
                  <br>
                  <button onclick="borrarFichajeUI('${f.id}')">Borrar</button>
                </div>
              `).join("")
              : "No hay fichajes"
          }
        </div>
      </div>
    </div>
  `;
}

function refrescar() {
  const c = document.getElementById("viewContainer");
  if (c) c.innerHTML = renderFichajes();
}

function btn(texto, tipo, color) {
  return `
    <button onclick="fichar('${tipo}')" style="
      padding:10px;
      border:none;
      border-radius:10px;
      background:${color};
      color:white;
      font-weight:700;
      cursor:pointer;
    ">
      ${texto}
    </button>
  `;
}

function inputStyle() {
  return `
    width:100%;
    height:45px;
    border-radius:10px;
    border:1px solid #ccc;
    padding:5px;
  `;
}