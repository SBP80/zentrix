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

      <div style="display:grid; gap:10px; max-width:460px; margin-bottom:18px;">
        <input id="nuevaTarea" placeholder="Nueva tarea..." />
        <input id="fechaTarea" type="date" />
        <input id="horaTarea" type="time" />
        <button onclick="crearTarea()">+ Añadir</button>
      </div>

      <ul style="margin:0; padding:0; list-style:none;">
        ${tareas.length ? tareas.map((t) => `
          <li style="
            margin-bottom:14px;
            padding:14px;
            border:2px solid #2563eb;
            border-left:10px solid ${getColorBorde(t)};
            border-radius:14px;
            background:#ffffff;
            box-shadow:0 6px 16px rgba(15,23,42,0.08);
          ">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px;">
              <div style="display:flex; align-items:flex-start; gap:12px; flex:1;">
                <input
                  type="checkbox"
                  ${t.done ? "checked" : ""}
                  onclick="toggleTareaUI(${t.id})"
                  style="margin-top:5px; width:18px; height:18px;"
                >

                <div style="min-width:0; flex:1;">
                  <div style="
                    font-size:18px;
                    font-weight:700;
                    color:#0f172a;
                    word-break:break-word;
                  ">
                    ${t.done ? "<s>" + escapeHtml(t.texto) + "</s>" : escapeHtml(t.texto)}
                  </div>

                  <div style="
                    margin-top:6px;
                    font-size:14px;
                    color:#475569;
                  ">
                    ${t.fecha ? formatFecha(t.fecha) : "Sin fecha"}${t.hora ? " · " + t.hora : ""}
                  </div>

                  <div style="margin-top:10px;">
                    <span style="
                      display:inline-block;
                      padding:6px 10px;
                      border-radius:999px;
                      font-size:12px;
                      font-weight:700;
                      background:${getColorBorde(t)};
                      color:#ffffff;
                    ">
                      ${getEstadoTexto(t)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onclick="borrarTareaUI(${t.id})"
                style="
                  border:none;
                  background:#dc2626;
                  color:#ffffff;
                  border-radius:10px;
                  width:40px;
                  height:40px;
                  font-size:18px;
                  font-weight:700;
                  cursor:pointer;
                  flex:0 0 auto;
                "
              >✕</button>
            </div>
          </li>
        `).join("") : `
          <li style="
            padding:14px;
            border:1px dashed #cbd5e1;
            border-radius:12px;
            color:#64748b;
            background:#f8fafc;
          ">
            No hay tareas todavía.
          </li>
        `}
      </ul>
    </div>
  `;
}

function getEstadoTexto(t) {
  if (t.done) return "Hecha";
  if (!t.fecha) return "Sin fecha";

  const hoy = new Date().toISOString().split("T")[0];

  if (t.fecha < hoy) return "Atrasada";
  if (t.fecha === hoy) return "Hoy";
  return "Próxima";
}

function getColorBorde(t) {
  if (t.done) return "#64748b";
  if (!t.fecha) return "#6b7280";

  const hoy = new Date().toISOString().split("T")[0];

  if (t.fecha < hoy) return "#dc2626";
  if (t.fecha === hoy) return "#d97706";
  return "#16a34a";
}

function formatFecha(fecha) {
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
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
