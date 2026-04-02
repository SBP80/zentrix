import { getTareas, addTarea, toggleTarea, deleteTarea } from "../agenda.js";

export function renderAgenda() {
  const tareas = getTareas().sort((a, b) => {
    const fechaA = (a.fecha || "9999-12-31") + " " + (a.hora || "23:59");
    const fechaB = (b.fecha || "9999-12-31") + " " + (b.hora || "23:59");
    return fechaA.localeCompare(fechaB);
  });

  return `
    <div style="max-width:760px;">
      <div class="panel-card">
        <h3 style="margin:0 0 18px 0;">Agenda</h3>

        <div style="
          display:grid;
          gap:12px;
          max-width:520px;
          width:100%;
          margin-bottom:22px;
        ">
          <div>
            <label for="nuevaTarea" style="
              display:block;
              margin-bottom:6px;
              font-size:14px;
              font-weight:700;
              color:#0f172a;
            ">Tarea</label>

            <input
              id="nuevaTarea"
              placeholder="Escribe la tarea"
              style="
                width:100%;
                height:48px;
                padding:0 14px;
                border:1px solid #cbd5e1;
                border-radius:12px;
                background:#ffffff;
                color:#0f172a;
                font-size:16px;
              "
            />
          </div>

          <div>
            <label for="fechaTarea" style="
              display:block;
              margin-bottom:6px;
              font-size:14px;
              font-weight:700;
              color:#0f172a;
            ">Fecha</label>

            <input
              id="fechaTarea"
              type="date"
              style="
                width:100%;
                height:48px;
                padding:0 14px;
                border:1px solid #cbd5e1;
                border-radius:12px;
                background:#ffffff;
                color:#0f172a;
                font-size:16px;
              "
            />
          </div>

          <div>
            <label for="horaTarea" style="
              display:block;
              margin-bottom:6px;
              font-size:14px;
              font-weight:700;
              color:#0f172a;
            ">Hora</label>

            <input
              id="horaTarea"
              type="time"
              style="
                width:100%;
                height:48px;
                padding:0 14px;
                border:1px solid #cbd5e1;
                border-radius:12px;
                background:#ffffff;
                color:#0f172a;
                font-size:16px;
              "
            />
          </div>

          <button
            onclick="crearTarea()"
            style="
              height:48px;
              border:none;
              border-radius:12px;
              background:#2563eb;
              color:#ffffff;
              font-size:17px;
              font-weight:700;
              cursor:pointer;
            "
          >+ Añadir</button>
        </div>

        <div style="
          display:grid;
          gap:14px;
        ">
          ${tareas.length ? tareas.map((t) => `
            <div style="
              width:100%;
              padding:14px;
              border:1px solid #d8e1eb;
              border-left:8px solid ${getColorBorde(t)};
              border-radius:14px;
              background:#ffffff;
              box-shadow:0 4px 12px rgba(15,23,42,0.06);
            ">
              <div style="
                display:flex;
                align-items:flex-start;
                justify-content:space-between;
                gap:12px;
              ">
                <div style="
                  display:flex;
                  align-items:flex-start;
                  gap:12px;
                  flex:1;
                  min-width:0;
                ">
                  <input
                    type="checkbox"
                    ${t.done ? "checked" : ""}
                    onclick="toggleTareaUI(${t.id})"
                    style="
                      width:20px;
                      height:20px;
                      margin-top:3px;
                      flex:0 0 auto;
                    "
                  >

                  <div style="min-width:0; flex:1;">
                    <div style="
                      font-size:16px;
                      font-weight:700;
                      color:#0f172a;
                      line-height:1.35;
                      word-break:break-word;
                    ">
                      ${t.done ? "<s>" + escapeHtml(t.texto) + "</s>" : escapeHtml(t.texto)}
                    </div>

                    <div style="
                      margin-top:6px;
                      font-size:14px;
                      color:#64748b;
                    ">
                      ${t.fecha ? formatFecha(t.fecha) : "Sin fecha"}${t.hora ? " · " + t.hora : ""}
                    </div>

                    <div style="margin-top:10px;">
                      <span style="
                        display:inline-block;
                        padding:6px 10px;
                        border-radius:999px;
                        background:${getColorBorde(t)};
                        color:#ffffff;
                        font-size:12px;
                        font-weight:700;
                      ">
                        ${getEstadoTexto(t)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onclick="borrarTareaUI(${t.id})"
                  style="
                    width:42px;
                    height:42px;
                    border:none;
                    border-radius:12px;
                    background:#dc2626;
                    color:#ffffff;
                    font-size:20px;
                    font-weight:700;
                    cursor:pointer;
                    flex:0 0 auto;
                  "
                >✕</button>
              </div>
            </div>
          `).join("") : `
            <div style="
              padding:16px;
              border:1px dashed #cbd5e1;
              border-radius:14px;
              background:#f8fafc;
              color:#64748b;
            ">
              No hay tareas todavía.
            </div>
          `}
        </div>
      </div>
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
