import {
  getPersonal,
  addTrabajador,
  deleteTrabajador,
  updateTrabajador
} from "../data/personal.js";

import {
  getAusenciasByTrabajador,
  addAusencia,
  deleteAusencia,
  updateAusencia
} from "../data/ausencias.js";

export function renderPersonal(container) {
  const personal = getPersonal();

  container.innerHTML = `
    <div class="card">
      <h2>Personal</h2>
      <p>Equipo, roles y permisos.</p>
    </div>

    <div class="card">
      <h3>Trabajadores</h3>
      <button id="btnNuevo">+ Nuevo trabajador</button>
      <div id="listaPersonal"></div>
    </div>
  `;

  const lista = container.querySelector("#listaPersonal");

  lista.innerHTML = personal.map(t => `
    <div class="card" style="margin-top:10px;">
      <b>${t.nombre || "Sin nombre"}</b><br>
      ${t.usuario || ""}<br>
      ${t.telefono || ""}

      <div style="margin-top:10px;">
        <button class="btnAusencias" data-id="${t.id}">Ausencias</button>
        <button class="btnEliminar" data-id="${t.id}">Eliminar</button>
      </div>

      <div id="ausencias-${t.id}" style="margin-top:10px;"></div>
    </div>
  `).join("");

  // eventos eliminar
  lista.querySelectorAll(".btnEliminar").forEach(btn => {
    btn.onclick = () => {
      if (!confirm("Eliminar trabajador")) return;
      deleteTrabajador(btn.dataset.id);
      renderPersonal(container);
    };
  });

  // eventos ausencias
  lista.querySelectorAll(".btnAusencias").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const box = container.querySelector(`#ausencias-${id}`);
      renderAusencias(box, id);
    };
  });
}

function renderAusencias(container, trabajadorId) {
  const lista = getAusenciasByTrabajador(trabajadorId);

  container.innerHTML = `
    <div class="card">
      <h4>Ausencias</h4>

      <select id="tipo">
        <option value="vacaciones">Vacaciones</option>
        <option value="moscoso">Moscoso</option>
        <option value="baja">Baja</option>
      </select>

      <input type="date" id="inicio">
      <input type="date" id="fin">
      <button id="add">Añadir</button>

      <div id="listaAusencias"></div>
    </div>
  `;

  const listaBox = container.querySelector("#listaAusencias");

  function pintar() {
    const data = getAusenciasByTrabajador(trabajadorId);

    listaBox.innerHTML = data.map(a => `
      <div style="margin-top:8px;">
        ${a.tipo} | ${a.fechaInicio} - ${a.fechaFin}
        <button data-id="${a.id}" class="del">X</button>
      </div>
    `).join("");

    listaBox.querySelectorAll(".del").forEach(b => {
      b.onclick = () => {
        deleteAusencia(b.dataset.id);
        pintar();
      };
    });
  }

  container.querySelector("#add").onclick = () => {
    const tipo = container.querySelector("#tipo").value;
    const inicio = container.querySelector("#inicio").value;
    const fin = container.querySelector("#fin").value;

    if (!inicio || !fin) return alert("Fechas obligatorias");

    addAusencia({
      trabajadorId,
      tipo,
      fechaInicio: inicio,
      fechaFin: fin
    });

    pintar();
  };

  pintar();
}
