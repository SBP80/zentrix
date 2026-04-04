import { db } from "../db.js";

export function renderPersonal() {
  const trabajadores = db.personal.getAll();

  setTimeout(() => activarEventos(), 0);

  return `
    <div style="max-width:1200px;width:100%;">
      <div class="panel-card">
        <h3 style="margin-top:0;">Personal</h3>
        <p style="color:#64748b;margin-bottom:18px;">
          Equipo, roles y permisos.
        </p>

        <div style="margin-bottom:20px;">
          <input id="nombre" placeholder="Nombre"
            style="padding:10px;width:200px;margin-right:10px;">
          <select id="rol" style="padding:10px;">
            <option value="admin">Admin</option>
            <option value="encargado">Encargado</option>
            <option value="operario">Operario</option>
          </select>
          <button id="add"
            style="margin-left:10px;padding:10px 16px;background:#2563eb;color:#fff;border:none;border-radius:6px;">
            Añadir
          </button>
        </div>

        <div>
          ${trabajadores.map(t => `
            <div style="padding:12px;border-bottom:1px solid #ddd;display:flex;justify-content:space-between;">
              <div>
                <b>${t.nombre}</b> - ${t.rol}
              </div>
              <button data-id="${t.id}" class="del"
                style="background:#ef4444;color:#fff;border:none;padding:6px 10px;border-radius:4px;">
                X
              </button>
            </div>
          `).join("")}
        </div>

      </div>
    </div>
  `;
}

function activarEventos() {
  const btn = document.getElementById("add");
  if (btn) {
    btn.onclick = () => {
      const nombre = document.getElementById("nombre").value;
      const rol = document.getElementById("rol").value;

      if (!nombre) return;

      db.personal.add({
        id: Date.now().toString(),
        nombre,
        rol
      });

      location.reload();
    };
  }

  document.querySelectorAll(".del").forEach(b => {
    b.onclick = () => {
      db.personal.delete(b.dataset.id);
      location.reload();
    };
  });
}
