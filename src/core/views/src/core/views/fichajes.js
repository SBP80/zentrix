import { addFichaje, getFichajes } from "../fichajes.js";
import { db } from "../db.js";

export function renderFichajes() {
  const personal = db.personal.getAll();
  const fichajes = getFichajes().slice().reverse();

  setTimeout(() => {
    window.ficharEntrada = function () {
      const usuario = document.getElementById("f_usuario")?.value;
      if (!usuario) return alert("Selecciona trabajador");

      addFichaje({
        trabajador: usuario,
        tipo: "entrada"
      });

      refrescar();
    };

    window.ficharSalida = function () {
      const usuario = document.getElementById("f_usuario")?.value;
      if (!usuario) return alert("Selecciona trabajador");

      addFichaje({
        trabajador: usuario,
        tipo: "salida"
      });

      refrescar();
    };
  }, 0);

  return `
    <div style="max-width:900px;width:100%;">
      <div class="panel-card">
        <h3>Fichajes</h3>

        <select id="f_usuario" style="width:100%;margin-bottom:10px;">
          ${personal.map(p => `<option>${p.nombre}</option>`).join("")}
        </select>

        <div style="display:flex;gap:10px;margin-bottom:20px;">
          <button onclick="ficharEntrada()" style="${btn("#16a34a")}">Entrada</button>
          <button onclick="ficharSalida()" style="${btn("#dc2626")}">Salida</button>
        </div>

        <div style="display:grid;gap:8px;">
          ${
            fichajes.map(f => `
              <div style="padding:10px;border:1px solid #e2e8f0;border-radius:10px;">
                <b>${f.trabajador}</b> · ${f.tipo.toUpperCase()}<br>
                ${new Date(f.fecha).toLocaleString("es-ES")}
              </div>
            `).join("")
          }
        </div>
      </div>
    </div>
  `;
}

function refrescar() {
  const c = document.getElementById("viewContainer");
  c.innerHTML = renderFichajes();
}

function btn(color) {
  return `
    flex:1;
    padding:12px;
    border:none;
    border-radius:12px;
    background:${color};
    color:#fff;
    font-weight:700;
  `;
}