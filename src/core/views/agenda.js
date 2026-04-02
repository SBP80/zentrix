import {
  getEventos,
  addEvento,
  toggleEvento,
  deleteEvento,
  getAgendaContexto
} from "../agenda.js";

export function renderAgenda() {
  const eventos = getEventos();
  const ctx = getAgendaContexto();

  setTimeout(() => {
    window.crearEventoUI = () => {
      const texto = document.getElementById("nuevaTarea").value;
      const fecha = document.getElementById("fechaTarea").value;
      const hora = document.getElementById("horaTarea").value;
      const tipo = document.getElementById("tipoEvento").value;
      const prioridad = document.getElementById("prioridadEvento").value;
      const asignado = document.getElementById("asignadoEvento").value;
      const objeto = document.getElementById("objetoEvento").value;

      if (!texto) return;

      addEvento({ texto, fecha, hora, tipo, prioridad, asignado, objeto });
      location.reload();
    };

    window.toggleEventoUI = (id) => {
      toggleEvento(id);
      location.reload();
    };

    window.deleteEventoUI = (id) => {
      deleteEvento(id);
      location.reload();
    };
  }, 0);

  return `
    <div class="panel-card">
      <h3>Agenda</h3>

      <div style="display:grid; gap:8px; max-width:420px;">
        <input id="nuevaTarea" placeholder="Nueva tarea..." />
        <input id="fechaTarea" type="date" />
        <input id="horaTarea" type="time" />

        <select id="tipoEvento">
          ${ctx.tipos.map(t => `<option>${t}</option>`).join("")}
        </select>

        <select id="prioridadEvento">
          ${ctx.prioridades.map(p => `<option>${p}</option>`).join("")}
        </select>

        <select id="asignadoEvento">
          ${ctx.personal.map(p => `<option>${p}</option>`).join("")}
        </select>

        <input id="objetoEvento" placeholder="Vehículo / herramienta (opcional)" />

        <button onclick="crearEventoUI()">+ Añadir</button>
      </div>

      <ul style="margin-top:20px; padding:0; list-style:none;">
        ${eventos.map(e => {
          const color = e.prioridad === "Alta" ? "#e53935"
                      : e.prioridad === "Media" ? "#fb8c00"
                      : "#43a047";

          return `
            <li style="
              margin-bottom:12px;
              padding:12px;
              border-left:6px solid ${color};
              border-radius:8px;
              background:#f9f9f9;
            ">
              <div style="display:flex; justify-content:space-between;">
                <div>
                  <input type="checkbox"
                    ${e.done ? "checked" : ""}
                    onclick="toggleEventoUI(${e.id})"
                  />

                  <strong>${e.texto}</strong><br>

                  <small>
                    ${e.fecha || ""} ${e.hora || ""} |
                    ${e.tipo} |
                    ${e.asignado}
                  </small>

                  ${e.objeto ? `<div><small>${e.objeto}</small></div>` : ""}
                </div>

                <button onclick="deleteEventoUI(${e.id})">❌</button>
              </div>
            </li>
          `;
        }).join("")}
      </ul>
    </div>
  `;
}
