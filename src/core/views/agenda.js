import {
  getEventos,
  addEvento,
  toggleEvento,
  deleteEvento,
  getAgendaContexto,
  validarAsignacionAgenda
} from "../agenda.js";
import { estaDisponible } from "../utils/disponibilidad.js";

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

      const trabajador = buscarTrabajadorPorTexto(usuario);
      if (trabajador) {
        const check = estaDisponible(trabajador.id, fecha);

        if (check.ok === false) {
          alert(`❌ ${check.motivo}`);
          return;
        }

        if (check.ok === "warning") {
          const seguir = window.confirm(`⚠️ ${check.motivo}. ¿Continuar?`);
          if (!seguir) return;
        }
      }

      const validacion = validarAsignacionAgenda({
        usuario,
        fecha,
        tipo
      });

      if (!validacion.ok) {
        const seguir = window.confirm(validacion.mensaje);
        if (!seguir) return;
      }

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
      if (String(id).startsWith("aus_")) return;
      toggleEvento(id);
      refrescarAgenda();
    };

    window.deleteEventoUI = function (id) {
      if (String(id).startsWith("aus_")) return;
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
  const esAusencia = String(evento.id).startsWith("aus_");

  if (esAusencia) {
    return `
      <div style="
        padding:10px 12px;
        border:1px solid #d8e1eb;
        border-left:8px solid ${color};
        border-radius:12px;
        background:#f8fafc;
      ">
        <div style="
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:12px;
        ">
          <div style="min-width:0;flex:1;">
            <div style="
              display:flex;
              align-items:center;
              gap:8px;
              flex-wrap:wrap;
              margin-bottom:4px;
            ">
              <div style="
                font-size:15px;
                font-weight:800;
                color:#0f172a;
                line-height:1.3;
              ">
                ${escapeHtml(evento.titulo)}
              </div>

              <span style="
                display:inline-flex;
                align-items:center;
                justify-content:center;
                padding:3px 8px;
                border-radius:999px;
                background:#0f172a;
                color:#fff;
                font-size:11px;
                font-weight:700;
              ">
                Ausencia
              </span>
            </div>

            <div style="font-size:13px;color:#475569;">
              ${evento.fecha || "Sin fecha"}${evento.extra ? " · " + escapeHtml(evento.extra) : ""}
            </div>

            <div style="margin-top:4px;font-size:12px;color:#64748b;">
              ${escapeHtml(evento.usuario)} · ${escapeHtml(evento.tipo)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

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
            onclick="event.stopPropagation(); toggleEventoUI('${evento.id}')"
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
          onclick="deleteEventoUI('${evento.id}')"
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

function buscarTrabajadorPorTexto(texto) {
  try {
    const lista = JSON.parse(localStorage.getItem("zentrix_personal_v2") || "[]");
    const txt = normalizar(texto);

    return (
      lista.find((u) => normalizar(u.nombre) === txt) ||
      lista.find((u) => normalizar(u.usuario) === txt) ||
      null
    );
  } catch (error) {
    return null;
  }
}

function normalizar(txt) {
  return String(txt || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
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
    box-sizing:border-box;
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