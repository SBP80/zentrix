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
        ${tareas.length ? tareas.map((t) => {
          const estado = getEstadoTarea(t);
          const estilo = getEstiloEstado(estado, t.done);

          return `
            <li style="
              margin-bottom:14px;
              padding:14px;
              border:2px solid ${estilo.borde};
              border-left:10px solid ${estilo.izquierda};
              border-radius:14px;
              background:${estilo.fondo};
            ">
              <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px;">
                
                <div style="display:flex; align-items:flex-start; gap:12px; flex:1;">
                  <input
                    type="checkbox"
                    ${t.done ? "checked" : ""}
                    onclick="toggleTareaUI(${t.id})"
                    style="margin-top:4px; width:18px; height:18px;"
                  />

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
                        background:${estilo.badgeFondo};
                        color:${estilo.badgeTexto};
                      ">
                        ${t.done ? "Completada" : estado}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onclick="borrarTareaUI(${t.id})"
                  style="
                    border:none;
                    background:#dc2626;
                    color:#fff;
                    border-radius:10px;
                    width:40px;
                    height:40px;
                    font-size:18px;
                    cursor:pointer;
                    flex:0 0 auto;
                  "
                >✕</button>

              </div>
            </li>
          `;
        }).join("") : `
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

function getEstadoTarea(t) {
  if (!t.fecha) return "Sin fecha";

  const ahora = new Date();
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

  const [y, m, d] = t.fecha.split("-").map(Number);
  const [hh, mm] = (t.hora || "23:59").split(":").map(Number);

  const fechaTarea = new Date(y, m - 1, d, hh, mm || 0);
  const soloDiaTarea = new Date(y, m - 1, d);

  if (fechaTarea < ahora) return "Vencida";
  if (soloDiaTarea.getTime() === hoy.getTime()) return "Hoy";

  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  if (soloDiaTarea.getTime() === manana.getTime()) return "Mañana";

  return "Próxima";
}

function getEstiloEstado(estado, done) {
  if (done) {
    return {
      fondo: "#f1f5f9",
      borde: "#cbd5e1",
      izquierda: "#64748b",
      badgeFondo: "#cbd5e1",
      badgeTexto: "#334155",
    };
  }

  if (estado === "Vencida") {
    return {
      fondo: "#fff1f2",
      borde: "#fda4af",
      izquierda: "#e11d48",
      badgeFondo: "#e11d48",
      badgeTexto: "#ffffff",
    };
  }

  if (estado === "Hoy") {
    return {
      fondo: "#fff7ed",
      borde: "#fdba74",
      izquierda: "#ea580c",
      badgeFondo: "#ea580c",
      badgeTexto: "#ffffff",
    };
  }

  if (estado === "Mañana") {
    return {
      fondo: "#eff6ff",
      borde: "#93c5fd",
      izquierda: "#2563eb",
      badgeFondo: "#2563eb",
      badgeTexto: "#ffffff",
    };
  }

  if (estado === "Próxima") {
    return {
      fondo: "#f0fdf4",
      borde: "#86efac",
      izquierda: "#16a34a",
      badgeFondo: "#16a34a",
      badgeTexto: "#ffffff",
    };
  }

  return {
    fondo: "#f8fafc",
    borde: "#cbd5e1",
    izquierda: "#64748b",
    badgeFondo: "#64748b",
    badgeTexto: "#ffffff",
  };
}

function formatFecha(fecha) {
  const [y, m, d] = fecha.split("-");
  return \`\${d}/\${m}/\${y}\`;
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
