import { db } from "../db.js";
import { getDireccionTexto } from "../data/personal.js";
import { contarDiasEntreFechas } from "../data/ausencias.js";

const PERSONAL_DRAFT_KEY = "zentrix_personal_draft_v7";
const PERSONAL_EDIT_KEY = "zentrix_personal_edit_id_v1";
const PERSONAL_CALENDAR_KEY = "zentrix_personal_calendar_v1";
const AUSENCIA_EDIT_KEY = "zentrix_ausencia_edit_id_v1";

const MODULOS = [
  ["inicio", "Inicio"],
  ["agenda", "Agenda"],
  ["personal", "Personal"],
  ["configuracion", "Configuración"],
  ["vehiculos", "Vehículos"],
  ["herramientas", "Herramientas"],
  ["clientes", "Clientes"],
  ["obras", "Obras"]
];

const ACCIONES = [
  ["verTodo", "Ver todo"],
  ["crear", "Crear"],
  ["editar", "Editar"],
  ["borrar", "Borrar"],
  ["aprobar", "Aprobar"]
];

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function renderPersonal() {
  const lista = db.personal.getAll();
  const draft = getDraft();
  const editId = localStorage.getItem(PERSONAL_EDIT_KEY) || "";
  const editTrabajador = editId ? lista.find((t) => String(t.id) === String(editId)) : null;
  const calendarState = getCalendarState();
  const ausencias = ordenarAusencias(db.ausencias.getAll());

  setTimeout(() => {
    activarControlesCalendario();
    activarEventosFormulario();
    activarBotonesBorrado();
    activarBotonesEditar();
    activarBotonesAusencias();
  }, 0);

  return `
    <div style="max-width:1280px; width:100%;">
      <div class="panel-card">
        <h3 style="margin-top:0;">Personal</h3>
        <p style="color:#64748b; margin-bottom:18px;">Gestión completa de trabajadores y ausencias.</p>

        ${renderCalendarioBloque(lista, ausencias, calendarState)}

        ${editTrabajador ? `
          <div style="
            margin-top:18px;
            margin-bottom:14px;
            padding:12px;
            border:1px solid #bfdbfe;
            border-radius:12px;
            background:#eff6ff;
            color:#1e3a8a;
            font-weight:700;
          ">
            Editando trabajador: ${escapeHtml(editTrabajador.nombre)}
          </div>
        ` : ""}

        <div style="margin-top:18px;">
          ${formulario(draft, !!editTrabajador)}
        </div>

        <div style="margin-top:24px; display:grid; gap:14px;">
          ${lista.length ? lista.map(renderTrabajador).join("") : `
            <div style="
              padding:14px;
              border:1px dashed #cbd5e1;
              border-radius:12px;
              color:#64748b;
              background:#f8fafc;
            ">
              No hay trabajadores todavía.
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

function renderCalendarioBloque(trabajadores, ausencias, calendarState) {
  const mes = Number(calendarState.mes);
  const anio = Number(calendarState.anio);
  const trabajadorId = calendarState.trabajadorId || "todos";

  const primerDiaMes = new Date(anio, mes, 1);
  const ultimoDiaMes = new Date(anio, mes + 1, 0);
  const diasEnMes = ultimoDiaMes.getDate();

  let inicioSemana = primerDiaMes.getDay();
  inicioSemana = inicioSemana === 0 ? 7 : inicioSemana;
  const huecosInicio = inicioSemana - 1;

  const trabajadoresMap = {};
  trabajadores.forEach((t) => {
    trabajadoresMap[String(t.id)] = t;
  });

  const celdas = [];

  for (let i = 0; i < huecosInicio; i += 1) {
    celdas.push(`
      <div style="
        min-height:128px;
        border:1px solid #e2e8f0;
        border-radius:10px;
        background:#f8fafc;
      "></div>
    `);
  }

  for (let dia = 1; dia <= diasEnMes; dia += 1) {
    const iso = toISODate(anio, mes, dia);
    const itemsDia = filtrarAusenciasDelDia(ausencias, iso, trabajadorId);

    celdas.push(`
      <div style="
        min-height:128px;
        border:1px solid #e2e8f0;
        border-radius:10px;
        background:#fff;
        padding:8px;
        display:flex;
        flex-direction:column;
        gap:6px;
      ">
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:8px;
        ">
          <div style="
            font-size:13px;
            font-weight:800;
            color:#0f172a;
          ">
            ${dia}
          </div>
          <div style="
            font-size:11px;
            color:#64748b;
          ">
            ${itemsDia.length ? itemsDia.length : ""}
          </div>
        </div>

        <div style="display:grid; gap:6px;">
          ${itemsDia.length ? itemsDia.slice(0, 4).map((a) => {
            const t = trabajadoresMap[String(a.trabajadorId)];
            const nombre = t?.nombre || "Trabajador";
            const tipoColor = getColorAusencia(a.tipo);
            const tipoBg = getBgAusencia(a.tipo);

            return `
              <div title="${escapeHtmlAttr(nombre)} · ${escapeHtmlAttr(capitaliza(a.tipo))}" style="
                border-left:5px solid ${tipoColor};
                background:${tipoBg};
                color:#0f172a;
                border-radius:8px;
                padding:6px 8px;
                font-size:11px;
                line-height:1.2;
              ">
                <div style="font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${escapeHtml(nombre)}
                </div>
                <div style="color:#475569; margin-top:2px;">
                  ${escapeHtml(capitaliza(a.tipo))}
                </div>
              </div>
            `;
          }).join("") : `
            <div style="
              font-size:11px;
              color:#cbd5e1;
              padding-top:6px;
            ">
              —
            </div>
          `}

          ${itemsDia.length > 4 ? `
            <div style="
              font-size:11px;
              color:#475569;
              font-weight:700;
            ">
              +${itemsDia.length - 4} más
            </div>
          ` : ""}
        </div>
      </div>
    `);
  }

  return `
    <div style="
      border:1px solid #e2e8f0;
      border-radius:14px;
      background:#f8fafc;
      padding:16px;
    ">
      <div style="
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:14px;
        flex-wrap:wrap;
        margin-bottom:14px;
      ">
        <div>
          <div style="font-size:18px; font-weight:800; color:#0f172a;">
            Calendario de ausencias
          </div>
          <div style="font-size:13px; color:#64748b; margin-top:4px;">
            Vista mensual de vacaciones, moscosos, bajas y permisos.
          </div>
        </div>

        <div style="
          display:grid;
          grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));
          gap:10px;
          min-width:min(100%, 620px);
          flex:1;
        ">
          <div>
            <label for="calendarMes" style="${labelStyle()}">Mes</label>
            <select id="calendarMes" style="${input(false)}">
              ${MESES.map((m, i) => `<option value="${i}" ${i === mes ? "selected" : ""}>${escapeHtml(m)}</option>`).join("")}
            </select>
          </div>

          <div>
            <label for="calendarAnio" style="${labelStyle()}">Año</label>
            <select id="calendarAnio" style="${input(false)}">
              ${getYearsOptions(anio).map((y) => `<option value="${y}" ${y === anio ? "selected" : ""}>${y}</option>`).join("")}
            </select>
          </div>

          <div>
            <label for="calendarTrabajador" style="${labelStyle()}">Trabajador</label>
            <select id="calendarTrabajador" style="${input(false)}">
              <option value="todos" ${trabajadorId === "todos" ? "selected" : ""}>Todos</option>
              ${trabajadores.map((t) => `
                <option value="${escapeHtmlAttr(t.id)}" ${String(trabajadorId) === String(t.id) ? "selected" : ""}>
                  ${escapeHtml(t.nombre)}
                </option>
              `).join("")}
            </select>
          </div>

          <div style="display:flex; align-items:flex-end;">
            <button id="calendarHoy" type="button" style="${btnSecundario()} width:100%;">
              Ir a mes actual
            </button>
          </div>
        </div>
      </div>

      <div style="
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        margin-bottom:14px;
      ">
        ${legend("Vacaciones", "#16a34a", "#f0fdf4")}
        ${legend("Moscoso", "#2563eb", "#eff6ff")}
        ${legend("Baja", "#dc2626", "#fef2f2")}
        ${legend("Permiso", "#d97706", "#fffbeb")}
      </div>

      <div style="
        display:grid;
        grid-template-columns:repeat(7, minmax(0, 1fr));
        gap:8px;
      ">
        ${DIAS_SEMANA.map((d) => `
          <div style="
            text-align:center;
            font-size:12px;
            font-weight:800;
            color:#334155;
            padding:6px 0;
          ">
            ${escapeHtml(d)}
          </div>
        `).join("")}
      </div>

      <div style="
        display:grid;
        grid-template-columns:repeat(7, minmax(0, 1fr));
        gap:8px;
      ">
        ${celdas.join("")}
      </div>
    </div>
  `;
}

function formulario(draft, editando) {
  return `
    <div style="display:grid; gap:18px; margin-top:10px;">
      ${bloque(
        "Acceso",
        `
          <div style="${grid()}">
            ${campoInput("Nombre completo", "nombre", draft.nombre)}
            ${campoInput("Usuario", "usuario", draft.usuario)}
            ${campoInput("Contraseña", "password", draft.password)}
            ${campoInput("Puesto", "puesto", draft.puesto)}
            ${campoSelectActivo(draft.activo)}
          </div>
        `
      )}

      ${bloque(
        "Contacto",
        `
          <div style="${grid()}">
            ${campoInput("Teléfono", "telefono", draft.telefono, 'inputmode="tel"')}
            ${campoInput("Email", "email", draft.email, 'inputmode="email"')}
            ${campoInput("DNI", "dni", draft.dni)}
            ${campoInput("Seguridad Social", "nss", draft.nss)}
          </div>
        `
      )}

      ${bloque(
        "Dirección",
        `
          <div style="${grid()}">
            ${campoTipoVia(draft.tipoVia)}
            ${campoInput("Nombre de la vía", "via", draft.via)}
            ${campoInput("Número", "numero", draft.numero)}
            ${campoInput("Portal", "portal", draft.portal)}
            ${campoInput("Piso", "piso", draft.piso)}
            ${campoInput("Puerta", "puerta", draft.puerta)}
            ${campoInput("Código postal", "cp", draft.cp, 'inputmode="numeric"')}
            ${campoInput("Población", "poblacion", draft.poblacion)}
            ${campoInput("Provincia", "provincia", draft.provincia)}
          </div>
        `
      )}

      ${bloque(
        "Datos laborales",
        `
          <div style="${grid()}">
            ${campoInput("Fecha de alta", "fechaAlta", draft.fechaAlta, 'type="date"')}
            ${campoInput("Vacaciones disponibles", "vacDisp", draft.vacDisp, 'inputmode="numeric"')}
            ${campoInput("Vacaciones usadas", "vacUsadas", draft.vacUsadas, 'inputmode="numeric"')}
            ${campoInput("Moscosos disponibles", "mosDisp", draft.mosDisp, 'inputmode="numeric"')}
            ${campoInput("Moscosos usados", "mosUsados", draft.mosUsados, 'inputmode="numeric"')}
          </div>
        `
      )}

      ${bloque(
        "Permisos por módulos",
        `
          <div style="${gridChecks()}">
            ${MODULOS.map(([key, label]) => checkboxModulo(key, label, draft.permisosModulos?.[key])).join("")}
          </div>
        `
      )}

      ${bloque(
        "Permisos por acciones",
        `
          <div style="${gridChecks()}">
            ${ACCIONES.map(([key, label]) => checkboxAccion(key, label, draft.permisosAcciones?.[key])).join("")}
          </div>
        `
      )}

      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button id="btnCrear" type="button" style="${btn()}">
          ${editando ? "Guardar cambios" : "+ Crear trabajador"}
        </button>

        ${editando ? `
          <button id="btnCancelarEdicion" type="button" style="${btnSecundario()}">
            Cancelar edición
          </button>
        ` : ""}
      </div>
    </div>
  `;
}

function renderTrabajador(t) {
  const direccion = getDireccionTexto(t.direccion);
  const estadoColor = t.activo ? "#16a34a" : "#dc2626";
  const ausencias = ordenarAusencias(db.ausencias.getByTrabajador(t.id));
  const resumen = calcularResumenLocal(t.id, ausencias);
  const editAusenciaId = localStorage.getItem(AUSENCIA_EDIT_KEY) || "";

  return `
    <div style="
      padding:14px;
      border:1px solid #ddd;
      border-radius:12px;
      background:#fff;
    ">
      <div style="
        display:flex;
        justify-content:space-between;
        gap:12px;
        align-items:flex-start;
      ">
        <div style="flex:1; min-width:0;">
          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <strong style="font-size:18px;">${escapeHtml(t.nombre)}</strong>
            <span style="
              display:inline-block;
              padding:4px 8px;
              border-radius:999px;
              background:${estadoColor};
              color:#fff;
              font-size:12px;
              font-weight:700;
            ">
              ${t.activo ? "Activo" : "Inactivo"}
            </span>
          </div>

          <div style="font-size:13px; color:#666; margin-top:4px;">
            Usuario: ${escapeHtml(t.usuario || "-")} · ${escapeHtml(t.puesto || "-")}
          </div>

          <div style="margin-top:8px;">
            ${t.telefono ? `
              <a href="tel:${encodeURIComponent(t.telefono)}" style="${link()}">📞 ${escapeHtml(t.telefono)}</a>
              <a href="sms:${encodeURIComponent(t.telefono)}" style="${miniBtn("#0f766e")}">SMS</a>
              <a href="https://wa.me/${encodeURIComponent(normalizaWhatsapp(t.telefono))}" target="_blank" rel="noreferrer" style="${miniBtn("#25D366")}">WhatsApp</a>
            ` : ""}
          </div>

          <div style="margin-top:6px;">
            ${t.email ? `<a href="mailto:${encodeURIComponent(t.email)}" style="${link()}">✉ ${escapeHtml(t.email)}</a>` : ""}
          </div>

          <div style="margin-top:8px; color:#334155;">
            ${direccion ? `
              <div>📍 ${escapeHtml(direccion)}</div>
              <div style="margin-top:6px; display:flex; flex-wrap:wrap; gap:6px;">
                <a href="https://maps.apple.com/?q=${encodeURIComponent(direccion)}" target="_blank" rel="noreferrer" style="${miniBtn("#2563eb")}">Maps</a>
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}" target="_blank" rel="noreferrer" style="${miniBtn("#16a34a")}">Google Maps</a>
                <a href="https://waze.com/ul?q=${encodeURIComponent(direccion)}&navigate=yes" target="_blank" rel="noreferrer" style="${miniBtn("#0ea5e9")}">Waze</a>
              </div>
            ` : ""}
          </div>

          <div style="font-size:12px; margin-top:8px; color:#475569;">
            DNI: ${escapeHtml(t.dni || "-")} | NSS: ${escapeHtml(t.nss || "-")}
          </div>

          <div style="font-size:12px; margin-top:8px; color:#475569;">
            Vacaciones: ${escapeHtml(String(t.vacaciones?.disponibles ?? 0))} disponibles · ${escapeHtml(String(resumen.vacaciones))} usadas · ${escapeHtml(String((t.vacaciones?.disponibles ?? 0) - resumen.vacaciones))} restantes
          </div>

          <div style="font-size:12px; margin-top:4px; color:#475569;">
            Moscosos: ${escapeHtml(String(t.moscosos?.disponibles ?? 0))} disponibles · ${escapeHtml(String(resumen.moscosos))} usados · ${escapeHtml(String((t.moscosos?.disponibles ?? 0) - resumen.moscosos))} restantes
          </div>

          <div style="margin-top:10px;">
            <div style="font-size:12px; font-weight:700; color:#334155; margin-bottom:6px;">Módulos</div>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              ${renderPills(t.permisosModulos)}
            </div>
          </div>

          <div style="margin-top:10px;">
            <div style="font-size:12px; font-weight:700; color:#334155; margin-bottom:6px;">Acciones</div>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              ${renderPills(t.permisosAcciones)}
            </div>
          </div>

          <div style="margin-top:14px;">
            <div style="
              display:flex;
              justify-content:space-between;
              gap:12px;
              align-items:center;
              margin-bottom:8px;
              flex-wrap:wrap;
            ">
              <div style="font-size:12px; font-weight:700; color:#334155;">
                Ausencias
              </div>
              <div style="font-size:12px; color:#64748b;">
                ${ausencias.length} registradas
              </div>
            </div>

            <div style="
              display:grid;
              gap:8px;
              margin-bottom:10px;
              padding:12px;
              border:1px solid #e2e8f0;
              border-radius:10px;
              background:#f8fafc;
            ">
              <div style="
                display:grid;
                grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));
                gap:8px;
              ">
                <select id="aus_tipo_${escapeHtmlAttr(t.id)}" style="${input(false)}">
                  <option value="vacaciones">Vacaciones</option>
                  <option value="moscoso">Moscoso</option>
                  <option value="baja">Baja</option>
                  <option value="permiso">Permiso</option>
                </select>

                <input id="aus_inicio_${escapeHtmlAttr(t.id)}" type="date" style="${input(true)}" />
                <input id="aus_fin_${escapeHtmlAttr(t.id)}" type="date" style="${input(true)}" />
              </div>

              <input
                id="aus_comentario_${escapeHtmlAttr(t.id)}"
                placeholder="Comentario opcional"
                style="${input(false)}"
              />

              <button
                type="button"
                class="btn-add-ausencia"
                data-id="${escapeHtmlAttr(t.id)}"
                style="${btnMiniPrincipal()}"
              >
                + Añadir ausencia
              </button>
            </div>

            ${editAusenciaId ? `
              <div id="editAusenciaBox_${escapeHtmlAttr(t.id)}"></div>
            ` : ""}

            <div style="display:grid; gap:8px;">
              ${ausencias.length ? ausencias.map((a) => renderAusenciaItem(a, t.id)).join("") : `
                <div style="
                  padding:10px 12px;
                  border:1px dashed #cbd5e1;
                  border-radius:10px;
                  background:#f8fafc;
                  color:#64748b;
                  font-size:13px;
                ">
                  Sin ausencias registradas.
                </div>
              `}
            </div>
          </div>
        </div>

        <div style="display:flex; gap:8px; flex:0 0 auto;">
          <button
            class="btn-edit"
            data-id="${escapeHtmlAttr(t.id)}"
            type="button"
            style="${btnEdit()}"
          >
            Editar
          </button>

          <button
            class="btn-delete"
            data-id="${escapeHtmlAttr(t.id)}"
            data-nombre="${escapeHtmlAttr(t.nombre)}"
            type="button"
            style="${btnDelete()}"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderAusenciaItem(a, trabajadorId) {
  const color = getColorAusencia(a.tipo);
  const bg = getBgAusencia(a.tipo);
  const dias = contarDiasEntreFechas(a.fechaInicio, a.fechaFin);
  const editId = localStorage.getItem(AUSENCIA_EDIT_KEY) || "";
  const editando = String(editId) === String(a.id);

  return `
    <div style="
      display:grid;
      gap:8px;
    ">
      <div style="
        display:flex;
        justify-content:space-between;
        gap:10px;
        align-items:flex-start;
        padding:10px 12px;
        border:1px solid #e2e8f0;
        border-left:6px solid ${color};
        border-radius:10px;
        background:${bg};
      ">
        <div style="flex:1; min-width:0;">
          <div style="
            display:flex;
            gap:8px;
            align-items:center;
            flex-wrap:wrap;
            margin-bottom:4px;
          ">
            <div style="font-size:13px; font-weight:700; color:#0f172a;">
              ${escapeHtml(capitaliza(a.tipo))}
            </div>

            <span style="
              display:inline-flex;
              align-items:center;
              justify-content:center;
              padding:3px 8px;
              border-radius:999px;
              background:${getEstadoBg(a.estado)};
              color:#fff;
              font-size:11px;
              font-weight:700;
            ">
              ${escapeHtml(capitaliza(a.estado || "aprobada"))}
            </span>

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
              ${dias} día${dias === 1 ? "" : "s"}
            </span>
          </div>

          <div style="font-size:12px; color:#475569; margin-top:4px;">
            ${formateaFecha(a.fechaInicio)} → ${formateaFecha(a.fechaFin)}
          </div>

          ${a.comentario ? `
            <div style="font-size:12px; color:#64748b; margin-top:4px;">
              ${escapeHtml(a.comentario)}
            </div>
          ` : ""}
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button
            type="button"
            class="btn-edit-ausencia"
            data-id="${escapeHtmlAttr(a.id)}"
            data-trabajador="${escapeHtmlAttr(trabajadorId)}"
            style="${btnEdit()}"
          >
            Editar
          </button>

          <button
            type="button"
            class="btn-delete-ausencia"
            data-id="${escapeHtmlAttr(a.id)}"
            style="${btnDelete()}"
          >
            ✕
          </button>
        </div>
      </div>

      ${editando ? renderEditorAusencia(a, trabajadorId) : ""}
    </div>
  `;
}

function renderEditorAusencia(a, trabajadorId) {
  return `
    <div style="
      padding:12px;
      border:1px solid #bfdbfe;
      border-radius:10px;
      background:#eff6ff;
      display:grid;
      gap:8px;
    ">
      <div style="
        font-size:13px;
        font-weight:800;
        color:#1e3a8a;
      ">
        Editando ausencia
      </div>

      <div style="
        display:grid;
        grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));
        gap:8px;
      ">
        <select id="edit_aus_tipo_${escapeHtmlAttr(a.id)}" style="${input(false)}">
          <option value="vacaciones" ${a.tipo === "vacaciones" ? "selected" : ""}>Vacaciones</option>
          <option value="moscoso" ${a.tipo === "moscoso" ? "selected" : ""}>Moscoso</option>
          <option value="baja" ${a.tipo === "baja" ? "selected" : ""}>Baja</option>
          <option value="permiso" ${a.tipo === "permiso" ? "selected" : ""}>Permiso</option>
        </select>

        <input id="edit_aus_inicio_${escapeHtmlAttr(a.id)}" type="date" value="${escapeHtmlAttr(a.fechaInicio || "")}" style="${input(true)}" />
        <input id="edit_aus_fin_${escapeHtmlAttr(a.id)}" type="date" value="${escapeHtmlAttr(a.fechaFin || "")}" style="${input(true)}" />
      </div>

      <input
        id="edit_aus_comentario_${escapeHtmlAttr(a.id)}"
        value="${escapeHtmlAttr(a.comentario || "")}"
        placeholder="Comentario opcional"
        style="${input(false)}"
      />

      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button
          type="button"
          class="btn-save-ausencia"
          data-id="${escapeHtmlAttr(a.id)}"
          style="${btnMiniPrincipal()}"
        >
          Guardar ausencia
        </button>

        <button
          type="button"
          class="btn-cancel-ausencia"
          data-id="${escapeHtmlAttr(a.id)}"
          style="${btnSecundario()}"
        >
          Cancelar
        </button>
      </div>
    </div>
  `;
}

function activarControlesCalendario() {
  document.getElementById("calendarMes")?.addEventListener("change", guardarEstadoCalendario);
  document.getElementById("calendarAnio")?.addEventListener("change", guardarEstadoCalendario);
  document.getElementById("calendarTrabajador")?.addEventListener("change", guardarEstadoCalendario);

  document.getElementById("calendarHoy")?.addEventListener("click", () => {
    const now = new Date();
    saveCalendarState({
      mes: now.getMonth(),
      anio: now.getFullYear(),
      trabajadorId: "todos"
    });
    refrescar();
  });
}

function guardarEstadoCalendario() {
  saveCalendarState({
    mes: Number(document.getElementById("calendarMes")?.value || new Date().getMonth()),
    anio: Number(document.getElementById("calendarAnio")?.value || new Date().getFullYear()),
    trabajadorId: document.getElementById("calendarTrabajador")?.value || "todos"
  });
  refrescar();
}

function getCalendarState() {
  try {
    const saved = JSON.parse(localStorage.getItem(PERSONAL_CALENDAR_KEY) || "{}");
    const now = new Date();

    return {
      mes: Number.isFinite(saved.mes) ? saved.mes : now.getMonth(),
      anio: Number.isFinite(saved.anio) ? saved.anio : now.getFullYear(),
      trabajadorId: saved.trabajadorId || "todos"
    };
  } catch (error) {
    const now = new Date();
    return {
      mes: now.getMonth(),
      anio: now.getFullYear(),
      trabajadorId: "todos"
    };
  }
}

function saveCalendarState(data) {
  localStorage.setItem(PERSONAL_CALENDAR_KEY, JSON.stringify(data));
}

function getYearsOptions(currentYear) {
  const years = [];
  for (let y = currentYear - 2; y <= currentYear + 3; y += 1) {
    years.push(y);
  }
  return years;
}

function filtrarAusenciasDelDia(lista, isoDate, trabajadorId) {
  return lista.filter((a) => {
    if (trabajadorId !== "todos" && String(a.trabajadorId) !== String(trabajadorId)) {
      return false;
    }
    return fechaDentroDeRango(isoDate, a.fechaInicio, a.fechaFin);
  });
}

function fechaDentroDeRango(fecha, inicio, fin) {
  if (!fecha || !inicio || !fin) return false;
  return fecha >= inicio && fecha <= fin;
}

function legend(texto, borderColor, bgColor) {
  return `
    <div style="
      display:inline-flex;
      align-items:center;
      gap:8px;
      padding:6px 10px;
      border-radius:999px;
      background:#fff;
      border:1px solid #e2e8f0;
      font-size:12px;
      color:#334155;
      font-weight:700;
    ">
      <span style="
        width:12px;
        height:12px;
        border-radius:999px;
        background:${bgColor};
        border:3px solid ${borderColor};
        box-sizing:border-box;
        display:inline-block;
      "></span>
      ${escapeHtml(texto)}
    </div>
  `;
}

function getColorAusencia(tipo) {
  if (tipo === "vacaciones") return "#16a34a";
  if (tipo === "moscoso") return "#2563eb";
  if (tipo === "baja") return "#dc2626";
  return "#d97706";
}

function getBgAusencia(tipo) {
  if (tipo === "vacaciones") return "#f0fdf4";
  if (tipo === "moscoso") return "#eff6ff";
  if (tipo === "baja") return "#fef2f2";
  return "#fffbeb";
}

function getEstadoBg(estado) {
  if (estado === "aprobada") return "#16a34a";
  if (estado === "rechazada") return "#dc2626";
  return "#d97706";
}

function ordenarAusencias(lista) {
  return [...lista].sort((a, b) => {
    const da = new Date(a.fechaInicio || 0).getTime();
    const dbb = new Date(b.fechaInicio || 0).getTime();
    return da - dbb;
  });
}

function calcularResumenLocal(trabajadorId, ausencias = null) {
  const lista = Array.isArray(ausencias) ? ausencias : db.ausencias.getByTrabajador(trabajadorId);

  let vacaciones = 0;
  let moscosos = 0;

  lista.forEach((a) => {
    const dias = contarDiasEntreFechas(a.fechaInicio, a.fechaFin);
    if (a.tipo === "vacaciones") vacaciones += dias;
    if (a.tipo === "moscoso") moscosos += dias;
  });

  return { vacaciones, moscosos };
}

function renderPills(obj) {
  if (!obj) return "";

  return Object.entries(obj)
    .map(([key, value]) => `
      <span style="
        display:inline-flex;
        align-items:center;
        justify-content:center;
        padding:4px 8px;
        border-radius:999px;
        background:${value ? "#16a34a" : "#94a3b8"};
        color:#fff;
        font-size:11px;
        font-weight:700;
      ">
        ${escapeHtml(key)}
      </span>
    `)
    .join("");
}

function activarEventosFormulario() {
  const ids = [
    "nombre", "usuario", "password", "puesto", "activo",
    "telefono", "email", "dni", "nss",
    "tipoVia", "via", "numero", "portal", "piso", "puerta", "cp", "poblacion", "provincia",
    "fechaAlta", "vacDisp", "vacUsadas", "mosDisp", "mosUsados"
  ];

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", guardarDraftDesdeFormulario);
    el.addEventListener("change", guardarDraftDesdeFormulario);
  });

  MODULOS.forEach(([key]) => {
    const el = document.getElementById("mod_" + key);
    if (!el) return;
    el.addEventListener("change", guardarDraftDesdeFormulario);
  });

  ACCIONES.forEach(([key]) => {
    const el = document.getElementById("acc_" + key);
    if (!el) return;
    el.addEventListener("change", guardarDraftDesdeFormulario);
  });

  document.getElementById("btnCrear")?.addEventListener("click", guardarTrabajador);
  document.getElementById("btnCancelarEdicion")?.addEventListener("click", cancelarEdicion);
}

function activarBotonesBorrado() {
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const nombre = btn.dataset.nombre || "este trabajador";

      const ok = window.confirm(`Vas a borrar a ${nombre}. ¿Confirmas?`);
      if (!ok) return;

      db.personal.remove(id);
      refrescar();
    });
  });
}

function activarBotonesEditar() {
  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const lista = db.personal.getAll();
      const trabajador = lista.find((t) => String(t.id) === String(id));
      if (!trabajador) return;

      const d = trabajador.direccion || {};

      const draft = {
        nombre: trabajador.nombre || "",
        usuario: trabajador.usuario || "",
        password: trabajador.password || "",
        puesto: trabajador.puesto || "",
        activo: trabajador.activo !== false,
        telefono: trabajador.telefono || "",
        email: trabajador.email || "",
        tipoVia: d.tipoVia || "",
        via: d.via || "",
        numero: d.numero || "",
        portal: d.portal || "",
        piso: d.piso || "",
        puerta: d.puerta || "",
        cp: d.cp || "",
        poblacion: d.poblacion || "",
        provincia: d.provincia || "",
        dni: trabajador.dni || "",
        nss: trabajador.nss || "",
        fechaAlta: trabajador.fechaAlta || "",
        vacDisp: String(trabajador.vacaciones?.disponibles ?? 30),
        vacUsadas: String(trabajador.vacaciones?.usadas ?? 0),
        mosDisp: String(trabajador.moscosos?.disponibles ?? 2),
        mosUsados: String(trabajador.moscosos?.usados ?? 0),
        permisosModulos: trabajador.permisosModulos || {},
        permisosAcciones: trabajador.permisosAcciones || {}
      };

      localStorage.setItem(PERSONAL_DRAFT_KEY, JSON.stringify(draft));
      localStorage.setItem(PERSONAL_EDIT_KEY, String(id));
      refrescar();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function activarBotonesAusencias() {
  document.querySelectorAll(".btn-add-ausencia").forEach((btn) => {
    btn.addEventListener("click", () => {
      const trabajadorId = btn.dataset.id;

      const tipo = document.getElementById(`aus_tipo_${trabajadorId}`)?.value || "vacaciones";
      const fechaInicio = document.getElementById(`aus_inicio_${trabajadorId}`)?.value || "";
      const fechaFin = document.getElementById(`aus_fin_${trabajadorId}`)?.value || "";
      const comentario = document.getElementById(`aus_comentario_${trabajadorId}`)?.value.trim() || "";

      if (!fechaInicio || !fechaFin) {
        alert("Debes indicar fecha de inicio y fecha fin.");
        return;
      }

      if (new Date(fechaFin) < new Date(fechaInicio)) {
        alert("La fecha fin no puede ser menor que la fecha inicio.");
        return;
      }

      db.ausencias.create({
        trabajadorId,
        tipo,
        fechaInicio,
        fechaFin,
        comentario,
        estado: "aprobada"
      });

      refrescar();
    });
  });

  document.querySelectorAll(".btn-delete-ausencia").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const ok = window.confirm("Vas a borrar esta ausencia. ¿Confirmas?");
      if (!ok) return;

      db.ausencias.remove(id);
      if (String(localStorage.getItem(AUSENCIA_EDIT_KEY) || "") === String(id)) {
        localStorage.removeItem(AUSENCIA_EDIT_KEY);
      }
      refrescar();
    });
  });

  document.querySelectorAll(".btn-edit-ausencia").forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.setItem(AUSENCIA_EDIT_KEY, String(btn.dataset.id));
      refrescar();
    });
  });

  document.querySelectorAll(".btn-cancel-ausencia").forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.removeItem(AUSENCIA_EDIT_KEY);
      refrescar();
    });
  });

  document.querySelectorAll(".btn-save-ausencia").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const tipo = document.getElementById(`edit_aus_tipo_${id}`)?.value || "vacaciones";
      const fechaInicio = document.getElementById(`edit_aus_inicio_${id}`)?.value || "";
      const fechaFin = document.getElementById(`edit_aus_fin_${id}`)?.value || "";
      const comentario = document.getElementById(`edit_aus_comentario_${id}`)?.value.trim() || "";

      if (!fechaInicio || !fechaFin) {
        alert("Debes indicar fecha de inicio y fecha fin.");
        return;
      }

      if (new Date(fechaFin) < new Date(fechaInicio)) {
        alert("La fecha fin no puede ser menor que la fecha inicio.");
        return;
      }

      const ok = window.confirm("Vas a guardar cambios en esta ausencia. ¿Confirmas?");
      if (!ok) return;

      db.ausencias.update(id, {
        tipo,
        fechaInicio,
        fechaFin,
        comentario
      });

      localStorage.removeItem(AUSENCIA_EDIT_KEY);
      refrescar();
    });
  });
}

function guardarTrabajador() {
  const data = {
    nombre: val("nombre"),
    usuario: val("usuario"),
    password: val("password"),
    puesto: val("puesto"),
    activo: document.getElementById("activo")?.value !== "false",
    telefono: val("telefono"),
    email: val("email"),
    direccion: {
      tipoVia: val("tipoVia"),
      via: val("via"),
      numero: val("numero"),
      portal: val("portal"),
      piso: val("piso"),
      puerta: val("puerta"),
      cp: val("cp"),
      poblacion: val("poblacion"),
      provincia: val("provincia")
    },
    dni: val("dni"),
    nss: val("nss"),
    fechaAlta: val("fechaAlta"),
    vacaciones: {
      disponibles: numero("vacDisp", 30),
      usadas: numero("vacUsadas", 0)
    },
    moscosos: {
      disponibles: numero("mosDisp", 2),
      usados: numero("mosUsados", 0)
    },
    permisosModulos: leerPermisosModulos(),
    permisosAcciones: leerPermisosAcciones()
  };

  if (!data.nombre) {
    alert("El nombre es obligatorio.");
    return;
  }

  const editId = localStorage.getItem(PERSONAL_EDIT_KEY);

  if (editId) {
    const ok = window.confirm("Vas a guardar cambios en este trabajador. ¿Confirmas?");
    if (!ok) return;

    db.personal.update(editId, data);
    cancelarEdicion(false);
    refrescar();
    return;
  }

  db.personal.create(data);
  clearDraft();
  refrescar();
}

function leerPermisosModulos() {
  const out = {};
  MODULOS.forEach(([key]) => {
    out[key] = !!document.getElementById("mod_" + key)?.checked;
  });
  return out;
}

function leerPermisosAcciones() {
  const out = {};
  ACCIONES.forEach(([key]) => {
    out[key] = !!document.getElementById("acc_" + key)?.checked;
  });
  return out;
}

function cancelarEdicion(refresca = true) {
  localStorage.removeItem(PERSONAL_EDIT_KEY);
  clearDraft();
  if (refresca) refrescar();
}

function guardarDraftDesdeFormulario() {
  const draft = {
    nombre: val("nombre"),
    usuario: val("usuario"),
    password: val("password"),
    puesto: val("puesto"),
    activo: document.getElementById("activo")?.value !== "false",
    telefono: val("telefono"),
    email: val("email"),
    tipoVia: val("tipoVia"),
    via: val("via"),
    numero: val("numero"),
    portal: val("portal"),
    piso: val("piso"),
    puerta: val("puerta"),
    cp: val("cp"),
    poblacion: val("poblacion"),
    provincia: val("provincia"),
    dni: val("dni"),
    nss: val("nss"),
    fechaAlta: val("fechaAlta"),
    vacDisp: val("vacDisp"),
    vacUsadas: val("vacUsadas"),
    mosDisp: val("mosDisp"),
    mosUsados: val("mosUsados"),
    permisosModulos: leerPermisosModulos(),
    permisosAcciones: leerPermisosAcciones()
  };

  localStorage.setItem(PERSONAL_DRAFT_KEY, JSON.stringify(draft));
}

function getDraft() {
  try {
    const data = JSON.parse(localStorage.getItem(PERSONAL_DRAFT_KEY) || "{}");
    return {
      nombre: data.nombre || "",
      usuario: data.usuario || "",
      password: data.password || "",
      puesto: data.puesto || "",
      activo: data.activo !== false,
      telefono: data.telefono || "",
      email: data.email || "",
      tipoVia: data.tipoVia || "",
      via: data.via || "",
      numero: data.numero || "",
      portal: data.portal || "",
      piso: data.piso || "",
      puerta: data.puerta || "",
      cp: data.cp || "",
      poblacion: data.poblacion || "",
      provincia: data.provincia || "",
      dni: data.dni || "",
      nss: data.nss || "",
      fechaAlta: data.fechaAlta || "",
      vacDisp: data.vacDisp || "",
      vacUsadas: data.vacUsadas || "",
      mosDisp: data.mosDisp || "",
      mosUsados: data.mosUsados || "",
      permisosModulos: data.permisosModulos || {},
      permisosAcciones: data.permisosAcciones || {}
    };
  } catch (error) {
    return {};
  }
}

function clearDraft() {
  localStorage.removeItem(PERSONAL_DRAFT_KEY);
}

function refrescar() {
  const container = document.getElementById("viewContainer");
  if (!container) return;
  container.innerHTML = renderPersonal();
}

function val(id) {
  return document.getElementById(id)?.value.trim() || "";
}

function numero(id, defecto) {
  const raw = val(id);
  if (raw === "") return defecto;
  const n = Number(raw);
  return Number.isFinite(n) ? n : defecto;
}

function formateaFecha(fecha) {
  if (!fecha) return "-";
  const d = new Date(fecha);
  if (isNaN(d)) return fecha;
  return d.toLocaleDateString("es-ES");
}

function toISODate(anio, mes, dia) {
  const m = String(mes + 1).padStart(2, "0");
  const d = String(dia).padStart(2, "0");
  return `${anio}-${m}-${d}`;
}

function grid() {
  return `
    display:grid;
    grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));
    gap:10px;
  `;
}

function gridChecks() {
  return `
    display:grid;
    grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));
    gap:10px;
  `;
}

function checkWrap() {
  return `
    display:flex;
    gap:8px;
    align-items:center;
    padding:10px 12px;
    border:1px solid #dbe4ee;
    border-radius:10px;
    background:#fff;
    font-size:14px;
    color:#0f172a;
    font-weight:700;
  `;
}

function labelStyle() {
  return `
    display:block;
    margin-bottom:6px;
    font-size:13px;
    font-weight:700;
    color:#334155;
  `;
}

function input(isDate = false) {
  return `
    width:100%;
    min-width:0;
    padding:${isDate ? "0 12px" : "10px 12px"};
    height:46px;
    border:1px solid #ccc;
    border-radius:10px;
    background:#fff;
    box-sizing:border-box;
  `;
}

function btn() {
  return `
    padding:12px 18px;
    background:#2563eb;
    color:#fff;
    border:none;
    border-radius:10px;
    font-weight:700;
    cursor:pointer;
  `;
}

function btnSecundario() {
  return `
    padding:12px 18px;
    background:#64748b;
    color:#fff;
    border:none;
    border-radius:10px;
    font-weight:700;
    cursor:pointer;
  `;
}

function btnEdit() {
  return `
    background:#2563eb;
    color:#fff;
    border:none;
    padding:8px 12px;
    border-radius:8px;
    cursor:pointer;
    font-weight:700;
  `;
}

function btnDelete() {
  return `
    background:#dc2626;
    color:#fff;
    border:none;
    padding:8px 10px;
    border-radius:8px;
    cursor:pointer;
  `;
}

function btnMiniPrincipal() {
  return `
    padding:10px 14px;
    background:#2563eb;
    color:#fff;
    border:none;
    border-radius:10px;
    font-weight:700;
    cursor:pointer;
  `;
}

function miniBtn(color) {
  return `
    padding:4px 8px;
    background:${color};
    color:#fff;
    border-radius:6px;
    text-decoration:none;
    font-size:12px;
    font-weight:700;
    display:inline-flex;
    align-items:center;
    justify-content:center;
  `;
}

function link() {
  return `
    color:#2563eb;
    display:inline-block;
    margin-right:10px;
    text-decoration:none;
    font-weight:700;
  `;
}

function normalizaWhatsapp(telefono) {
  let t = String(telefono).replace(/[^\d+]/g, "");
  if (t.startsWith("+")) return t.slice(1);
  if (t.startsWith("34")) return t;
  return "34" + t;
}

function capitaliza(texto) {
  const t = String(texto || "");
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
}

function escapeHtml(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeHtmlAttr(texto) {
  return escapeHtml(texto);
}
