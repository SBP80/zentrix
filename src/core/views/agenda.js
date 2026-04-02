import { getTareas, addTarea, toggleTarea, deleteTarea } from "../agenda.js";

export function renderAgenda() {
  const tareas = getTareas();

  return `
    <div class="panel-card">
      <h3>Agenda</h3>

      <input id="nuevaTarea" placeholder="Nueva tarea..." />
      <button onclick="crearTarea()">+ Añadir</button>

      <ul style="margin-top:20px;">
        ${tareas.map(t => `
          <li>
            <input type="checkbox" ${t.done ? "checked" : ""} onclick="toggle(${t.id})">
            ${t.done ? "<s>" + t.texto + "</s>" : t.texto}
            <button onclick="borrar(${t.id})">❌</button>
          </li>
        `).join("")}
      </ul>
    </div>
  `;
}

window.crearTarea = function () {
  const input = document.getElementById("nuevaTarea");
  if (!input.value) return;
  addTarea(input.value);
  location.reload();
};

window.toggle = function (id) {
  toggleTarea(id);
  location.reload();
};

window.borrar = function (id) {
  deleteTarea(id);
  location.reload();
};
