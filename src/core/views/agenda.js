import { getTareas, addTarea, toggleTarea, deleteTarea } from "../agenda.js";

export function renderAgenda() {
  const tareas = getTareas().sort((a, b) => {
    const fechaA = (a.fecha || "9999-12-31") + (a.hora || "23:59");
    const fechaB = (b.fecha || "9999-12-31") + (b.hora || "23:59");
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
        ${tareas.length ? tareas.map((t) => {
          const estado = getEstadoTarea(t);
          const estilo = getEstiloEstado(estado, t.done);

          return `
            <li style="
              margin-bottom:12px;
              padding:12px;
              border:1px solid ${estilo.borde};
              border-left:6px solid ${estilo.izquierda};
              border-radius:12px;
              list-style:none;
              background:${estilo.fondo};
            ">
              <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px;">
                <div style="display:flex; align-items:flex-start; gap:10px; flex:1;">
                  <input
                    type="checkbox"
                    ${t.done ? "checked" : ""}
                    onclick="toggleTareaUI(${t.id})"
                    style="margin-top:4px;"
                  />

                  <div style="min-width:0;">
                    <div style="font-weight:700; color:#0f172a; word-break:break-word;">
                      ${t.done ? "<s>" + escapeHtml(t.texto) + "</s>" : escapeHtml(t.texto)}
                    </div>

                    <div style="font-size:13px; color:#5f7084; margin-top:5px;">
                      ${t.fecha ? formatFecha(t.fecha) : "Sin fecha"}${t.hora ? " · " + t.hora : ""}
                    </div>

                    <div style="
                      display:inline-block;
                      margin-top:8px;
                      padding:4px 8px;
                      border-radius:999px;
                      font-size:12px;
                      font-weight:700;
                      background:${estilo.badgeFondo};
                      color:${estilo.badgeTexto};
                    ">
                      ${t.done ? "Completada" : estado}
                    </div>
                  </div>
                </div>

                <button
                  onclick="borrarTareaUI(${t.id})"
                  style="
                    border:none;
                    background:#fee2e2;
                    color:#b91c1c;
                    border-radius:10px;
                    width:36px;
                    height:36px;
                    cursor:pointer;
                    flex:0 0 auto;
                  "
                >✕</button>
              </div>
            </li>
          `;
        }).join("") : `
          <li style="
            list-style:none;
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
      fondo: "#f8fafc",
      borde: "#cbd5e1",
      izquierda: "#94a3b8",
      badgeFondo: "#e2e8f0",
      badgeTexto: "#475569",
    };
  }

  if (estado === "Vencida") {
    return {
      fondo: "#fff1f2",
      borde: "#fecdd3",
      izquierda: "#e11d48",
      badgeFondo: "#ffe4e6",
      badgeTexto: "#be123c",
    };
  }

  if (estado === "Hoy") {
    return {
      fondo: "#fff7ed",
      borde: "#fed7aa",
      izquierda: "#ea580c",
      badgeFondo: "#ffedd5",
      badgeTexto: "#c2410c",
    };
  }

  if (estado === "Mañana") {
    return {
      fondo: "#eff6ff",
      borde: "#bfdbfe",
      izquierda: "#2563eb",
      badgeFondo: "#dbeafe",
      badgeTexto: "#1d4ed8",
    };
  }

  if (estado === "Próxima") {
    return {
      fondo: "#f0fdf4",
      borde: "#bbf7d0",
      izquierda: "#16a34a",
      badgeFondo: "#dcfce7",
      badgeTexto: "#15803d",
    };
  }

  return {
    fondo: "#f8fafc",
    borde: "#cbd5e1",
    izquierda: "#64748b",
    badgeFondo: "#e2e8f0",
    badgeTexto: "#475569",
  };
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
