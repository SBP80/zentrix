import { db } from "../db.js";
import { getDireccionTexto } from "../data/personal.js";

const EDIT_ID_KEY = "zentryx_personal_edit_id";
const EDIT_AUSENCIA_KEY = "zentryx_ausencia_edit_id";
const SESSION_USER_KEY = "zentrix_session_user_v1";
const NEW_FORM_OPEN_KEY = "zentryx_personal_new_form_open";
const FORM_TAB_KEY = "zentryx_personal_form_tab";
const SEARCH_KEY = "zentryx_personal_search";
const FILTER_STATUS_KEY = "zentryx_personal_filter_status";
const ORDER_KEY = "zentryx_personal_order";
const QUICK_FILTER_KEY = "zentryx_personal_quick_filter";

export function renderPersonal() {
  const usuarioActual = getUsuarioActual();
  const acciones = usuarioActual.permisosAcciones || {};
  const puedeVerTodo = !!acciones.verTodo;

  const todos = db.personal.getAll();
  const baseTrabajadores = puedeVerTodo
    ? todos
    : todos.filter((t) => String(t.id) === String(usuarioActual.id));

  const editId = localStorage.getItem(EDIT_ID_KEY) || "";
  const editando = baseTrabajadores.find((t) => String(t.id) === String(editId)) || null;
  const newFormOpen = localStorage.getItem(NEW_FORM_OPEN_KEY) === "true";

  const search = getSearchText();
const status = getStatusFilter();
const order = getOrderBy();
const quickFilter = getQuickFilter();

const trabajadores = filtrarTrabajadores(baseTrabajadores, search, status, order, quickFilter);
const totalTrabajadores = baseTrabajadores.length;
const totalActivos = baseTrabajadores.filter((t) => t.activo !== false).length;
const totalInactivos = baseTrabajadores.filter((t) => t.activo === false).length;
const totalConAusencias = baseTrabajadores.filter((t) => db.ausencias.getByTrabajador(t.id).length > 0).length;
const totalAusenciasPendientes = db.ausencias
  .getAll()
  .filter((a) => a.estado === "pendiente" && baseTrabajadores.some((t) => String(t.id) === String(a.trabajadorId)))
  .length;

  setTimeout(() => {
    activarEventosPersonal();
  }, 0);

  return `
    <div style="max-width:1240px;width:100%;">
      <div class="panel-card">
        <div style="margin-bottom:18px;">
          <h3 style="margin:0 0 6px 0;">Personal</h3>
          <p style="margin:0;color:#64748b;">Equipo, roles y permisos.</p>
        </div>
        <div style="
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
  gap:10px;
  margin-bottom:18px;
">
  ${summaryCard("Total", totalTrabajadores, "#0f172a")}
  ${summaryCard("Activos", totalActivos, "#16a34a")}
  ${summaryCard("Inactivos", totalInactivos, "#dc2626")}
  ${summaryCard("Con ausencias", totalConAusencias, "#2563eb")}
  ${summaryCard("Pendientes", totalAusenciasPendientes, "#d97706")}
</div>

        ${renderBloqueFormulario(editando, acciones, usuarioActual, newFormOpen)}

        <div style="
  margin-top:18px;
  padding:12px;
  border:1px solid #e2e8f0;
  border-radius:12px;
  background:#f8fafc;
">
  <div style="
    display:grid;
    grid-template-columns:minmax(240px,1fr) 180px 220px auto;
    gap:10px;
    align-items:end;
  ">
    <div>
      <label for="personal_search" style="${labelStyle()}">Buscar trabajador</label>
      <input
        id="personal_search"
        value="${escapeHtmlAttr(search)}"
        placeholder="Nombre, usuario, puesto, email, teléfono..."
        style="${inputStyle()}"
      >
    </div>

    <div>
      <label for="personal_status" style="${labelStyle()}">Estado</label>
      <select id="personal_status" style="${inputStyle()}">
        <option value="todos" ${status === "todos" ? "selected" : ""}>Todos</option>
        <option value="activos" ${status === "activos" ? "selected" : ""}>Activos</option>
        <option value="inactivos" ${status === "inactivos" ? "selected" : ""}>Inactivos</option>
      </select>
    </div>

    <div>
      <label for="personal_order" style="${labelStyle()}">Ordenar</label>
      <select id="personal_order" style="${inputStyle()}">
        <option value="nombre_asc" ${order === "nombre_asc" ? "selected" : ""}>Nombre A-Z</option>
        <option value="nombre_desc" ${order === "nombre_desc" ? "selected" : ""}>Nombre Z-A</option>
        <option value="alta_desc" ${order === "alta_desc" ? "selected" : ""}>Alta más reciente</option>
        <option value="alta_asc" ${order === "alta_asc" ? "selected" : ""}>Alta más antigua</option>
      </select>
    </div>

    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <button id="btn_limpiar_filtros_personal" type="button" style="${btnSecundario()}">
        Limpiar
      </button>
    </div>
  </div>
  <div style="
  margin-top:12px;
  display:flex;
  gap:8px;
  flex-wrap:wrap;
">
  ${quickChip("todos", "Todos", quickFilter === "todos")}
  ${quickChip("activos", "Activos", quickFilter === "activos")}
  ${quickChip("inactivos", "Inactivos", quickFilter === "inactivos")}
  ${quickChip("con_ausencias", "Con ausencias", quickFilter === "con_ausencias")}
  ${quickChip("sin_ausencias", "Sin ausencias", quickFilter === "sin_ausencias")}
</div>
  <div style="
    margin-top:10px;
    display:flex;
    justify-content:space-between;
    gap:10px;
    flex-wrap:wrap;
    font-size:12px;
    color:#64748b;
  ">
    <div>Mostrando ${trabajadores.length} de ${baseTrabajadores.length} trabajadores</div>
    <div>
      Búsqueda: ${search ? escapeHtml(search) : "ninguna"} ·
      Estado: ${escapeHtml(status)} ·
      Orden: ${escapeHtml(order)} ·
      Chip: ${escapeHtml(quickFilter)}
   </div>
  </div>
</div>

        <div style="margin-top:20px;display:grid;gap:14px;">
          ${
            trabajadores.length
              ? trabajadores.map((t) => renderTrabajador(t, acciones)).join("")
              : `
                <div style="
                  padding:14px;
                  border:1px dashed #cbd5e1;
                  border-radius:12px;
                  color:#64748b;
                  background:#f8fafc;
                ">
                  No hay trabajadores que coincidan con el filtro.
                </div>
              `
          }
        </div>
      </div>
    </div>
  `;
}

function renderBloqueFormulario(editando, acciones, usuarioActual, newFormOpen) {
  const puedeCrear = !!acciones.crear;
  const puedeEditar = !!acciones.editar;

  if (!puedeCrear && !puedeEditar) return "";

  if (!editando && !newFormOpen) {
    return `
      <div style="margin-bottom:18px;">
        <button id="btn_mostrar_nuevo_trabajador" type="button" style="${btnPrincipal()}">
          + Nuevo trabajador
        </button>
      </div>
    `;
  }

  return renderFormularioTrabajador(editando, acciones, usuarioActual);
}

function renderFormularioTrabajador(editando, acciones, usuarioActual) {
  const esEdicion = !!editando;
  if (esEdicion && !acciones.editar) return "";
  if (!esEdicion && !acciones.crear) return "";

  const t = editando || {};
  const d = t.direccion || {};
  const vacaciones = t.vacaciones || {};
  const moscosos = t.moscosos || {};
  const mod = t.permisosModulos || {};
  const acc = t.permisosAcciones || {};

  const puedeTocarPermisos =
    !!acciones.aprobar || !editando || String(usuarioActual.id) !== String(t.id);

  const tab = getFormTab();

  return `
    <div style="
      margin-bottom:18px;
      border:1px solid #e2e8f0;
      border-radius:16px;
      background:#ffffff;
      overflow:hidden;
    ">
      <div style="
        background:#ffffff;
        border-bottom:1px solid #e2e8f0;
        padding:14px 16px;
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:12px;
        flex-wrap:wrap;
      ">
        <div>
          <div style="font-size:16px;font-weight:800;color:#0f172a;">
            ${editando ? "Editar trabajador" : "Nuevo trabajador"}
          </div>
          <div style="font-size:12px;color:#64748b;margin-top:4px;">
            Formulario por pestañas.
          </div>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button id="btn_guardar_trabajador" type="button" style="${btnPrincipal()}">
            ${editando ? "Guardar cambios" : "Añadir trabajador"}
          </button>

          ${
            editando
              ? `<button id="btn_cancelar_trabajador" type="button" style="${btnSecundario()}">Cancelar edición</button>`
              : `<button id="btn_ocultar_nuevo_trabajador" type="button" style="${btnSecundario()}">Ocultar formulario</button>`
          }
        </div>
      </div>

      <div style="padding:16px;">
        <div style="
          display:flex;
          gap:8px;
          flex-wrap:wrap;
          margin-bottom:14px;
        ">
          ${tabBtn("datos", "Datos", tab === "datos")}
          ${tabBtn("direccion", "Dirección", tab === "direccion")}
          ${tabBtn("permisos", "Permisos", tab === "permisos")}
          ${tabBtn("resumen", "Resumen", tab === "resumen")}
        </div>

        ${
          tab === "datos"
            ? `
              <div style="${sectionBox()}">
                <div style="${sectionTitle()}">Datos básicos</div>
                <div style="${grid4()}">
                  ${campo("Nombre completo", "p_nombre", t.nombre || "")}
                  ${campo("Usuario", "p_usuario", t.usuario || "")}
                  ${campo("Contraseña", "p_password", t.password || "")}
                  ${campo("Puesto", "p_puesto", t.puesto || "")}
                  ${campoSelectActivo(t.activo !== false)}
                  ${campo("Teléfono", "p_telefono", t.telefono || "", 'inputmode="tel"')}
                  ${campo("Email", "p_email", t.email || "", 'inputmode="email"')}
                  ${campo("Fecha de alta", "p_fechaAlta", t.fechaAlta || "", 'type="date"')}
                  ${campo("DNI", "p_dni", t.dni || "")}
                  ${campo("Seguridad Social", "p_nss", t.nss || "")}
                  ${campo("Vacaciones disponibles", "p_vac", String(vacaciones.disponibles ?? 30), 'type="number"')}
                  ${campo("Moscosos disponibles", "p_mos", String(moscosos.disponibles ?? 2), 'type="number"')}
                </div>
              </div>
            `
            : ""
        }

        ${
          tab === "direccion"
            ? `
              <div style="${sectionBox()}">
                <div style="${sectionTitle()}">Dirección</div>
                <div style="${grid4()}">
                  ${campo("Tipo de vía", "p_tipoVia", d.tipoVia || "")}
                  ${campo("Nombre de la vía", "p_via", d.via || "")}
                  ${campo("Número", "p_numero", d.numero || "")}
                  ${campo("Portal", "p_portal", d.portal || "")}
                  ${campo("Piso", "p_piso", d.piso || "")}
                  ${campo("Puerta", "p_puerta", d.puerta || "")}
                  ${campo("Código postal", "p_cp", d.cp || "")}
                  ${campo("Población", "p_poblacion", d.poblacion || "")}
                  ${campo("Provincia", "p_provincia", d.provincia || "")}
                </div>
              </div>
            `
            : ""
        }

        ${
          tab === "permisos"
            ? `
              <div style="display:grid;gap:14px;">
                <div style="${sectionBox()}${puedeTocarPermisos ? "" : "opacity:0.68;"}">
                  <div style="${sectionTitle()}">Permisos por módulos</div>
                  <div style="${gridChecks()}">
                    ${check("mod_inicio", "Inicio", !!mod.inicio, !puedeTocarPermisos)}
                    ${check("mod_agenda", "Agenda", !!mod.agenda, !puedeTocarPermisos)}
                    ${check("mod_personal", "Personal", !!mod.personal, !puedeTocarPermisos)}
                    ${check("mod_configuracion", "Configuración", !!mod.configuracion, !puedeTocarPermisos)}
                    ${check("mod_vehiculos", "Vehículos", !!mod.vehiculos, !puedeTocarPermisos)}
                    ${check("mod_herramientas", "Herramientas", !!mod.herramientas, !puedeTocarPermisos)}
                    ${check("mod_clientes", "Clientes", !!mod.clientes, !puedeTocarPermisos)}
                    ${check("mod_obras", "Obras", !!mod.obras, !puedeTocarPermisos)}
                  </div>
                </div>

                <div style="${sectionBox()}${puedeTocarPermisos ? "" : "opacity:0.68;"}">
                  <div style="${sectionTitle()}">Permisos por acciones</div>
                  <div style="${gridChecks()}">
                    ${check("acc_verTodo", "Ver todo", !!acc.verTodo, !puedeTocarPermisos)}
                    ${check("acc_crear", "Crear", !!acc.crear, !puedeTocarPermisos)}
                    ${check("acc_editar", "Editar", !!acc.editar, !puedeTocarPermisos)}
                    ${check("acc_borrar", "Borrar", !!acc.borrar, !puedeTocarPermisos)}
                    ${check("acc_aprobar", "Aprobar", !!acc.aprobar, !puedeTocarPermisos)}
                  </div>
                </div>
              </div>
            `
            : ""
        }

        ${
          tab === "resumen"
            ? `
              <div style="display:grid;gap:14px;">
                <div style="${sectionBox()}">
                  <div style="${sectionTitle()}">Resumen rápido</div>
                  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">
                    <div style="${miniInfoBox()}">Nombre: ${escapeHtml(t.nombre || "-")}</div>
                    <div style="${miniInfoBox()}">Usuario: ${escapeHtml(t.usuario || "-")}</div>
                    <div style="${miniInfoBox()}">Puesto: ${escapeHtml(t.puesto || "-")}</div>
                    <div style="${miniInfoBox()}">Estado: ${t.activo === false ? "Inactivo" : "Activo"}</div>
                    <div style="${miniInfoBox()}">Vacaciones disponibles: ${escapeHtml(String(vacaciones.disponibles ?? 30))}</div>
                    <div style="${miniInfoBox()}">Moscosos disponibles: ${escapeHtml(String(moscosos.disponibles ?? 2))}</div>
                    <div style="${miniInfoBox()}">Email: ${escapeHtml(t.email || "-")}</div>
                    <div style="${miniInfoBox()}">Teléfono: ${escapeHtml(t.telefono || "-")}</div>
                    <div style="${miniInfoBox()}">Dirección: ${escapeHtml(getDireccionTexto(d) || "-")}</div>
                  </div>
                </div>
              </div>
            `
            : ""
        }
      </div>
    </div>
  `;
}

function renderTrabajador(t, acciones) {
  const ausencias = ordenarAusencias(db.ausencias.getByTrabajador(t.id));
  const resumen = calcularResumenTrabajador(t, ausencias);
  const direccionTexto = getDireccionTexto(t.direccion || {});
  const mod = t.permisosModulos || {};
  const acc = t.permisosAcciones || {};

  return `
    <div style="
      padding:14px;
      border:1px solid #e2e8f0;
      border-radius:14px;
      background:#fff;
    ">
      <div style="
        display:flex;
        justify-content:space-between;
        gap:12px;
        align-items:flex-start;
        flex-wrap:wrap;
      ">
        <div style="flex:1;min-width:280px;">
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <div style="font-size:18px;font-weight:800;color:#0f172a;">
              ${escapeHtml(t.nombre || "Sin nombre")}
            </div>
            <span style="
              display:inline-flex;
              align-items:center;
              justify-content:center;
              padding:4px 8px;
              border-radius:999px;
              background:${t.activo === false ? "#dc2626" : "#16a34a"};
              color:#fff;
              font-size:11px;
              font-weight:700;
            ">
              ${t.activo === false ? "Inactivo" : "Activo"}
            </span>
          </div>

          <div style="margin-top:4px;font-size:13px;color:#64748b;">
            ${escapeHtml(t.usuario || "-")} · ${escapeHtml(t.puesto || "-")}
          </div>

          <div style="
            margin-top:10px;
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
            gap:6px 12px;
            font-size:13px;
            color:#334155;
          ">
            ${t.telefono ? `<div>📞 <a href="tel:${encodeURIComponent(t.telefono)}" style="${linkStyle()}">${escapeHtml(t.telefono)}</a></div>` : ""}
            ${t.email ? `<div>✉ <a href="mailto:${encodeURIComponent(t.email)}" style="${linkStyle()}">${escapeHtml(t.email)}</a></div>` : ""}
            ${direccionTexto ? `<div style="grid-column:1 / -1;">📍 ${escapeHtml(direccionTexto)}</div>` : ""}
            ${t.dni ? `<div>DNI: ${escapeHtml(t.dni)}</div>` : ""}
            ${t.nss ? `<div>NSS: ${escapeHtml(t.nss)}</div>` : ""}
            ${t.fechaAlta ? `<div>Alta: ${escapeHtml(t.fechaAlta)}</div>` : ""}
          </div>

          <div style="
            margin-top:10px;
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
            gap:8px;
          ">
            <div style="${miniInfoBox()}">
              Vacaciones: ${escapeHtml(String(resumen.vacacionesDisponibles))} disponibles · ${escapeHtml(String(resumen.vacacionesUsadas))} usadas · ${escapeHtml(String(resumen.vacacionesRestantes))} restantes
            </div>
            <div style="${miniInfoBox()}">
              Moscosos: ${escapeHtml(String(resumen.moscososDisponibles))} disponibles · ${escapeHtml(String(resumen.moscososUsados))} usados · ${escapeHtml(String(resumen.moscososRestantes))} restantes
            </div>
          </div>

          <div style="
            margin-top:10px;
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
            gap:10px;
          ">
            <div>
              <div style="font-size:12px;font-weight:700;color:#334155;margin-bottom:6px;">Módulos</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                ${pill("Inicio", mod.inicio)}
                ${pill("Agenda", mod.agenda)}
                ${pill("Personal", mod.personal)}
                ${pill("Configuración", mod.configuracion)}
                ${pill("Vehículos", mod.vehiculos)}
                ${pill("Herramientas", mod.herramientas)}
                ${pill("Clientes", mod.clientes)}
                ${pill("Obras", mod.obras)}
              </div>
            </div>

            <div>
              <div style="font-size:12px;font-weight:700;color:#334155;margin-bottom:6px;">Acciones</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                ${pill("Ver todo", acc.verTodo)}
                ${pill("Crear", acc.crear)}
                ${pill("Editar", acc.editar)}
                ${pill("Borrar", acc.borrar)}
                ${pill("Aprobar", acc.aprobar)}
              </div>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${acciones.editar ? `
            <button type="button" class="btn-editar-trabajador" data-id="${escapeHtmlAttr(t.id)}" style="${btnEditar()}">
              Editar
            </button>
          ` : ""}

          ${acciones.borrar ? `
            <button type="button" class="btn-borrar-trabajador" data-id="${escapeHtmlAttr(t.id)}" data-nombre="${escapeHtmlAttr(t.nombre || "")}" style="${btnBorrar()}">
              ✕
            </button>
          ` : ""}
        </div>
      </div>

      <div style="margin-top:14px;padding-top:14px;border-top:1px solid #e2e8f0;">
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          flex-wrap:wrap;
          margin-bottom:10px;
        ">
          <div style="font-size:13px;font-weight:800;color:#0f172a;">
            Ausencias
          </div>
          <div style="font-size:12px;color:#64748b;">
            ${ausencias.length} registradas
          </div>
        </div>

        ${acciones.crear ? `
          <div style="
            display:grid;
            gap:8px;
            padding:12px;
            border:1px solid #e2e8f0;
            border-radius:10px;
            background:#f8fafc;
            margin-bottom:10px;
          ">
            <div style="
              display:grid;
              grid-template-columns:repeat(auto-fit,minmax(160px,1fr));
              gap:8px;
            ">
              <select id="aus_tipo_${escapeHtmlAttr(t.id)}" style="${inputStyle()}">
                <option value="vacaciones">Vacaciones</option>
                <option value="moscoso">Moscoso</option>
                <option value="baja">Baja</option>
                <option value="permiso">Permiso</option>
              </select>

              <select id="aus_estado_${escapeHtmlAttr(t.id)}" style="${inputStyle()}">
                <option value="aprobada">Aprobada</option>
                <option value="pendiente">Pendiente</option>
                <option value="rechazada">Rechazada</option>
              </select>

              <input id="aus_inicio_${escapeHtmlAttr(t.id)}" type="date" style="${inputStyle()}">
              <input id="aus_fin_${escapeHtmlAttr(t.id)}" type="date" style="${inputStyle()}">
            </div>

            <input id="aus_comentario_${escapeHtmlAttr(t.id)}" placeholder="Comentario opcional" style="${inputStyle()}">

            <button type="button" class="btn-add-ausencia" data-id="${escapeHtmlAttr(t.id)}" style="${btnPrincipal()}">
              Añadir ausencia
            </button>
          </div>
        ` : ""}

        <div style="display:grid;gap:8px;">
          ${
            ausencias.length
              ? ausencias.map((a) => renderAusencia(a, acciones)).join("")
              : `
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
              `
          }
        </div>
      </div>
    </div>
  `;
}

function renderAusencia(a, acciones) {
  const dias = contarDias(a.fechaInicio, a.fechaFin);
  const editando = String(localStorage.getItem(EDIT_AUSENCIA_KEY) || "") === String(a.id);

  return `
    <div style="
      display:flex;
      justify-content:space-between;
      gap:10px;
      align-items:flex-start;
      padding:10px 12px;
      border:1px solid #e2e8f0;
      border-left:6px solid ${colorTipo(a.tipo)};
      border-radius:10px;
      background:${fondoTipo(a.tipo)};
    ">
      <div style="flex:1;min-width:0;">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <div style="font-size:13px;font-weight:700;color:#0f172a;">
            ${escapeHtml(capitaliza(a.tipo))}
          </div>

          <span style="
            display:inline-flex;
            align-items:center;
            justify-content:center;
            padding:3px 8px;
            border-radius:999px;
            background:${colorEstado(a.estado)};
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

        <div style="font-size:12px;color:#475569;margin-top:4px;">
          ${escapeHtml(a.fechaInicio || "-")} → ${escapeHtml(a.fechaFin || "-")}
        </div>

        ${a.comentario ? `<div style="font-size:12px;color:#64748b;margin-top:4px;">${escapeHtml(a.comentario)}</div>` : ""}

        ${editando ? renderEditorAusencia(a) : ""}
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${acciones.editar ? `
          <button type="button" class="btn-editar-ausencia" data-id="${escapeHtmlAttr(a.id)}" style="${btnEditar()}">
            Editar
          </button>
        ` : ""}

        ${acciones.borrar ? `
          <button type="button" class="btn-borrar-ausencia" data-id="${escapeHtmlAttr(a.id)}" style="${btnBorrar()}">
            ✕
          </button>
        ` : ""}
      </div>
    </div>
  `;
}

function renderEditorAusencia(a) {
  return `
    <div style="
      margin-top:12px;
      display:grid;
      gap:8px;
      padding:12px;
      border:1px solid #cbd5e1;
      border-radius:10px;
      background:#ffffff;
    ">
      <div style="
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(160px,1fr));
        gap:8px;
      ">
        <select id="edit_aus_tipo_${escapeHtmlAttr(a.id)}" style="${inputStyle()}">
          <option value="vacaciones" ${a.tipo === "vacaciones" ? "selected" : ""}>Vacaciones</option>
          <option value="moscoso" ${a.tipo === "moscoso" ? "selected" : ""}>Moscoso</option>
          <option value="baja" ${a.tipo === "baja" ? "selected" : ""}>Baja</option>
          <option value="permiso" ${a.tipo === "permiso" ? "selected" : ""}>Permiso</option>
        </select>

        <select id="edit_aus_estado_${escapeHtmlAttr(a.id)}" style="${inputStyle()}">
          <option value="aprobada" ${a.estado === "aprobada" ? "selected" : ""}>Aprobada</option>
          <option value="pendiente" ${a.estado === "pendiente" ? "selected" : ""}>Pendiente</option>
          <option value="rechazada" ${a.estado === "rechazada" ? "selected" : ""}>Rechazada</option>
        </select>

        <input id="edit_aus_inicio_${escapeHtmlAttr(a.id)}" type="date" value="${escapeHtmlAttr(a.fechaInicio || "")}" style="${inputStyle()}">
        <input id="edit_aus_fin_${escapeHtmlAttr(a.id)}" type="date" value="${escapeHtmlAttr(a.fechaFin || "")}" style="${inputStyle()}">
      </div>

      <input id="edit_aus_comentario_${escapeHtmlAttr(a.id)}" value="${escapeHtmlAttr(a.comentario || "")}" placeholder="Comentario opcional" style="${inputStyle()}">

      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button type="button" class="btn-guardar-ausencia" data-id="${escapeHtmlAttr(a.id)}" style="${btnPrincipal()}">
          Guardar ausencia
        </button>
        <button type="button" class="btn-cancelar-editar-ausencia" style="${btnSecundario()}">
          Cancelar
        </button>
      </div>
    </div>
  `;
}

function activarEventosPersonal() {
  const usuarioActual = getUsuarioActual();
  const acciones = usuarioActual.permisosAcciones || {};

  document.getElementById("btn_mostrar_nuevo_trabajador")?.addEventListener("click", () => {
    localStorage.setItem(NEW_FORM_OPEN_KEY, "true");
    localStorage.removeItem(EDIT_ID_KEY);
    setFormTab("datos");
    refrescarPersonal();
  });

  document.getElementById("btn_ocultar_nuevo_trabajador")?.addEventListener("click", () => {
    localStorage.removeItem(NEW_FORM_OPEN_KEY);
    refrescarPersonal();
  });

  document.querySelectorAll(".btn-form-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      setFormTab(btn.dataset.tab || "datos");
      refrescarPersonal();
    });
  });

  const searchEl = document.getElementById("personal_search");
  searchEl?.addEventListener("input", () => {
    setSearchText(searchEl.value || "");
    refrescarPersonal();
  });

  const statusEl = document.getElementById("personal_status");
statusEl?.addEventListener("change", () => {
  setStatusFilter(statusEl.value || "todos");
  refrescarPersonal();
});

const orderEl = document.getElementById("personal_order");
orderEl?.addEventListener("change", () => {
  setOrderBy(orderEl.value || "nombre_asc");
  refrescarPersonal();
});
  document.querySelectorAll(".btn-quick-filter").forEach((btn) => {
  btn.addEventListener("click", () => {
    setQuickFilter(btn.dataset.quick || "todos");
    refrescarPersonal();
  });
});

document.getElementById("btn_limpiar_filtros_personal")?.addEventListener("click", () => {
  setSearchText("");
  setStatusFilter("todos");
  setOrderBy("nombre_asc");
  setQuickFilter("todos");
  refrescarPersonal();
});

  if (acciones.crear || acciones.editar) {
    document.getElementById("btn_guardar_trabajador")?.addEventListener("click", guardarTrabajador);

    document.getElementById("btn_cancelar_trabajador")?.addEventListener("click", () => {
      localStorage.removeItem(EDIT_ID_KEY);
      localStorage.removeItem(NEW_FORM_OPEN_KEY);
      setFormTab("datos");
      refrescarPersonal();
    });
  }

  if (acciones.editar) {
    document.querySelectorAll(".btn-editar-trabajador").forEach((btn) => {
      btn.addEventListener("click", () => {
        localStorage.setItem(EDIT_ID_KEY, String(btn.dataset.id));
        localStorage.removeItem(NEW_FORM_OPEN_KEY);
        setFormTab("datos");
        refrescarPersonal();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    document.querySelectorAll(".btn-editar-ausencia").forEach((btn) => {
      btn.addEventListener("click", () => {
        localStorage.setItem(EDIT_AUSENCIA_KEY, String(btn.dataset.id));
        refrescarPersonal();
      });
    });

    document.querySelectorAll(".btn-cancelar-editar-ausencia").forEach((btn) => {
      btn.addEventListener("click", () => {
        localStorage.removeItem(EDIT_AUSENCIA_KEY);
        refrescarPersonal();
      });
    });

    document.querySelectorAll(".btn-guardar-ausencia").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const tipo = valueOf(`edit_aus_tipo_${id}`);
        const estado = valueOf(`edit_aus_estado_${id}`);
        const fechaInicio = valueOf(`edit_aus_inicio_${id}`);
        const fechaFin = valueOf(`edit_aus_fin_${id}`);
        const comentario = valueOf(`edit_aus_comentario_${id}`);

        if (!fechaInicio || !fechaFin) {
          alert("Debes indicar fecha de inicio y fecha fin.");
          return;
        }

        if (new Date(fechaFin) < new Date(fechaInicio)) {
          alert("La fecha fin no puede ser menor que la fecha inicio.");
          return;
        }

        db.ausencias.update(id, {
          tipo,
          estado,
          fechaInicio,
          fechaFin,
          comentario
        });

        localStorage.removeItem(EDIT_AUSENCIA_KEY);
        refrescarPersonal();
      });
    });
  }

  if (acciones.borrar) {
    document.querySelectorAll(".btn-borrar-trabajador").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nombre = btn.dataset.nombre || "este trabajador";
        const ok = window.confirm(`Vas a borrar a ${nombre}. ¿Confirmas?`);
        if (!ok) return;
        db.personal.remove(btn.dataset.id);
        if (String(localStorage.getItem(EDIT_ID_KEY) || "") === String(btn.dataset.id)) {
          localStorage.removeItem(EDIT_ID_KEY);
        }
        refrescarPersonal();
      });
    });

    document.querySelectorAll(".btn-borrar-ausencia").forEach((btn) => {
      btn.addEventListener("click", () => {
        const ok = window.confirm("Vas a borrar esta ausencia. ¿Confirmas?");
        if (!ok) return;
        db.ausencias.remove(btn.dataset.id);
        if (String(localStorage.getItem(EDIT_AUSENCIA_KEY) || "") === String(btn.dataset.id)) {
          localStorage.removeItem(EDIT_AUSENCIA_KEY);
        }
        refrescarPersonal();
      });
    });
  }

  if (acciones.crear) {
    document.querySelectorAll(".btn-add-ausencia").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const tipo = valueOf(`aus_tipo_${id}`);
        const estado = valueOf(`aus_estado_${id}`);
        const fechaInicio = valueOf(`aus_inicio_${id}`);
        const fechaFin = valueOf(`aus_fin_${id}`);
        const comentario = valueOf(`aus_comentario_${id}`);

        if (!fechaInicio || !fechaFin) {
          alert("Debes indicar fecha de inicio y fecha fin.");
          return;
        }

        if (new Date(fechaFin) < new Date(fechaInicio)) {
          alert("La fecha fin no puede ser menor que la fecha inicio.");
          return;
        }

        db.ausencias.create({
          trabajadorId: id,
          tipo,
          estado,
          fechaInicio,
          fechaFin,
          comentario
        });

        refrescarPersonal();
      });
    });
  }
}

function guardarTrabajador() {
  const usuarioActual = getUsuarioActual();
  const acciones = usuarioActual.permisosAcciones || {};
  const editId = localStorage.getItem(EDIT_ID_KEY) || "";

  if (!editId && !acciones.crear) return;
  if (editId && !acciones.editar) return;

  const actual = editId
    ? db.personal.getAll().find((t) => String(t.id) === String(editId)) || {}
    : {};

  const puedeTocarPermisos = !!acciones.aprobar || !editId;

  const data = {
    nombre: valueOf("p_nombre"),
    usuario: valueOf("p_usuario"),
    password: valueOf("p_password"),
    puesto: valueOf("p_puesto"),
    activo: valueOf("p_activo") !== "false",
    telefono: valueOf("p_telefono"),
    email: valueOf("p_email"),
    dni: valueOf("p_dni"),
    nss: valueOf("p_nss"),
    direccion: {
      tipoVia: valueOf("p_tipoVia"),
      via: valueOf("p_via"),
      numero: valueOf("p_numero"),
      portal: valueOf("p_portal"),
      piso: valueOf("p_piso"),
      puerta: valueOf("p_puerta"),
      cp: valueOf("p_cp"),
      poblacion: valueOf("p_poblacion"),
      provincia: valueOf("p_provincia")
    },
    fechaAlta: valueOf("p_fechaAlta"),
    vacaciones: {
      disponibles: numberOf("p_vac", 30),
      usadas: actual?.vacaciones?.usadas ?? 0
    },
    moscosos: {
      disponibles: numberOf("p_mos", 2),
      usados: actual?.moscosos?.usados ?? 0
    },
    permisosModulos: puedeTocarPermisos
      ? {
          inicio: checked("mod_inicio"),
          agenda: checked("mod_agenda"),
          personal: checked("mod_personal"),
          configuracion: checked("mod_configuracion"),
          vehiculos: checked("mod_vehiculos"),
          herramientas: checked("mod_herramientas"),
          clientes: checked("mod_clientes"),
          obras: checked("mod_obras")
        }
      : (actual.permisosModulos || {}),
    permisosAcciones: puedeTocarPermisos
      ? {
          verTodo: checked("acc_verTodo"),
          crear: checked("acc_crear"),
          editar: checked("acc_editar"),
          borrar: checked("acc_borrar"),
          aprobar: checked("acc_aprobar")
        }
      : (actual.permisosAcciones || {})
  };

  if (!data.nombre) {
    alert("El nombre es obligatorio.");
    return;
  }

  if (editId) {
    db.personal.update(editId, { ...actual, ...data });
    localStorage.removeItem(EDIT_ID_KEY);
  } else {
    db.personal.create(data);
  }

  localStorage.removeItem(NEW_FORM_OPEN_KEY);
  setFormTab("datos");
  refrescarPersonal();
}

function getUsuarioActual() {
  const id = localStorage.getItem(SESSION_USER_KEY) || "";
  const usuarios = db.personal.getAll();
  return (
    usuarios.find((u) => String(u.id) === String(id)) || {
      id: "",
      permisosAcciones: {
        verTodo: false,
        crear: false,
        editar: false,
        borrar: false,
        aprobar: false
      }
    }
  );
}

function getFormTab() {
  return localStorage.getItem(FORM_TAB_KEY) || "datos";
}

function setFormTab(tab) {
  localStorage.setItem(FORM_TAB_KEY, tab);
}

function getSearchText() {
  return localStorage.getItem(SEARCH_KEY) || "";
}

function setSearchText(value) {
  localStorage.setItem(SEARCH_KEY, value);
}

function getStatusFilter() {
  return localStorage.getItem(FILTER_STATUS_KEY) || "todos";
}

function setStatusFilter(value) {
  localStorage.setItem(FILTER_STATUS_KEY, value);
}

function getOrderBy() {
  return localStorage.getItem(ORDER_KEY) || "nombre_asc";
}

function setOrderBy(value) {
  localStorage.setItem(ORDER_KEY, value);
}

function getQuickFilter() {
  return localStorage.getItem(QUICK_FILTER_KEY) || "todos";
}

function setQuickFilter(value) {
  localStorage.setItem(QUICK_FILTER_KEY, value);
}

function filtrarTrabajadores(lista, search, status, order, quickFilter) {
  let salida = [...lista];

  const txt = normalizeText(search);

  if (txt) {
    salida = salida.filter((t) => {
      const bolsa = [
        t.nombre,
        t.usuario,
        t.puesto,
        t.email,
        t.telefono,
        t.dni,
        t.nss,
        t.direccion?.via,
        t.direccion?.poblacion,
        t.direccion?.provincia
      ]
        .filter(Boolean)
        .map(normalizeText)
        .join(" ");

      return bolsa.includes(txt);
    });
  }

  if (status === "activos") {
    salida = salida.filter((t) => t.activo !== false);
  }

  if (status === "inactivos") {
    salida = salida.filter((t) => t.activo === false);
  }

  if (quickFilter === "activos") {
    salida = salida.filter((t) => t.activo !== false);
  }

  if (quickFilter === "inactivos") {
    salida = salida.filter((t) => t.activo === false);
  }

  if (quickFilter === "con_ausencias") {
    salida = salida.filter((t) => db.ausencias.getByTrabajador(t.id).length > 0);
  }

  if (quickFilter === "sin_ausencias") {
    salida = salida.filter((t) => db.ausencias.getByTrabajador(t.id).length === 0);
  }

  salida.sort((a, b) => {
    if (order === "nombre_desc") {
      return String(b.nombre || "").localeCompare(String(a.nombre || ""), "es");
    }

    if (order === "alta_desc") {
      return String(b.fechaAlta || "").localeCompare(String(a.fechaAlta || ""), "es");
    }

    if (order === "alta_asc") {
      return String(a.fechaAlta || "").localeCompare(String(b.fechaAlta || ""), "es");
    }

    return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es");
  });

  return salida;
}

  if (status === "activos") {
    salida = salida.filter((t) => t.activo !== false);
  }

  if (status === "inactivos") {
    salida = salida.filter((t) => t.activo === false);
  }

  salida.sort((a, b) => {
    if (order === "nombre_desc") {
      return String(b.nombre || "").localeCompare(String(a.nombre || ""), "es");
    }

    if (order === "alta_desc") {
      return String(b.fechaAlta || "").localeCompare(String(a.fechaAlta || ""), "es");
    }

    if (order === "alta_asc") {
      return String(a.fechaAlta || "").localeCompare(String(b.fechaAlta || ""), "es");
    }

    return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es");
  });

  return salida;
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function calcularResumenTrabajador(trabajador, ausencias) {
  let vacacionesUsadas = 0;
  let moscososUsados = 0;

  ausencias.forEach((a) => {
    if (a.estado === "rechazada") return;
    const dias = contarDias(a.fechaInicio, a.fechaFin);
    if (a.tipo === "vacaciones") vacacionesUsadas += dias;
    if (a.tipo === "moscoso") moscososUsados += dias;
  });

  const vacacionesDisponibles = Number(trabajador?.vacaciones?.disponibles ?? 30);
  const moscososDisponibles = Number(trabajador?.moscosos?.disponibles ?? 2);

  return {
    vacacionesDisponibles,
    vacacionesUsadas,
    vacacionesRestantes: vacacionesDisponibles - vacacionesUsadas,
    moscososDisponibles,
    moscososUsados,
    moscososRestantes: moscososDisponibles - moscososUsados
  };
}

function ordenarAusencias(lista) {
  return [...lista].sort((a, b) => {
    const aa = new Date(a.fechaInicio || 0).getTime();
    const bb = new Date(b.fechaInicio || 0).getTime();
    return aa - bb;
  });
}

function contarDias(inicio, fin) {
  if (!inicio || !fin) return 0;
  const d1 = new Date(inicio);
  const d2 = new Date(fin);
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return 0;
  if (d2 < d1) return 0;
  return Math.floor((d2 - d1) / 86400000) + 1;
}

function valueOf(id) {
  return document.getElementById(id)?.value?.trim() || "";
}

function numberOf(id, fallback) {
  const raw = valueOf(id);
  if (raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function checked(id) {
  return !!document.getElementById(id)?.checked;
}

function refrescarPersonal() {
  const view = document.getElementById("viewContainer");
  if (!view) return;
  view.innerHTML = renderPersonal();
}

function campo(label, id, value, extra = "") {
  return `
    <div>
      <label for="${id}" style="${labelStyle()}">${escapeHtml(label)}</label>
      <input id="${id}" value="${escapeHtmlAttr(value)}" ${extra} style="${inputStyle()}">
    </div>
  `;
}

function campoSelectActivo(valor) {
  return `
    <div>
      <label for="p_activo" style="${labelStyle()}">Estado</label>
      <select id="p_activo" style="${inputStyle()}">
        <option value="true" ${valor ? "selected" : ""}>Activo</option>
        <option value="false" ${!valor ? "selected" : ""}>Inactivo</option>
      </select>
    </div>
  `;
}

function check(id, texto, valor, disabled = false) {
  return `
    <label style="
      display:flex;
      align-items:center;
      gap:8px;
      padding:10px 12px;
      border:1px solid #dbe4ee;
      border-radius:10px;
      background:#fff;
      font-size:14px;
      color:#0f172a;
      font-weight:700;
    ">
      <input id="${id}" type="checkbox" ${valor ? "checked" : ""} ${disabled ? "disabled" : ""}>
      <span>${escapeHtml(texto)}</span>
    </label>
  `;
}

function pill(texto, ok) {
  return `
    <span style="
      display:inline-flex;
      align-items:center;
      justify-content:center;
      padding:4px 8px;
      border-radius:999px;
      background:${ok ? "#16a34a" : "#94a3b8"};
      color:#fff;
      font-size:11px;
      font-weight:700;
    ">
      ${escapeHtml(texto)}
    </span>
  `;
}

function tabBtn(tab, texto, active) {
  return `
    <button
      type="button"
      class="btn-form-tab"
      data-tab="${tab}"
      style="
        padding:10px 14px;
        border:none;
        border-radius:10px;
        cursor:pointer;
        font-weight:700;
        background:${active ? "#2563eb" : "#e2e8f0"};
        color:${active ? "#fff" : "#0f172a"};
      "
    >
      ${texto}
    </button>
  `;
}
function quickChip(value, text, active) {
  return `
    <button
      type="button"
      class="btn-quick-filter"
      data-quick="${value}"
      style="
        padding:8px 12px;
        border:none;
        border-radius:999px;
        cursor:pointer;
        font-weight:700;
        font-size:12px;
        background:${active ? "#0f172a" : "#e2e8f0"};
        color:${active ? "#fff" : "#0f172a"};
      "
    >
      ${text}
    </button>
  `;
}
function summaryCard(label, value, color) {
  return `
    <div style="
      padding:12px;
      border:1px solid #e2e8f0;
      border-radius:12px;
      background:#f8fafc;
    ">
      <div style="font-size:12px;color:#64748b;margin-bottom:6px;font-weight:700;">
        ${escapeHtml(label)}
      </div>
      <div style="font-size:28px;font-weight:800;color:${color};line-height:1;">
        ${escapeHtml(String(value))}
      </div>
    </div>
  `;
}

function colorTipo(tipo) {
  if (tipo === "vacaciones") return "#16a34a";
  if (tipo === "moscoso") return "#2563eb";
  if (tipo === "baja") return "#dc2626";
  return "#d97706";
}

function fondoTipo(tipo) {
  if (tipo === "vacaciones") return "#f0fdf4";
  if (tipo === "moscoso") return "#eff6ff";
  if (tipo === "baja") return "#fef2f2";
  return "#fffbeb";
}

function colorEstado(estado) {
  if (estado === "aprobada") return "#16a34a";
  if (estado === "rechazada") return "#dc2626";
  return "#d97706";
}

function labelStyle() {
  return "display:block;margin-bottom:5px;font-size:12px;font-weight:700;color:#334155;";
}

function inputStyle() {
  return "width:100%;min-width:0;padding:8px 10px;height:40px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;box-sizing:border-box;font-size:14px;";
}

function btnPrincipal() {
  return "padding:11px 16px;background:#2563eb;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;";
}

function btnSecundario() {
  return "padding:11px 16px;background:#64748b;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;";
}

function btnEditar() {
  return "background:#2563eb;color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;font-weight:700;";
}

function btnBorrar() {
  return "background:#dc2626;color:#fff;border:none;padding:8px 10px;border-radius:8px;cursor:pointer;";
}

function linkStyle() {
  return "color:#2563eb;display:inline-block;text-decoration:none;font-weight:700;";
}

function miniInfoBox() {
  return "padding:8px 10px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;font-size:12px;color:#475569;";
}

function sectionBox() {
  return "padding:12px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;";
}

function sectionTitle() {
  return "font-size:13px;font-weight:800;color:#0f172a;margin-bottom:10px;";
}

function grid4() {
  return "display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;";
}

function gridChecks() {
  return "display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;";
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
