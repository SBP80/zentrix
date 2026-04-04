import {
  getPersonal,
  addTrabajador,
  deleteTrabajador,
  updateTrabajador
} from "../data/personal.js";

import {
  getAusencias,
  addAusencia,
  deleteAusencia,
  updateAusencia
} from "../data/ausencias.js";

// ====== UI ======
export function renderPersonal(container) {
  const lista = getPersonal();

  container.innerHTML = `
    <h2>Personal</h2>
    <p>Equipo, roles y permisos.</p>

    <div class="card">
      <input id="nombre" placeholder="Nombre trabajador">
      <button id="crear">+ Añadir</button>
    </div>

    ${lista.map(t => renderTrabajador(t)).join("")}
  `;

  // crear trabajador
  document.getElementById("crear").onclick = () => {
    const nombre = document.getElementById("nombre").value.trim();
    if (!nombre) return;
    addTrabajador({ nombre });
    renderPersonal(container);
  };

  // eventos globales
  container.querySelectorAll(".delete-trabajador").forEach(btn => {
    btn.onclick = () => {
      deleteTrabajador(btn.dataset.id);
      renderPersonal(container);
    };
  });

  container.querySelectorAll(".add-ausencia").forEach(btn => {
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

  container.querySelectorAll(".delete-ausencia").forEach(btn => {
    btn.onclick = () => {
      deleteAusencia(btn.dataset.id);
      renderPersonal(container);
    };
  });

  container.querySelectorAll(".edit-ausencia").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const a = getAusencias().find(x => x.id == id);

      const nuevoTipo = prompt("Tipo", a.tipo);
      const nuevoInicio = prompt("Inicio (yyyy-mm-dd)", a.inicio);
      const nuevoFin = prompt("Fin (yyyy-mm-dd)", a.fin);
      const nuevoComentario = prompt("Comentario", a.comentario || "");
      const nuevoEstado = prompt("Estado (pendiente/aprobada/rechazada)", a.estado);

      updateAusencia(id, {
        ...a,
        tipo: nuevoTipo,
        inicio: nuevoInicio,
        fin: nuevoFin,
        comentario: nuevoComentario,
        estado: nuevoEstado
      });

      renderPersonal(container);
    };
  });
}

// ====== TRABAJADOR ======
function renderTrabajador(t) {
  const ausencias = getAusencias().filter(a => a.trabajadorId == t.id);

  const resumen = calcularResumen(ausencias);

  return `
    <div class="card">
      <h3>${t.nombre}</h3>

      <div>
        Vacaciones: ${resumen.vacaciones.usadas} usadas / ${resumen.vacaciones.total}
        Moscosos: ${resumen.moscosos.usados} usados / ${resumen.moscosos.total}
      </div>

      <button class="delete-trabajador" data-id="${t.id}">Eliminar</button>

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

      <button class="add-ausencia" data-id="${t.id}">
        + Añadir ausencia
      </button>

      ${ausencias.map(a => renderAusencia(a)).join("")}
    </div>
  `;
}

// ====== AUSENCIA ======
function renderAusencia(a) {
  return `
    <div class="ausencia">
      <b>${a.tipo}</b>
      (${a.inicio} → ${a.fin})
      [${a.estado}]
      <button class="edit-ausencia" data-id="${a.id}">Editar</button>
      <button class="delete-ausencia" data-id="${a.id}">X</button>
    </div>
  `;
}

// ====== CÁLCULO ======
function calcularResumen(ausencias) {
  let vacUsadas = 0;
  let moscoUsados = 0;

  ausencias.forEach(a => {
    if (a.estado !== "aprobada") return;

    const dias = diasEntre(a.inicio, a.fin);

    if (a.tipo === "Vacaciones") vacUsadas += dias;
    if (a.tipo === "Moscoso") moscoUsados += dias;
  });

  return {
    vacaciones: { usadas: vacUsadas, total: 30 },
    moscosos: { usados: moscoUsados, total: 2 }
  };
}

function diasEntre(inicio, fin) {
  const d1 = new Date(inicio);
  const d2 = new Date(fin);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
}
