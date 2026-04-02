import { getTareas, addTarea, toggleTarea, deleteTarea } from "../agenda.js";

export function renderAgenda() {
  const tareas = getTareas().sort((a, b) => {
    const fechaA = (a.fecha || "9999-12-31") + " " + (a.hora || "23:59");
    const fechaB = (b.fecha || "9999-12-31") + " " + (b.hora || "23:59");
    return fechaA.localeCompare(fechaB);
  });

  return `
    <div class="panel-card">
      <h3>Agenda</h3>

      <div style="display:grid; gap:10px; max-width:420px;">
        <input id="nuevaTarea" placeholder="Nueva tarea..." />
        <input id="fechaTarea" type="date" />
        <input id="horaTarea" type="time" />
        <button onclick="crearTarea()">+ Añadir</button>
      </div>

      <ul style="margin-top:20px; padding-left:0;">
        ${tareas.length ? tareas.map((t) => `
          <li style="
            margin-bottom:12px;
            padding:10px;
            border-radius:10px;
            list-style:none;
            background:${getColorFondo(t)};
            border-left:6px solid ${getColorBorde(t)};
            border:1px solid #d8e1eb;
          ">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
              <div style="display:flex; align-items:flex-start; gap:10px;">
                <input
                  type="checkbox"
                  ${t.done ? "checked" : ""}
                  onclick="toggleTareaUI(${t.id})"
                >

                <div>
                  <div style="font-weight:600;">
                    ${t.done ? "<s>" + escapeHtml(t.texto) + "</s>" : escapeHtml(t.texto)}
                  </div>

                  <div style="font-size:13px; color:#5f7084; margin-top:4px;">
                    ${t.fecha ? t.fecha : "Sin fecha"}${t.hora ? " · " + t.hora : ""}
                  </div>
                </div>
              </div>

              <button onclick="borrarTareaUI(${t.id})">❌</button>
            </div>
          </li>
        `).join("") : `
          <li style="
            margin-bottom:12px;
            padding:10px;
            border-radius:10px;
            list-style:none;
            background:#f8fafc;
            border:1px dashed #cbd5e1;
            color:#64748b;
          ">
            No hay tareas todavía.
          </li>
        `}
      </ul>
    </div>
  `;
}

function getColorFondo(t) {
  if (t.done) return "#f3f4f6";
  if (!t.fecha) return "#f3f4f6";

  const hoy = new Date().toISOString().split("T")[0];

  if (t.fecha < hoy) return "#fee2e2";
  if (t.fecha === hoy) return "#fef9c3";
  return "#dcfce7";
}

function getColorBorde(t) {
  if (t.done) return "#9ca3af";
  if (!t.fecha) return "#9ca3af";

  const hoy = new Date().toISOString().split("T")[0];

  if (t.fecha < hoy) return "#dc2626";
  if (t.fecha === hoy) return "#ca8a04";
  return "#16a34a";
}

function escapeHtml(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

  input.value = "";
  if (fecha) fecha.value = "";
  if (hora) hora.value = "";

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
