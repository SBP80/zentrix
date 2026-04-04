import { db } from "../db.js";

export function renderPersonal() {
  const trabajadores = db.personal.getAll();

  setTimeout(() => {
    document.getElementById("btn_add")?.addEventListener("click", () => {
      const nombre = document.getElementById("nombre").value.trim();
      const rol = document.getElementById("rol").value;

      if (!nombre) return alert("Nombre obligatorio");

      db.personal.create({
        nombre,
        rol
      });

      refrescar();
    });

    document.querySelectorAll(".btn_delete").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        db.personal.remove(id);
        refrescar();
      });
    });
  }, 0);

  return `
    <div style="max-width:900px;">
      
      <h2>Personal</h2>
      <p style="color:#64748b;">Equipo, roles y permisos.</p>

      <div style="display:flex;gap:10px;margin:20px 0;">
        <input id="nombre" placeholder="Nombre" style="padding:10px;border-radius:8px;border:1px solid #ccc;">
        
        <select id="rol" style="padding:10px;border-radius:8px;border:1px solid #ccc;">
          <option value="admin">Admin</option>
          <option value="encargado">Encargado</option>
          <option value="operario">Operario</option>
        </select>

        <button id="btn_add" style="
          padding:10px 16px;
          background:#2563eb;
          color:white;
          border:none;
          border-radius:8px;
          cursor:pointer;
        ">Añadir</button>
      </div>

      <div>
        ${
          trabajadores.length
            ? trabajadores.map(t => `
              <div style="
                display:flex;
                justify-content:space-between;
                padding:10px;
                margin-bottom:8px;
                background:#f1f5f9;
                border-radius:8px;
              ">
                <div>${t.nombre} - ${t.rol || "sin rol"}</div>
                <button class="btn_delete" data-id="${t.id}" style="
                  background:#dc2626;
                  color:white;
                  border:none;
                  border-radius:6px;
                  padding:4px 8px;
                  cursor:pointer;
                ">X</button>
              </div>
            `).join("")
            : "<div style='color:#64748b;'>Sin trabajadores</div>"
        }
      </div>

    </div>
  `;
}

function refrescar() {
  const container = document.getElementById("viewContainer");
  if (!container) return;
  container.innerHTML = renderPersonal();
}
