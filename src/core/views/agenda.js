import {
  getEventos,
  addEvento,
  toggleEvento,
  deleteEvento,
  getAgendaContexto
} from "../agenda.js";

export function renderAgenda() {
  const eventos = getEventos();
  const contexto = getAgendaContexto();

  setTimeout(() => {
    window.crearEventoUI = function () {
      const titulo = document.getElementById("agendaTitulo")?.value.trim() || "";
      const fecha = document.getElementById("agendaFecha")?.value || "";
      const hora = document.getElementById("agendaHora")?.value || "";
      const tipo = document.getElementById("agendaTipo")?.value || "Trabajo";
      const prioridad = document.getElementById("agendaPrioridad")?.value || "Media";
      const usuario = document.getElementById("agendaUsuario")?.value || "Operario 1";
      const extra = document.getElementById("agendaExtra")?.value.trim() || "";

      if (!titulo || !fecha) return;

      addEvento({
        titulo,
        fecha,
        hora,
        tipo,
        prioridad,
        usuario,
        extra
      });

      refrescarAgenda();
    };

    window.toggleEventoUI = function (id) {
      toggleEvento(id);
      refrescarAgenda();
    };

    window.deleteEventoUI = function (id) {
      deleteEvento(id);
      refrescarAgenda();
    };
  }, 0);

  return `
    <div style="max-width:900px; width:100%;">
      <div class="panel-card">
        <h3 style="margin-top:0;">Agenda</h3>

        <div style="
          display:grid;
          gap:12px;
          grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));
          margin-bottom:20px;
        ">
          <div>
            <label style="${labelStyle()}" for="agendaTitulo">Nueva tarea</label>
            <input id="agendaTitulo" placeholder="Escribe la tarea" style="${inputStyle()}" />
          </div>

          <div>
            <label style="${labelStyle()}" for="agendaFecha">Fecha</label>
            <input id="agendaFecha" type="date" style="${inputStyle()}" />
          </div>

          <div>
            <label style="${labelStyle()}" for="agendaHora">Hora</label>
            <input id="agendaHora" type="time" style="${inputStyle()}" />
          </div>

          <div>
            <label style="${labelStyle()}" for="agendaTipo">Tipo</label>
            <select id="agendaTipo" style="${inputStyle()}">
              ${contexto.tipos.map((tipo) => `<option value="${escapeHtml(tipo)}">${escapeHtml(tipo)}</option>`).join("")}
            </select>
          </div>

          <div>
            <label style="${labelStyle()}" for="agendaPrioridad">Prioridad</label>
            <select id="agendaPrioridad" style="${inputStyle()}">
              ${contexto.prioridades.map((prioridad) => `<option value="${escapeHtml(prioridad)}">${escapeHtml(prioridad)}</option>`).join("")}
            </select>
          </div>

          <div>
            <label style="${labelStyle()}" for="agendaUsuario">Usuario</label>
            <select id="agendaUsuario" style="${inputStyle()}">
              ${contexto.usuarios.map((usuario) => `<option value="${escapeHtml(usuario)}">${escapeHtml(usuario)}</option>`).join("")}
            </select>
          </div>

          <div style="grid-column:1 / -1;">
            <label style="${labelStyle()}" for="agendaExtra">Vehículo / herramienta / nota corta</label>
            <input id="agendaExtra" placeholder="Opcional" style="${inputStyle()}" />
          </div>
        </div>

        <button
          type="button"
          onclick="crearEventoUI()"
          style="
            height:48px;
            padding:0 18px;
            border:none;
            border-radius:12px;
            background:#2563eb;
            color:#fff;
            font-size:16px;
            font-weight:700;
            cursor:pointer;
            margin-bottom:22px;
          "
        >
          + Añadir
        </button>

        <div style="display:grid; gap:14px;">
          ${eventos.length ? eventos.map((evento) => renderEvento(evento)).join("") : `
            <div style="
              padding:16px;
              border:1px dashed #cbd5e1;
              border-radius:12px;
              background:#f8fafc;
              color:#64748b;
            ">
              No hay eventos todavía.
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

function renderEvento(evento) {
  const color = getColorTipo(evento.tipo);

  return `
    <div style="
      padding:14px;
      border:1px solid #d8e1eb;
      border-left:8px solid ${color};
      border-radius:14px;
      background:#fff;
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
            ${evento.done ? "checked" : ""}
            onclick="event.stopPropagation(); toggleEventoUI(${evento.id})"
            style="width:18px; height:18px; margin-top:3px; flex:0 0 auto;"
          >

          <div style="min-width:0; flex:1;">
            <div style="
              font-size:16px;
              font-weight:700;
              color:#0f172a;
              line-height:1.35;
              word-break:break-word;
            ">
              ${evento.done ? "<s>" + escapeHtml(evento.titulo) + "</s>" : escapeHtml(evento.titulo)}
            </div>

            <div style="margin-top:6px; font-size:14px; color:#475569;">
              ${evento.fecha || "Sin fecha"}${evento.hora ? " · " + evento.hora : ""}
            </div>

            <div style="margin-top:6px; font-size:14px; color:#475569;">
              ${escapeHtml(evento.usuario)} · ${escapeHtml(evento.tipo)} · ${escapeHtml(evento.prioridad)}
            </div>

            ${evento.extra ? `
              <div style="margin-top:6px; font-size:14px; color:#64748b;">
                ${escapeHtml(evento.extra)}
              </div>
            ` : ""}
          </div>
        </div>

        <button
          type="button"
          onclick="deleteEventoUI(${evento.id})"
          style="
            width:42px;
            height:42px;
            border:none;
            border-radius:12px;
            background:#dc2626;
            color:#fff;
            font-size:20px;
            font-weight:700;
            cursor:pointer;
            flex:0 0 auto;
          "
        >
          ✕
        </button>
      </div>
    </div>
  `;
}

function refrescarAgenda() {
  const container = document.getElementById("viewContainer");
  if (!container) return;
  container.innerHTML = renderAgenda();
}

function getColorTipo(tipo) {
  switch (tipo) {
    case "Trabajo":
      return "#2563eb";
    case "Revisión herramienta":
      return "#f59e0b";
    case "Revisión vehículo":
      return "#8b5cf6";
    case "Vacaciones":
      return "#16a34a";
    case "Reunión":
      return "#ec4899";
    case "Aviso":
      return "#dc2626";
    default:
      return "#64748b";
  }
}

function escapeHtml(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function inputStyle() {
  return `
    width:100%;
    height:46px;
    padding:0 12px;
    border:1px solid #cbd5e1;
    border-radius:12px;
    background:#fff;
    color:#0f172a;
    font-size:15px;
  `;
}

function labelStyle() {
  return `
    display:block;
    margin-bottom:6px;
    font-size:14px;
    font-weight:700;
    color:#0f172a;
  `;
}
