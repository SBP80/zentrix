import {
  getPersonal,
  addTrabajador,
  deleteTrabajador
} from "../data/personal.js";

import {
  getAusencias,
  addAusencia,
  deleteAusencia
} from "../data/ausencias.js";

export function renderPersonal(container) {
  const trabajadores = getPersonal();
  const ausencias = getAusencias();

  container.innerHTML = `
    <h2>Personal</h2>
    <p>Equipo, roles y permisos.</p>

    <div style="margin-bottom:20px;">
      <input id="nuevo-nombre" placeholder="Nombre trabajador">
      <button id="btn-add">+ Añadir trabajador</button>
    </div>

    ${trabajadores.map(t => renderTrabajador(t, ausencias)).join("")}
  `;

  // Añadir trabajador
  document.getElementById("btn-add").onclick = () => {
    const nombre = document.getElementById("nuevo-nombre").value.trim();
    if (!nombre) return;

    addTrabajador({ nombre });
    renderPersonal(container);
  };

  // Eliminar trabajador
  container.querySelectorAll(".btn-delete-trabajador").forEach(btn => {
    btn.onclick = () => {
      deleteTrabajador(btn.dataset.id);
      renderPersonal(container);
    };
  });

  // Añadir ausencia
  container.querySelectorAll(".btn-add-ausencia").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;

      const tipo = document.getElementById(`tipo-${id}`).value;
      const inicio = document.getElementById(`inicio-${id}`).value;
      const fin = document.getElementById(`fin-${id}`).value;
      const comentario = document.getElementById(`coment-${id}`).value;

      if (!inicio || !fin) return;

      addAusencia({
        trabajadorId: id,
        tipo,
        inicio,
        fin,
        comentario,
        estado: "pendiente"
      });

      renderPersonal(container);
    };
  });

  // Eliminar ausencia
  container.querySelectorAll(".btn-delete-ausencia").forEach(btn => {
    btn.onclick = () => {
      deleteAusencia(btn.dataset.id);
      renderPersonal(container);
    };
  });
}

// ===== Render trabajador =====
function renderTrabajador(t, ausencias) {
  const lista = ausencias.filter(a => a.trabajadorId == t.id);

  return `
    <div style="border:1px solid #ccc; padding:15px; margin-bottom:20px;">
      <h3>${t.nombre}</h3>

      <button class="btn-delete-trabajador" data-id="${t.id}">
        Eliminar trabajador
      </button>

      <h4>Ausencias</h4>

      <select id="tipo-${t.id}">
        <option>Vacaciones</option>
        <option>Moscoso</option>
        <option>Baja</option>
        <option>Permiso</option>
      </select>

      <input type="date" id="inicio-${t.id}">
      <input type="date" id="fin-${t.id}">
      <input id="coment-${t.id}" placeholder="Comentario">

      <button class="btn-add-ausencia" data-id="${t.id}">
        + Añadir ausencia
      </button>

      ${lista.map(a => renderAusencia(a)).join("")}
    </div>
  `;
}

// ===== Render ausencia =====
function renderAusencia(a) {
  return `
    <div style="margin-top:10px; padding:10px; border:1px solid #ddd;">
      <b>${a.tipo}</b>
      (${a.inicio} → ${a.fin})
      [${a.estado}]

      <button class="btn-delete-ausencia" data-id="${a.id}">
        X
      </button>
    </div>
  `;
}
