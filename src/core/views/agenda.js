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
            <input type="checkbox" ${t.done ? "checked" : ""} onclick="toggleTareaUI(${t.id})">
            ${t.done ? "<s>" + t.texto + "</s>" : t.texto}
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
  if (!input) return;

  const texto = input.value.trim();
  if (!texto) return;

  addTarea(texto);
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
