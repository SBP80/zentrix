import { getTareas, addTarea, toggleTarea, deleteTarea } from "../agenda.js";

export function renderAgenda() {
  const tareas = getTareas();

  return `
    <div class="panel-card">
      <h3>Agenda</h3>

      <div style="display:grid; gap:10px; max-width:420px;">
        <input id="nuevaTarea" placeholder="Nueva tarea..." />
        <input id="fechaTarea" type="date" />
        <input id="horaTarea" type="time" />
        <button onclick="crearTarea()">+ Añadir</button>
      </div>

      <ul style="margin-top:20px;">
        ${tareas.map((t) => `
          <li style="margin-bottom:10px;">
            <input type="checkbox" ${t.done ? "checked" : ""} onclick="toggleTareaUI(${t.id})">
            ${t.done ? "<s>" + t.texto + "</s>" : t.texto}
            ${t.fecha ? " | " + t.fecha : ""}
            ${t.hora ? " | " + t.hora : ""}
            <button onclick="borrarTareaUI(${t.id})">❌</button>
          </li>
        `).join("")}
      </ul>
    </div>
  `;
}

function refrescarAgenda() {
  const container = document.getElementById("viewContainer");
  if (!container) return;
  container.innerHTML = renderAgenda();
}

window.crearTarea = function () {
  const input = document.getElementById("nuevaTarea");
  const fecha = document.getElementById("fechaTarea");
  const hora = document.getElementById("horaTarea");

  if (!input) return;

  const texto = input.value.trim();
  if (!texto) return;

  addTarea(
    texto,
    fecha ? fecha.value : "",
    hora ? hora.value : ""
  );

  refrescarAgenda();
};

window.toggleTareaUI = function (id) {
  toggleTarea(id);
  refrescarAgenda();
};

window.borrarTareaUI = function (id) {
  deleteTarea(id);
  refrescarAgenda();
};
