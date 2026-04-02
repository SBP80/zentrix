export function renderInicio() {
  const ahora = new Date();

  const fecha = ahora.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const hora = ahora.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const usuario = getUsuarioActual();
  const tareas = getEventosHoy();
  const pendientes = tareas.filter((t) => !t.done).length;
  const hechas = tareas.filter((t) => t.done).length;

  return `
    <div style="max-width:1100px; width:100%;">
      <div class="panel-card" style="margin-bottom:18px;">
        <div style="
          display:flex;
          flex-wrap:wrap;
          justify-content:space-between;
          align-items:flex-start;
          gap:16px;
        ">
          <div>
            <h3 style="margin:0 0 8px 0;">Inicio</h3>
            <div style="font-size:15px; color:#64748b; text-transform:capitalize;">
              ${fecha}
            </div>
          </div>

          <div style="text-align:right;">
            <div style="font-size:34px; font-weight:700; color:#0f172a;">
              ${hora}
            </div>
            <div style="font-size:14px; color:#64748b;">
              Usuario: <strong>${escapeHtml(usuario.nombre)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div style="
        display:grid;
        grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));
        gap:14px;
        margin-bottom:18px;
      ">
        <div class="panel-card">
          <div style="font-size:14px; color:#64748b; margin-bottom:8px;">Eventos de hoy</div>
          <div style="font-size:30px; font-weight:700; color:#0f172a;">${tareas.length}</div>
        </div>

        <div class="panel-card">
          <div style="font-size:14px; color:#64748b; margin-bottom:8px;">Pendientes</div>
          <div style="font-size:30px; font-weight:700; color:#d97706;">${pendientes}</div>
        </div>

        <div class="panel-card">
          <div style="font-size:14px; color:#64748b; margin-bottom:8px;">Hechas</div>
          <div style="font-size:30px; font-weight:700; color:#16a34a;">${hechas}</div>
        </div>

        <div class="panel-card">
          <div style="font-size:14px; color:#64748b; margin-bottom:8px;">Rol</div>
          <div style="font-size:22px; font-weight:700; color:#0f172a;">${escapeHtml(usuario.rol)}</div>
        </div>
      </div>

      <div style="
        display:grid;
        grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));
        gap:18px;
      ">
        <div class="panel-card">
          <h3 style="margin-top:0; margin-bottom:14px;">Accesos rápidos</h3>

          <div style="display:grid; gap:10px;">
            <button type="button" onclick="irAInicioModulo('agenda')" style="${quickBtnStyle("#2563eb")}">Abrir agenda</button>
            <button type="button" onclick="irAInicioModulo('personal')" style="${quickBtnStyle("#0f766e")}">Abrir personal</button>
            <button type="button" onclick="irAInicioModulo('configuracion')" style="${quickBtnStyle("#7c3aed")}">Abrir configuración</button>
          </div>
        </div>

        <div class="panel-card">
          <h3 style="margin-top:0; margin-bottom:14px;">Próximos eventos</h3>

          <div style="display:grid; gap:10px;">
            ${tareas.length ? tareas.slice(0, 5).map((t) => `
              <div style="
                padding:12px;
                border:1px solid #d8e1eb;
                border-left:6px solid ${getTipoColor(t.tipo)};
                border-radius:12px;
                background:#fff;
              ">
                <div style="font-weight:700; color:#0f172a;">
                  ${escapeHtml(t.titulo)}
                </div>
                <div style="margin-top:6px; font-size:14px; color:#64748b;">
                  ${escapeHtml(t.fecha || "")}${t.hora ? " · " + escapeHtml(t.hora) : ""}
                </div>
                <div style="margin-top:6px; font-size:13px; color:#475569;">
                  ${escapeHtml(t.tipo || "")}${t.usuario ? " · " + escapeHtml(t.usuario) : ""}
                </div>
              </div>
            `).join("") : `
              <div style="
                padding:12px;
                border:1px dashed #cbd5e1;
                border-radius:12px;
                background:#f8fafc;
                color:#64748b;
              ">
                No hay eventos para hoy.
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

function getUsuarioActual() {
  const sessionId = localStorage.getItem("zentrix_session_user_v1");
  const raw = localStorage.getItem("zentrix_users_v1");

  try {
    const users = JSON.parse(raw || "[]");
    return users.find((u) => u.id === sessionId) || {
      nombre: "Usuario",
      rol: "sin rol",
    };
  } catch (error) {
    return {
      nombre: "Usuario",
      rol: "sin rol",
    };
  }
}

function getEventosHoy() {
  const hoy = new Date().toISOString().split("T")[0];

  const keys = [
    "zentrix_agenda_eventos_v1",
    "zentrix_agenda_v3",
    "tareas",
  ];

  for (const key of keys) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(data) && data.length) {
        return data.filter((e) => e.fecha === hoy);
      }
    } catch (error) {
      // nada
    }
  }

  return [];
}

function getTipoColor(tipo) {
  switch (tipo) {
    case "Trabajo":
    case "trabajo":
      return "#2563eb";
    case "Revisión herramienta":
    case "herramienta":
      return "#f59e0b";
    case "Revisión vehículo":
    case "vehiculo":
      return "#8b5cf6";
    case "Vacaciones":
    case "vacaciones":
      return "#16a34a";
    case "Reunión":
    case "reunion":
      return "#ec4899";
    case "Aviso":
    case "aviso":
      return "#dc2626";
    default:
      return "#64748b";
  }
}

function quickBtnStyle(color) {
  return `
    min-height:48px;
    border:none;
    border-radius:12px;
    background:${color};
    color:#ffffff;
    font-size:15px;
    font-weight:700;
    cursor:pointer;
    padding:0 14px;
    text-align:left;
  `;
}

function escapeHtml(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.irAInicioModulo = function (view) {
  const botones = document.querySelectorAll(".nav-btn");
  const boton = Array.from(botones).find((b) => b.dataset.view === view);
  if (boton) boton.click();
};
