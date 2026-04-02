const EVENTOS_KEY = "zentrix_agenda_eventos_v3";
const USUARIO_ACTIVO_KEY = "zentrix_agenda_usuario_activo_v1";

const USUARIOS = [
  {
    id: "u_encargado",
    nombre: "Encargado",
    rol: "encargado",
    personalId: "p_encargado",
    vehiculosIds: [],
    herramientasIds: [],
    permisos: {
      agendaVerTodo: true,
      agendaCrear: true,
      agendaEditarTodo: true,
      agendaBorrarTodo: true,
      agendaMarcarTodo: true,
    },
  },
  {
    id: "u_oficina",
    nombre: "Oficina",
    rol: "oficina",
    personalId: "p_oficina",
    vehiculosIds: [],
    herramientasIds: [],
    permisos: {
      agendaVerTodo: true,
      agendaCrear: true,
      agendaEditarTodo: true,
      agendaBorrarTodo: false,
      agendaMarcarTodo: true,
    },
  },
  {
    id: "u_jose",
    nombre: "José",
    rol: "operario",
    personalId: "p_jose",
    vehiculosIds: ["v_furgon_1"],
    herramientasIds: ["h_bomba_vacio", "h_detector_fugas"],
    permisos: {
      agendaVerTodo: false,
      agendaCrear: false,
      agendaEditarTodo: false,
      agendaBorrarTodo: false,
      agendaMarcarTodo: false,
    },
  },
  {
    id: "u_antonio",
    nombre: "Antonio",
    rol: "operario",
    personalId: "p_antonio",
    vehiculosIds: ["v_furgon_2"],
    herramientasIds: ["h_analizador", "h_taladro"],
    permisos: {
      agendaVerTodo: false,
      agendaCrear: false,
      agendaEditarTodo: false,
      agendaBorrarTodo: false,
      agendaMarcarTodo: false,
    },
  },
];

const PERSONAL = [
  { id: "p_encargado", nombre: "Encargado" },
  { id: "p_oficina", nombre: "Oficina" },
  { id: "p_jose", nombre: "José" },
  { id: "p_antonio", nombre: "Antonio" },
];

const VEHICULOS = [
  { id: "v_furgon_1", nombre: "Furgón 1" },
  { id: "v_furgon_2", nombre: "Furgón 2" },
];

const HERRAMIENTAS = [
  { id: "h_bomba_vacio", nombre: "Bomba de vacío" },
  { id: "h_detector_fugas", nombre: "Detector de fugas" },
  { id: "h_analizador", nombre: "Analizador" },
  { id: "h_taladro", nombre: "Taladro" },
];

const TIPOS_EVENTO = [
  { id: "trabajo", nombre: "Trabajo / obra" },
  { id: "revision_vehiculo", nombre: "Revisión vehículo" },
  { id: "revision_herramienta", nombre: "Revisión herramienta" },
  { id: "vacaciones", nombre: "Vacaciones" },
  { id: "reunion", nombre: "Reunión" },
  { id: "aviso", nombre: "Aviso interno" },
  { id: "administracion", nombre: "Administración" },
  { id: "otro", nombre: "Otro" },
];

const PRIORIDADES = [
  { id: "baja", nombre: "Baja" },
  { id: "media", nombre: "Media" },
  { id: "alta", nombre: "Alta" },
];

const ESTADOS = [
  { id: "pendiente", nombre: "Pendiente" },
  { id: "hecho", nombre: "Hecho" },
];

const EVENTOS_DEMO = [
  {
    id: "e_demo_1",
    titulo: "Instalación aerotermia casa José",
    tipo: "trabajo",
    fecha: "2026-04-03",
    horaInicio: "08:00",
    horaFin: "13:30",
    personalIds: ["p_jose", "p_antonio"],
    vehiculoId: "v_furgon_1",
    herramientaIds: ["h_bomba_vacio", "h_detector_fugas"],
    cliente: "José Martínez",
    obra: "Chalet Pozuelo",
    prioridad: "alta",
    estado: "pendiente",
    notas: "Llevar material de arranque y purgado.",
    visibleParaRoles: ["encargado", "oficina"],
    privacidad: "asignados",
    createdBy: "u_encargado",
  },
  {
    id: "e_demo_2",
    titulo: "Revisión ITV Furgón 2",
    tipo: "revision_vehiculo",
    fecha: "2026-04-03",
    horaInicio: "09:00",
    horaFin: "10:00",
    personalIds: ["p_antonio"],
    vehiculoId: "v_furgon_2",
    herramientaIds: [],
    cliente: "",
    obra: "",
    prioridad: "media",
    estado: "pendiente",
    notas: "Llevar documentación.",
    visibleParaRoles: ["encargado", "oficina"],
    privacidad: "asignados",
    createdBy: "u_oficina",
  },
  {
    id: "e_demo_3",
    titulo: "Vacaciones Antonio",
    tipo: "vacaciones",
    fecha: "2026-04-10",
    horaInicio: "00:00",
    horaFin: "23:59",
    personalIds: ["p_antonio"],
    vehiculoId: "",
    herramientaIds: [],
    cliente: "",
    obra: "",
    prioridad: "media",
    estado: "pendiente",
    notas: "Semana santa.",
    visibleParaRoles: ["encargado", "oficina"],
    privacidad: "asignados",
    createdBy: "u_oficina",
  },
];

function ensureAgendaBase() {
  if (!localStorage.getItem(EVENTOS_KEY)) {
    localStorage.setItem(EVENTOS_KEY, JSON.stringify(EVENTOS_DEMO));
  }

  if (!localStorage.getItem(USUARIO_ACTIVO_KEY)) {
    localStorage.setItem(USUARIO_ACTIVO_KEY, "u_encargado");
  }
}

function readEventos() {
  ensureAgendaBase();
  try {
    const raw = JSON.parse(localStorage.getItem(EVENTOS_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveEventos(eventos) {
  localStorage.setItem(EVENTOS_KEY, JSON.stringify(eventos));
}

export function getUsuariosAgenda() {
  ensureAgendaBase();
  return [...USUARIOS];
}

export function getPersonalAgenda() {
  return [...PERSONAL];
}

export function getVehiculosAgenda() {
  return [...VEHICULOS];
}

export function getHerramientasAgenda() {
  return [...HERRAMIENTAS];
}

export function getTiposEventoAgenda() {
  return [...TIPOS_EVENTO];
}

export function getPrioridadesAgenda() {
  return [...PRIORIDADES];
}

export function getEstadosAgenda() {
  return [...ESTADOS];
}

export function getUsuarioActivoAgenda() {
  ensureAgendaBase();
  const id = localStorage.getItem(USUARIO_ACTIVO_KEY);
  return USUARIOS.find((u) => u.id === id) || USUARIOS[0];
}

export function setUsuarioActivoAgenda(userId) {
  const existe = USUARIOS.some((u) => u.id === userId);
  if (!existe) return;
  localStorage.setItem(USUARIO_ACTIVO_KEY, userId);
}

export function canCurrentUserCreateAgenda() {
  const usuario = getUsuarioActivoAgenda();
  return Boolean(usuario?.permisos?.agendaCrear);
}

export function canCurrentUserDeleteAgenda(evento) {
  const usuario = getUsuarioActivoAgenda();
  if (!usuario) return false;
  if (usuario.permisos.agendaBorrarTodo) return true;
  return evento.createdBy === usuario.id;
}

export function canCurrentUserToggleAgenda(evento) {
  const usuario = getUsuarioActivoAgenda();
  if (!usuario) return false;
  if (usuario.permisos.agendaMarcarTodo) return true;
  return evento.personalIds.includes(usuario.personalId);
}

export function getAgendaContexto() {
  return {
    usuarioActivo: getUsuarioActivoAgenda(),
    usuarios: getUsuariosAgenda(),
    personal: getPersonalAgenda(),
    vehiculos: getVehiculosAgenda(),
    herramientas: getHerramientasAgenda(),
    tipos: getTiposEventoAgenda(),
    prioridades: getPrioridadesAgenda(),
    estados: getEstadosAgenda(),
  };
}

export function getEventosVisiblesAgenda() {
  const usuario = getUsuarioActivoAgenda();
  const eventos = readEventos();

  return eventos.filter((evento) => canUserSeeEvent(usuario, evento));
}

export function addEventoAgenda(data) {
  const usuario = getUsuarioActivoAgenda();
  if (!usuario || !usuario.permisos.agendaCrear) return;

  const evento = {
    id: `e_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    titulo: String(data.titulo || "").trim(),
    tipo: data.tipo || "otro",
    fecha: data.fecha || "",
    horaInicio: data.horaInicio || "",
    horaFin: data.horaFin || "",
    personalIds: Array.isArray(data.personalIds) ? data.personalIds : [],
    vehiculoId: data.vehiculoId || "",
    herramientaIds: Array.isArray(data.herramientaIds) ? data.herramientaIds : [],
    cliente: String(data.cliente || "").trim(),
    obra: String(data.obra || "").trim(),
    prioridad: data.prioridad || "media",
    estado: data.estado || "pendiente",
    notas: String(data.notas || "").trim(),
    visibleParaRoles: ["encargado", "oficina"],
    privacidad: "asignados",
    createdBy: usuario.id,
  };

  if (!evento.titulo || !evento.fecha) return;

  const eventos = readEventos();
  eventos.push(evento);
  saveEventos(eventos);
}

export function toggleEstadoEventoAgenda(eventId) {
  const usuario = getUsuarioActivoAgenda();
  const eventos = readEventos().map((evento) => {
    if (evento.id !== eventId) return evento;
    if (!canCurrentUserToggleAgenda(evento)) return evento;

    return {
      ...evento,
      estado: evento.estado === "hecho" ? "pendiente" : "hecho",
    };
  });

  if (!usuario) return;
  saveEventos(eventos);
}

export function deleteEventoAgenda(eventId) {
  const eventos = readEventos();
  const evento = eventos.find((e) => e.id === eventId);
  if (!evento) return;
  if (!canCurrentUserDeleteAgenda(evento)) return;

  saveEventos(eventos.filter((e) => e.id !== eventId));
}

function canUserSeeEvent(usuario, evento) {
  if (!usuario) return false;

  if (usuario.permisos.agendaVerTodo) return true;

  if (evento.visibleParaRoles.includes(usuario.rol)) return true;

  if (evento.privacidad === "general") return true;

  if (evento.personalIds.includes(usuario.personalId)) return true;

  if (evento.vehiculoId && usuario.vehiculosIds.includes(evento.vehiculoId)) return true;

  if (
    Array.isArray(evento.herramientaIds) &&
    evento.herramientaIds.some((id) => usuario.herramientasIds.includes(id))
  ) {
    return true;
  }

  return false;
}

export function getNombrePersonal(personalId) {
  return PERSONAL.find((p) => p.id === personalId)?.nombre || personalId;
}

export function getNombreVehiculo(vehiculoId) {
  if (!vehiculoId) return "";
  return VEHICULOS.find((v) => v.id === vehiculoId)?.nombre || vehiculoId;
}

export function getNombreHerramienta(herramientaId) {
  return HERRAMIENTAS.find((h) => h.id === herramientaId)?.nombre || herramientaId;
}

export function getNombreTipoEvento(tipoId) {
  return TIPOS_EVENTO.find((t) => t.id === tipoId)?.nombre || tipoId;
  import {
  getAgendaContexto,
  getEventosVisiblesAgenda,
  addEventoAgenda,
  deleteEventoAgenda,
  toggleEstadoEventoAgenda,
  setUsuarioActivoAgenda,
  canCurrentUserCreateAgenda,
  canCurrentUserDeleteAgenda,
  canCurrentUserToggleAgenda,
  getNombrePersonal,
  getNombreVehiculo,
  getNombreHerramienta,
  getNombreTipoEvento,
} from "../agenda.js";

export function renderAgenda() {
  const {
    usuarioActivo,
    usuarios,
    personal,
    vehiculos,
    herramientas,
    tipos,
    prioridades,
  } = getAgendaContexto();

  const eventos = getEventosVisiblesAgenda().sort(sortEventos);

  const canCreate = canCurrentUserCreateAgenda();

  return `
    <div style="max-width:980px; width:100%;">
      <div class="panel-card">
        <div style="
          display:flex;
          flex-wrap:wrap;
          gap:12px;
          align-items:end;
          justify-content:space-between;
          margin-bottom:20px;
        ">
          <div>
            <h3 style="margin:0;">Agenda profesional</h3>
            <div style="margin-top:6px; color:#64748b; font-size:14px;">
              Perfil activo: <strong>${escapeHtml(usuarioActivo.nombre)}</strong> · Rol: ${escapeHtml(usuarioActivo.rol)}
            </div>
          </div>

          <div style="min-width:240px;">
            <label for="agendaUsuarioActivo" style="
              display:block;
              margin-bottom:6px;
              font-size:14px;
              font-weight:700;
              color:#0f172a;
            ">Ver como</label>

            <select
              id="agendaUsuarioActivo"
              onchange="cambiarUsuarioAgenda()"
              style="
                width:100%;
                height:46px;
                padding:0 12px;
                border:1px solid #cbd5e1;
                border-radius:12px;
                background:#ffffff;
                color:#0f172a;
                font-size:15px;
              "
            >
              ${usuarios.map((u) => `
                <option value="${u.id}" ${u.id === usuarioActivo.id ? "selected" : ""}>
                  ${escapeHtml(u.nombre)} · ${escapeHtml(u.rol)}
                </option>
              `).join("")}
            </select>
          </div>
        </div>

        <div style="
          padding:16px;
          border:1px solid #d8e1eb;
          border-radius:16px;
          background:#f8fafc;
          margin-bottom:20px;
        ">
          <div style="
            font-size:16px;
            font-weight:700;
            color:#0f172a;
            margin-bottom:14px;
          ">Nuevo evento</div>

          <div style="
            display:grid;
            grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));
            gap:12px;
          ">
            ${fieldText("Titulo", "agendaTitulo", "Ej. Instalación aerotermia", canCreate)}
            ${fieldSelect("Tipo", "agendaTipo", tipos, "id", "nombre", canCreate)}
            ${fieldDate("Fecha", "agendaFecha", canCreate)}
            ${fieldTime("Hora inicio", "agendaHoraInicio", canCreate)}
            ${fieldTime("Hora fin", "agendaHoraFin", canCreate)}
            ${fieldText("Cliente", "agendaCliente", "Cliente / empresa", canCreate)}
            ${fieldText("Obra", "agendaObra", "Obra / ubicación", canCreate)}
            ${fieldSelect("Prioridad", "agendaPrioridad", prioridades, "id", "nombre", canCreate)}
            ${fieldSelect("Vehículo", "agendaVehiculo", [{ id: "", nombre: "Sin vehículo" }, ...vehiculos], "id", "nombre", canCreate)}
          </div>

          <div style="margin-top:14px;">
            <div style="
              margin-bottom:8px;
              font-size:14px;
              font-weight:700;
              color:#0f172a;
            ">Personal asignado</div>

            <div style="
              display:grid;
              grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));
              gap:8px;
            ">
              ${personal.map((p) => `
                <label style="
                  display:flex;
                  align-items:center;
                  gap:8px;
                  min-height:42px;
                  padding:0 12px;
                  border:1px solid #d8e1eb;
                  border-radius:12px;
                  background:#ffffff;
                  color:#0f172a;
                  ${canCreate ? "" : "opacity:0.55;"}
                ">
                  <input type="checkbox" name="agendaPersonal" value="${p.id}" ${canCreate ? "" : "disabled"} />
                  <span>${escapeHtml(p.nombre)}</span>
                </label>
              `).join("")}
            </div>
          </div>

          <div style="margin-top:14px;">
            <div style="
              margin-bottom:8px;
              font-size:14px;
              font-weight:700;
              color:#0f172a;
            ">Herramientas asociadas</div>

            <div style="
              display:grid;
              grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));
              gap:8px;
            ">
              ${herramientas.map((h) => `
                <label style="
                  display:flex;
                  align-items:center;
                  gap:8px;
                  min-height:42px;
                  padding:0 12px;
                  border:1px solid #d8e1eb;
                  border-radius:12px;
                  background:#ffffff;
                  color:#0f172a;
                  ${canCreate ? "" : "opacity:0.55;"}
                ">
                  <input type="checkbox" name="agendaHerramienta" value="${h.id}" ${canCreate ? "" : "disabled"} />
                  <span>${escapeHtml(h.nombre)}</span>
                </label>
              `).join("")}
            </div>
          </div>

          <div style="margin-top:14px;">
            <label for="agendaNotas" style="
              display:block;
              margin-bottom:6px;
              font-size:14px;
              font-weight:700;
              color:#0f172a;
            ">Notas</label>

            <textarea
              id="agendaNotas"
              ${canCreate ? "" : "disabled"}
              placeholder="Notas internas"
              style="
                width:100%;
                min-height:96px;
                padding:12px 14px;
                border:1px solid #cbd5e1;
                border-radius:12px;
                background:#ffffff;
                color:#0f172a;
                font-size:15px;
                resize:vertical;
                ${canCreate ? "" : "opacity:0.55;"}
              "
            ></textarea>
          </div>

          <div style="margin-top:14px;">
            <button
              onclick="crearEventoAgendaUI()"
              ${canCreate ? "" : "disabled"}
              style="
                width:100%;
                min-height:48px;
                border:none;
                border-radius:12px;
                background:${canCreate ? "#2563eb" : "#94a3b8"};
                color:#ffffff;
                font-size:16px;
                font-weight:700;
                cursor:${canCreate ? "pointer" : "default"};
              "
            >Crear evento</button>
          </div>

          ${canCreate ? "" : `
            <div style="margin-top:10px; color:#b45309; font-size:13px;">
              Este perfil solo puede consultar sus eventos.
            </div>
          `}
        </div>

        <div style="
          display:grid;
          gap:14px;
        ">
          ${eventos.length ? eventos.map((evento) => renderEventoCard(evento)).join("") : `
            <div style="
              padding:16px;
              border:1px dashed #cbd5e1;
              border-radius:14px;
              background:#f8fafc;
              color:#64748b;
            ">
              No hay eventos visibles para este perfil.
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

function renderEventoCard(evento) {
  const color = getColorEvento(evento);
  const personal = evento.personalIds.map(getNombrePersonal).join(", ") || "Sin asignar";
  const herramientas = evento.herramientaIds.map(getNombreHerramienta).join(", ");
  const vehiculo = getNombreVehiculo(evento.vehiculoId);
  const canToggle = canCurrentUserToggleAgenda(evento);
  const canDelete = canCurrentUserDeleteAgenda(evento);

  return `
    <div style="
      width:100%;
      padding:14px;
      border:1px solid #d8e1eb;
      border-left:8px solid ${color};
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
            ${evento.estado === "hecho" ? "checked" : ""}
            ${canToggle ? "" : "disabled"}
            onclick="toggleEventoAgendaUI('${evento.id}')"
            style="
              width:20px;
              height:20px;
              margin-top:3px;
              flex:0 0 auto;
            "
          >

          <div style="min-width:0; flex:1;">
            <div style="
              display:flex;
              flex-wrap:wrap;
              gap:8px;
              align-items:center;
              margin-bottom:4px;
            ">
              <div style="
                font-size:17px;
                font-weight:700;
                color:#0f172a;
                line-height:1.35;
                word-break:break-word;
              ">
                ${evento.estado === "hecho"
                  ? "<s>" + escapeHtml(evento.titulo) + "</s>"
                  : escapeHtml(evento.titulo)}
              </div>

              <span style="
                display:inline-block;
                padding:5px 10px;
                border-radius:999px;
                background:${color};
                color:#ffffff;
                font-size:12px;
                font-weight:700;
              ">
                ${escapeHtml(getNombreTipoEvento(evento.tipo))}
              </span>
            </div>

            <div style="font-size:14px; color:#475569; margin-top:4px;">
              ${formatFecha(evento.fecha)} · ${evento.horaInicio || "--:--"}${evento.horaFin ? " - " + evento.horaFin : ""}
            </div>

            <div style="font-size:14px; color:#475569; margin-top:6px;">
              <strong>Personal:</strong> ${escapeHtml(personal)}
            </div>

            ${vehiculo ? `
              <div style="font-size:14px; color:#475569; margin-top:4px;">
                <strong>Vehículo:</strong> ${escapeHtml(vehiculo)}
              </div>
            ` : ""}

            ${herramientas ? `
              <div style="font-size:14px; color:#475569; margin-top:4px;">
                <strong>Herramientas:</strong> ${escapeHtml(herramientas)}
              </div>
            ` : ""}

            ${evento.cliente ? `
              <div style="font-size:14px; color:#475569; margin-top:4px;">
                <strong>Cliente:</strong> ${escapeHtml(evento.cliente)}
              </div>
            ` : ""}

            ${evento.obra ? `
              <div style="font-size:14px; color:#475569; margin-top:4px;">
                <strong>Obra:</strong> ${escapeHtml(evento.obra)}
              </div>
            ` : ""}

            <div style="
              display:flex;
              flex-wrap:wrap;
              gap:8px;
              margin-top:10px;
            ">
              <span style="
                display:inline-block;
                padding:5px 10px;
                border-radius:999px;
                background:${evento.prioridad === "alta" ? "#dc2626" : evento.prioridad === "media" ? "#d97706" : "#64748b"};
                color:#ffffff;
                font-size:12px;
                font-weight:700;
              ">
                Prioridad ${escapeHtml(evento.prioridad)}
              </span>

              <span style="
                display:inline-block;
                padding:5px 10px;
                border-radius:999px;
                background:${evento.estado === "hecho" ? "#16a34a" : "#2563eb"};
                color:#ffffff;
                font-size:12px;
                font-weight:700;
              ">
                ${evento.estado === "hecho" ? "Hecho" : "Pendiente"}
              </span>
            </div>

            ${evento.notas ? `
              <div style="
                margin-top:10px;
                padding:10px 12px;
                border-radius:12px;
                background:#f8fafc;
                color:#334155;
                font-size:14px;
                line-height:1.45;
              ">
                ${escapeHtml(evento.notas)}
              </div>
            ` : ""}
          </div>
        </div>

        <button
          onclick="borrarEventoAgendaUI('${evento.id}')"
          ${canDelete ? "" : "disabled"}
          style="
            width:42px;
            height:42px;
            border:none;
            border-radius:12px;
            background:${canDelete ? "#dc2626" : "#cbd5e1"};
            color:#ffffff;
            font-size:20px;
            font-weight:700;
            cursor:${canDelete ? "pointer" : "default"};
            flex:0 0 auto;
          "
        >✕</button>
      </div>
    </div>
  `;
}

function fieldText(label, id, placeholder, enabled) {
  return `
    <div>
      <label for="${id}" style="
        display:block;
        margin-bottom:6px;
        font-size:14px;
        font-weight:700;
        color:#0f172a;
      ">${label}</label>

      <input
        id="${id}"
        ${enabled ? "" : "disabled"}
        placeholder="${placeholder}"
        style="
          width:100%;
          height:46px;
          padding:0 12px;
          border:1px solid #cbd5e1;
          border-radius:12px;
          background:#ffffff;
          color:#0f172a;
          font-size:15px;
          ${enabled ? "" : "opacity:0.55;"}
        "
      />
    </div>
  `;
}

function fieldDate(label, id, enabled) {
  return `
    <div>
      <label for="${id}" style="
        display:block;
        margin-bottom:6px;
        font-size:14px;
        font-weight:700;
        color:#0f172a;
      ">${label}</label>

      <input
        id="${id}"
        type="date"
        ${enabled ? "" : "disabled"}
        style="
          width:100%;
          height:46px;
          padding:0 12px;
          border:1px solid #cbd5e1;
          border-radius:12px;
          background:#ffffff;
          color:#0f172a;
          font-size:15px;
          ${enabled ? "" : "opacity:0.55;"}
        "
      />
    </div>
  `;
}

function fieldTime(label, id, enabled) {
  return `
    <div>
      <label for="${id}" style="
        display:block;
        margin-bottom:6px;
        font-size:14px;
        font-weight:700;
        color:#0f172a;
      ">${label}</label>

      <input
        id="${id}"
        type="time"
        ${enabled ? "" : "disabled"}
        style="
          width:100%;
          height:46px;
          padding:0 12px;
          border:1px solid #cbd5e1;
          border-radius:12px;
          background:#ffffff;
          color:#0f172a;
          font-size:15px;
          ${enabled ? "" : "opacity:0.55;"}
        "
      />
    </div>
  `;
}

function fieldSelect(label, id, items, valueKey, textKey, enabled) {
  return `
    <div>
      <label for="${id}" style="
        display:block;
        margin-bottom:6px;
        font-size:14px;
        font-weight:700;
        color:#0f172a;
      ">${label}</label>

      <select
        id="${id}"
        ${enabled ? "" : "disabled"}
        style="
          width:100%;
          height:46px;
          padding:0 12px;
          border:1px solid #cbd5e1;
          border-radius:12px;
          background:#ffffff;
          color:#0f172a;
          font-size:15px;
          ${enabled ? "" : "opacity:0.55;"}
        "
      >
        ${items.map((item) => `
          <option value="${item[valueKey]}">${escapeHtml(item[textKey])}</option>
        `).join("")}
      </select>
    </div>
  `;
}

function getColorEvento(evento) {
  if (evento.estado === "hecho") return "#64748b";
  if (evento.tipo === "vacaciones") return "#9333ea";
  if (evento.tipo === "revision_vehiculo") return "#0f766e";
  if (evento.tipo === "revision_herramienta") return "#d97706";
  if (evento.tipo === "reunion") return "#2563eb";
  if (evento.tipo === "aviso") return "#dc2626";
  return "#16a34a";
}

function sortEventos(a, b) {
  const aa = `${a.fecha || "9999-12-31"} ${a.horaInicio || "23:59"}`;
  const bb = `${b.fecha || "9999-12-31"} ${b.horaInicio || "23:59"}`;
  return aa.localeCompare(bb);
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

function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map((el) => el.value);
}

function refrescarAgenda() {
  const container = document.getElementById("viewContainer");
  if (!container) return;
  container.innerHTML = renderAgenda();
}

window.cambiarUsuarioAgenda = function () {
  const select = document.getElementById("agendaUsuarioActivo");
  if (!select) return;
  setUsuarioActivoAgenda(select.value);
  refrescarAgenda();
};

window.crearEventoAgendaUI = function () {
  const titulo = document.getElementById("agendaTitulo")?.value.trim() || "";
  const tipo = document.getElementById("agendaTipo")?.value || "otro";
  const fecha = document.getElementById("agendaFecha")?.value || "";
  const horaInicio = document.getElementById("agendaHoraInicio")?.value || "";
  const horaFin = document.getElementById("agendaHoraFin")?.value || "";
  const cliente = document.getElementById("agendaCliente")?.value.trim() || "";
  const obra = document.getElementById("agendaObra")?.value.trim() || "";
  const prioridad = document.getElementById("agendaPrioridad")?.value || "media";
  const vehiculoId = document.getElementById("agendaVehiculo")?.value || "";
  const notas = document.getElementById("agendaNotas")?.value.trim() || "";

  const personalIds = getCheckedValues("agendaPersonal");
  const herramientaIds = getCheckedValues("agendaHerramienta");

  addEventoAgenda({
    titulo,
    tipo,
    fecha,
    horaInicio,
    horaFin,
    personalIds,
    vehiculoId,
    herramientaIds,
    cliente,
    obra,
    prioridad,
    estado: "pendiente",
    notas,
  });

  refrescarAgenda();
};

window.toggleEventoAgendaUI = function (eventId) {
  toggleEstadoEventoAgenda(eventId);
  refrescarAgenda();
};

window.borrarEventoAgendaUI = function (eventId) {
  deleteEventoAgenda(eventId);
  refrescarAgenda();
};
}
