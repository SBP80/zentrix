import { db } from "../db.js";

const SESSION_USER_KEY = "zentrix_session_user_v1";
const CONFIG_EDIT_ID_KEY = "zentryx_config_edit_id";
const CONFIG_SEARCH_KEY = "zentryx_config_search";
const CONFIG_ROLE_FILTER_KEY = "zentryx_config_role_filter";
const CONFIG_STATUS_FILTER_KEY = "zentryx_config_status_filter";
const CONFIG_NEW_OPEN_KEY = "zentryx_config_new_open";

export function renderConfiguracion() {
  const usuarioActual = getUsuarioActual();
  const acciones = usuarioActual.permisosAcciones || {};
  const puedeEditar = !!acciones.editar || !!acciones.aprobar;
  const puedeCrear = !!acciones.crear || !!acciones.aprobar;
  const puedeBorrar = !!acciones.borrar || !!acciones.aprobar;

  const search = getSearch();
  const roleFilter = getRoleFilter();
  const statusFilter = getStatusFilter();

  const usuarios = db.personal.getAll();
  const editId = localStorage.getItem(CONFIG_EDIT_ID_KEY) || "";
  const editando =
    usuarios.find((u) => String(u.id) === String(editId)) || null;
  const newOpen = localStorage.getItem(CONFIG_NEW_OPEN_KEY) === "true";

  const filtrados = filtrarUsuarios(usuarios, search, roleFilter, statusFilter);

  const total = usuarios.length;
  const activos = usuarios.filter((u) => u.activo !== false).length;
  const inactivos = usuarios.filter((u) => u.activo === false).length;
  const admins = usuarios.filter((u) => getRol(u) === "admin").length;
  const encargados = usuarios.filter((u) => getRol(u) === "encargado").length;
  const operarios = usuarios.filter((u) => getRol(u) === "operario").length;

  setTimeout(() => {
    activarEventosConfiguracion();
  }, 0);

  return `
    <div style="max-width:1200px;width:100%;">
      <div class="panel-card">
        <div style="margin-bottom:18px;">
          <h3 style="margin:0 0 6px 0;">Configuración</h3>
          <p style="margin:0;color:#64748b;">
            Gestión real de usuarios, accesos y permisos.
          </p>
        </div>

        <div style="
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
          gap:10px;
          margin-bottom:18px;
        ">
          ${statCard("Total", total, "#0f172a")}
          ${statCard("Activos", activos, "#16a34a")}
          ${statCard("Inactivos", inactivos, "#dc2626")}
          ${statCard("Admin", admins, "#7c3aed")}
          ${statCard("Encargado", encargados, "#2563eb")}
          ${statCard("Operario", operarios, "#0f766e")}
        </div>

        ${
          puedeCrear && !newOpen && !editando
            ? `
              <div style="margin-bottom:18px;">
                <button id="btn_nuevo_usuario_config" type="button" style="${btnPrincipal()}">
                  + Nuevo usuario
                </button>
              </div>
            `
            : ""
        }

        ${
          (puedeCrear && newOpen) || (puedeEditar && editando)
            ? renderFormularioUsuario(editando, usuarioActual)
            : ""
        }

        <div style="
          margin-top:18px;
          padding:12px;
          border:1px solid #e2e8f0;
          border-radius:12px;
          background:#f8fafc;
        ">
          <div style="
            display:grid;
            grid-template-columns:minmax(240px,1fr) 180px 180px auto;
            gap:10px;
            align-items:end;
          ">
            <div>
              <label for="cfg_search" style="${labelStyle()}">Buscar usuario</label>
              <input
                id="cfg_search"
                value="${escapeHtmlAttr(search)}"
                placeholder="Nombre, usuario, email, puesto..."
                style="${inputStyle()}"
              >
            </div>

            <div>
              <label for="cfg_role" style="${labelStyle()}">Rol</label>
              <select id="cfg_role" style="${inputStyle()}">
                <option value="todos" ${roleFilter === "todos" ? "selected" : ""}>Todos</option>
                <option value="admin" ${roleFilter === "admin" ? "selected" : ""}>Admin</option>
                <option value="encargado" ${roleFilter === "encargado" ? "selected" : ""}>Encargado</option>
                <option value="operario" ${roleFilter === "operario" ? "selected" : ""}>Operario</option>
              </select>
            </div>

            <div>
              <label for="cfg_status" style="${labelStyle()}">Estado</label>
              <select id="cfg_status" style="${inputStyle()}">
                <option value="todos" ${statusFilter === "todos" ? "selected" : ""}>Todos</option>
                <option value="activos" ${statusFilter === "activos" ? "selected" : ""}>Activos</option>
                <option value="inactivos" ${statusFilter === "inactivos" ? "selected" : ""}>Inactivos</option>
              </select>
            </div>

            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button id="btn_limpiar_config" type="button" style="${btnSecundario()}">
                Limpiar
              </button>
            </div>
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
            <div>Mostrando ${filtrados.length} de ${usuarios.length} usuarios</div>
            <div>
              Búsqueda: ${search ? escapeHtml(search) : "ninguna"} ·
              Rol: ${escapeHtml(roleFilter)} ·
              Estado: ${escapeHtml(statusFilter)}
            </div>
          </div>
        </div>

        <div style="margin-top:20px;display:grid;gap:12px;">
          ${
            filtrados.length
              ? filtrados.map((u) =>
                  renderTarjetaUsuario(
                    u,
                    usuarioActual,
                    puedeEditar,
                    puedeBorrar
                  )
                ).join("")
              : `
                <div style="
                  padding:14px;
                  border:1px dashed #cbd5e1;
                  border-radius:12px;
                  color:#64748b;
                  background:#f8fafc;
                ">
                  No hay usuarios que coincidan con el filtro.
                </div>
              `
          }
        </div>
      </div>
    </div>
  `;
}

function renderFormularioUsuario(editando, usuarioActual) {
  const u = editando || {};
  const mod = u.permisosModulos || {};
  const acc = u.permisosAcciones || {};
  const d = u.direccion || {};
  const puedeTocarPermisos =
    !!usuarioActual?.permisosAcciones?.aprobar ||
    !editando ||
    String(usuarioActual.id) !== String(u.id);

  return `
    <div style="
      margin-bottom:18px;
      border:1px solid #e2e8f0;
      border-radius:16px;
      background:#fff;
      overflow:hidden;
    ">
      <div style="
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
            ${editando ? "Editar usuario" : "Nuevo usuario"}
          </div>
          <div style="font-size:12px;color:#64748b;margin-top:4px;">
            Usuario real del sistema.
          </div>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button id="btn_guardar_config_usuario" type="button" style="${btnPrincipal()}">
            ${editando ? "Guardar cambios" : "Crear usuario"}
          </button>
          <button id="btn_cancelar_config_usuario" type="button" style="${btnSecundario()}">
            Cancelar
          </button>
        </div>
      </div>

      <div style="padding:16px;">
        <div style="${sectionBox()}">
          <div style="${sectionTitle()}">Datos básicos</div>
          <div style="${grid4()}">
            ${campo("Nombre completo", "cfg_nombre", u.nombre || "")}
            ${campo("Usuario", "cfg_usuario", u.usuario || "")}
            ${campo("Contraseña", "cfg_password", u.password || "")}
            ${campo("Rol", "cfg_rol", getRol(u), 'list="cfg_roles_list"')}
            ${campo("Puesto", "cfg_puesto", u.puesto || "")}
            ${campoSelectActivo(u.activo !== false)}
            ${campo("Teléfono", "cfg_telefono", u.telefono || "", 'inputmode="tel"')}
            ${campo("Email", "cfg_email", u.email || "", 'inputmode="email"')}
            ${campo("Fecha de alta", "cfg_fechaAlta", u.fechaAlta || "", 'type="date"')}
            ${campo("DNI", "cfg_dni", u.dni || "")}
            ${campo("Seguridad Social", "cfg_nss", u.nss || "")}
          </div>

          <datalist id="cfg_roles_list">
            <option value="admin"></option>
            <option value="encargado"></option>
            <option value="operario"></option>
          </datalist>
        </div>

        <div style="height:14px;"></div>

        <div style="${sectionBox()}">
          <div style="${sectionTitle()}">Dirección</div>
          <div style="${grid4()}">
            ${campo("Tipo de vía", "cfg_tipoVia", d.tipoVia || "")}
            ${campo("Nombre de la vía", "cfg_via", d.via || "")}
            ${campo("Número", "cfg_numero", d.numero || "")}
            ${campo("Portal", "cfg_portal", d.portal || "")}
            ${campo("Piso", "cfg_piso", d.piso || "")}
            ${campo("Puerta", "cfg_puerta", d.puerta || "")}
            ${campo("Código postal", "cfg_cp", d.cp || "")}
            ${campo("Población", "cfg_poblacion", d.poblacion || "")}
            ${campo("Provincia", "cfg_provincia", d.provincia || "")}
          </div>
        </div>

        <div style="height:14px;"></div>

        <div style="${sectionBox()}${puedeTocarPermisos ? "" : "opacity:0.68;"}">
          <div style="${sectionTitle()}">Permisos por módulos</div>
          <div style="${gridChecks()}">
            ${check("cfg_mod_inicio", "Inicio", !!mod.inicio, !puedeTocarPermisos)}
            ${check("cfg_mod_agenda", "Agenda", !!mod.agenda, !puedeTocarPermisos)}
            ${check("cfg_mod_personal", "Personal", !!mod.personal, !puedeTocarPermisos)}
            ${check("cfg_mod_configuracion", "Configuración", !!mod.configuracion, !puedeTocarPermisos)}
            ${check("cfg_mod_vehiculos", "Vehículos", !!mod.vehiculos, !puedeTocarPermisos)}
            ${check("cfg_mod_herramientas", "Herramientas", !!mod.herramientas, !puedeTocarPermisos)}
            ${check("cfg_mod_clientes", "Clientes", !!mod.clientes, !puedeTocarPermisos)}
            ${check("cfg_mod_obras", "Obras", !!mod.obras, !puedeTocarPermisos)}
          </div>
        </div>

        <div style="height:14px;"></div>

        <div style="${sectionBox()}${puedeTocarPermisos ? "" : "opacity:0.68;"}">
          <div style="${sectionTitle()}">Permisos por acciones</div>
          <div style="${gridChecks()}">
            ${check("cfg_acc_verTodo", "Ver todo", !!acc.verTodo, !puedeTocarPermisos)}
            ${check("cfg_acc_crear", "Crear", !!acc.crear, !puedeTocarPermisos)}
            ${check("cfg_acc_editar", "Editar", !!acc.editar, !puedeTocarPermisos)}
            ${check("cfg_acc_borrar", "Borrar", !!acc.borrar, !puedeTocarPermisos)}
            ${check("cfg_acc_aprobar", "Aprobar", !!acc.aprobar, !puedeTocarPermisos)}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderTarjetaUsuario(u, usuarioActual, puedeEditar, puedeBorrar) {
  const rol = getRol(u);
  const colorRol =
    rol === "admin" ? "#7c3aed" :
    rol === "encargado" ? "#2563eb" :
    "#0f766e";

  const puedeBorrarEste = puedeBorrar && String(u.id) !== String(usuarioActual.id);

  return `
    <div style="
      padding:14px;
      border:1px solid #d8e1eb;
      border-radius:12px;
      background:#fff;
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
      gap:12px;
      flex-wrap:wrap;
    ">
      <div style="flex:1;min-width:260px;">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <div style="font-weight:800;color:#0f172a;font-size:16px;">
            ${escapeHtml(u.nombre || "Sin nombre")}
          </div>

          <span style="
            display:inline-flex;
            align-items:center;
            justify-content:center;
            padding:3px 8px;
            border-radius:999px;
            background:${colorRol};
            color:#fff;
            font-size:11px;
            font-weight:700;
          ">
            ${escapeHtml(rol)}
          </span>

          <span style="
            display:inline-flex;
            align-items:center;
            justify-content:center;
            padding:3px 8px;
            border-radius:999px;
            background:${u.activo === false ? "#dc2626" : "#16a34a"};
            color:#fff;
            font-size:11px;
            font-weight:700;
          ">
            ${u.activo === false ? "Inactivo" : "Activo"}
          </span>
        </div>

        <div style="margin-top:6px;font-size:13px;color:#64748b;">
          ${escapeHtml(u.usuario || "-")} · ${escapeHtml(u.puesto || "-")}
        </div>

        <div style="
          margin-top:10px;
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
          gap:6px 12px;
          font-size:13px;
          color:#334155;
        ">
          ${u.email ? `<div>✉ ${escapeHtml(u.email)}</div>` : ""}
          ${u.telefono ? `<div>📞 ${escapeHtml(u.telefono)}</div>` : ""}
          ${u.fechaAlta ? `<div>Alta: ${escapeHtml(u.fechaAlta)}</div>` : ""}
          ${u.dni ? `<div>DNI: ${escapeHtml(u.dni)}</div>` : ""}
        </div>

        <div style="margin-top:10px;">
          <div style="font-size:12px;font-weight:700;color:#334155;margin-bottom:6px;">Módulos</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${pill("Inicio", !!u.permisosModulos?.inicio)}
            ${pill("Agenda", !!u.permisosModulos?.agenda)}
            ${pill("Personal", !!u.permisosModulos?.personal)}
            ${pill("Configuración", !!u.permisosModulos?.configuracion)}
            ${pill("Vehículos", !!u.permisosModulos?.vehiculos)}
            ${pill("Herramientas", !!u.permisosModulos?.herramientas)}
            ${pill("Clientes", !!u.permisosModulos?.clientes)}
            ${pill("Obras", !!u.permisosModulos?.obras)}
          </div>
        </div>

        <div style="margin-top:10px;">
          <div style="font-size:12px;font-weight:700;color:#334155;margin-bottom:6px;">Acciones</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${pill("Ver todo", !!u.permisosAcciones?.verTodo)}
            ${pill("Crear", !!u.permisosAcciones?.crear)}
            ${pill("Editar", !!u.permisosAcciones?.editar)}
            ${pill("Borrar", !!u.permisosAcciones?.borrar)}
            ${pill("Aprobar", !!u.permisosAcciones?.aprobar)}
          </div>
        </div>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${
          puedeEditar
            ? `<button type="button" class="btn-editar-config-usuario" data-id="${escapeHtmlAttr(u.id)}" style="${btnEditar()}">Editar</button>`
            : ""
        }

        ${
          puedeBorrarEste
            ? `<button type="button" class="btn-eliminar-config-usuario" data-id="${escapeHtmlAttr(u.id)}" data-nombre="${escapeHtmlAttr(u.nombre || "")}" style="${btnBorrar()}">✕</button>`
            : ""
        }
      </div>
    </div>
  `;
}

function activarEventosConfiguracion() {
  const usuarioActual = getUsuarioActual();
  const acciones = usuarioActual.permisosAcciones || {};
  const puedeEditar = !!acciones.editar || !!acciones.aprobar;
  const puedeCrear = !!acciones.crear || !!acciones.aprobar;
  const puedeBorrar = !!acciones.borrar || !!acciones.aprobar;

  document.getElementById("btn_nuevo_usuario_config")?.addEventListener("click", () => {
    localStorage.setItem(CONFIG_NEW_OPEN_KEY, "true");
    localStorage.removeItem(CONFIG_EDIT_ID_KEY);
    refrescarConfiguracion();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.getElementById("btn_cancelar_config_usuario")?.addEventListener("click", () => {
    localStorage.removeItem(CONFIG_EDIT_ID_KEY);
    localStorage.removeItem(CONFIG_NEW_OPEN_KEY);
    refrescarConfiguracion();
  });

  document.getElementById("btn_guardar_config_usuario")?.addEventListener("click", guardarUsuarioConfiguracion);

  document.querySelectorAll(".btn-editar-config-usuario").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!puedeEditar) return;
      localStorage.setItem(CONFIG_EDIT_ID_KEY, String(btn.dataset.id));
      localStorage.removeItem(CONFIG_NEW_OPEN_KEY);
      refrescarConfiguracion();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll(".btn-eliminar-config-usuario").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!puedeBorrar) return;
      const nombre = btn.dataset.nombre || "este usuario";
      const ok = window.confirm(`Vas a borrar a ${nombre}. ¿Confirmas?`);
      if (!ok) return;
      db.personal.remove(btn.dataset.id);
      refrescarConfiguracion();
    });
  });

  document.getElementById("cfg_search")?.addEventListener("input", (e) => {
    setSearch(e.target.value || "");
    refrescarConfiguracion();
  });

  document.getElementById("cfg_role")?.addEventListener("change", (e) => {
    setRoleFilter(e.target.value || "todos");
    refrescarConfiguracion();
  });

  document.getElementById("cfg_status")?.addEventListener("change", (e) => {
    setStatusFilter(e.target.value || "todos");
    refrescarConfiguracion();
  });

  document.getElementById("btn_limpiar_config")?.addEventListener("click", () => {
    setSearch("");
    setRoleFilter("todos");
    setStatusFilter("todos");
    refrescarConfiguracion();
  });

  if (!puedeCrear && !puedeEditar) {
    document.getElementById("btn_guardar_config_usuario")?.setAttribute("disabled", "disabled");
  }
}

function guardarUsuarioConfiguracion() {
  const usuarioActual = getUsuarioActual();
  const acciones = usuarioActual.permisosAcciones || {};
  const puedeEditar = !!acciones.editar || !!acciones.aprobar;
  const puedeCrear = !!acciones.crear || !!acciones.aprobar;

  const editId = localStorage.getItem(CONFIG_EDIT_ID_KEY) || "";

  if (!editId && !puedeCrear) return;
  if (editId && !puedeEditar) return;

  const actual = editId
    ? db.personal.getAll().find((u) => String(u.id) === String(editId)) || {}
    : {};

  const puedeTocarPermisos = !!acciones.aprobar || !editId;

  const rol = sanitizeRol(valueOf("cfg_rol"));

  const data = {
    nombre: valueOf("cfg_nombre"),
    usuario: valueOf("cfg_usuario"),
    rol,
    password: valueOf("cfg_password"),
    puesto: valueOf("cfg_puesto"),
    activo: valueOf("cfg_activo") !== "false",
    telefono: valueOf("cfg_telefono"),
    email: valueOf("cfg_email"),
    dni: valueOf("cfg_dni"),
    nss: valueOf("cfg_nss"),
    direccion: {
      tipoVia: valueOf("cfg_tipoVia"),
      via: valueOf("cfg_via"),
      numero: valueOf("cfg_numero"),
      portal: valueOf("cfg_portal"),
      piso: valueOf("cfg_piso"),
      puerta: valueOf("cfg_puerta"),
      cp: valueOf("cfg_cp"),
      poblacion: valueOf("cfg_poblacion"),
      provincia: valueOf("cfg_provincia")
    },
    fechaAlta: valueOf("cfg_fechaAlta"),
    vacaciones: {
      disponibles: Number(actual?.vacaciones?.disponibles ?? 30),
      usadas: Number(actual?.vacaciones?.usadas ?? 0)
    },
    moscosos: {
      disponibles: Number(actual?.moscosos?.disponibles ?? 2),
      usados: Number(actual?.moscosos?.usados ?? 0)
    },
    permisosModulos: puedeTocarPermisos
      ? permisosPorRolBase(rol).permisosModulos
      : (actual.permisosModulos || {}),
    permisosAcciones: puedeTocarPermisos
      ? permisosPorRolBase(rol).permisosAcciones
      : (actual.permisosAcciones || {})
  };

  if (!data.nombre) {
    alert("El nombre es obligatorio.");
    return;
  }

  if (!data.usuario) {
    alert("El usuario es obligatorio.");
    return;
  }

  if (!editId && !data.password) {
    alert("La contraseña es obligatoria para un usuario nuevo.");
    return;
  }

  if (editId) {
    db.personal.update(editId, {
      ...actual,
      ...data,
      password: data.password || actual.password || ""
    });
    localStorage.removeItem(CONFIG_EDIT_ID_KEY);
  } else {
    db.personal.create({
      ...data,
      permisosModulos: puedeTocarPermisos
        ? leerPermisosModulosDesdeFormulario() || data.permisosModulos
        : data.permisosModulos,
      permisosAcciones: puedeTocarPermisos
        ? leerPermisosAccionesDesdeFormulario() || data.permisosAcciones
        : data.permisosAcciones
    });
  }

  if (puedeTocarPermisos && editId) {
    db.personal.update(editId, {
      permisosModulos: leerPermisosModulosDesdeFormulario(),
      permisosAcciones: leerPermisosAccionesDesdeFormulario()
    });
  }

  localStorage.removeItem(CONFIG_NEW_OPEN_KEY);
  refrescarConfiguracion();
}

function permisosPorRolBase(rol) {
  if (rol === "admin") {
    return {
      permisosModulos: {
        inicio: true,
        agenda: true,
        personal: true,
        configuracion: true,
        vehiculos: true,
        herramientas: true,
        clientes: true,
        obras: true
      },
      permisosAcciones: {
        verTodo: true,
        crear: true,
        editar: true,
        borrar: true,
        aprobar: true
      }
    };
  }

  if (rol === "encargado") {
    return {
      permisosModulos: {
        inicio: true,
        agenda: true,
        personal: true,
        configuracion: false,
        vehiculos: true,
        herramientas: true,
        clientes: true,
        obras: true
      },
      permisosAcciones: {
        verTodo: true,
        crear: true,
        editar: true,
        borrar: false,
        aprobar: false
      }
    };
  }

  return {
    permisosModulos: {
      inicio: true,
      agenda: true,
      personal: false,
      configuracion: false,
      vehiculos: false,
      herramientas: false,
      clientes: false,
      obras: false
    },
    permisosAcciones: {
      verTodo: false,
      crear: false,
      editar: false,
      borrar: false,
      aprobar: false
    }
  };
}

function leerPermisosModulosDesdeFormulario() {
  return {
    inicio: checked("cfg_mod_inicio"),
    agenda: checked("cfg_mod_agenda"),
    personal: checked("cfg_mod_personal"),
    configuracion: checked("cfg_mod_configuracion"),
    vehiculos: checked("cfg_mod_vehiculos"),
    herramientas: checked("cfg_mod_herramientas"),
    clientes: checked("cfg_mod_clientes"),
    obras: checked("cfg_mod_obras")
  };
}

function leerPermisosAccionesDesdeFormulario() {
  return {
    verTodo: checked("cfg_acc_verTodo"),
    crear: checked("cfg_acc_crear"),
    editar: checked("cfg_acc_editar"),
    borrar: checked("cfg_acc_borrar"),
    aprobar: checked("cfg_acc_aprobar")
  };
}

function filtrarUsuarios(lista, search, roleFilter, statusFilter) {
  let salida = [...lista];
  const txt = normalizeText(search);

  if (txt) {
    salida = salida.filter((u) => {
      const bolsa = [
        u.nombre,
        u.usuario,
        getRol(u),
        u.puesto,
        u.email,
        u.telefono,
        u.dni
      ]
        .filter(Boolean)
        .map(normalizeText)
        .join(" ");

      return bolsa.includes(txt);
    });
  }

  if (roleFilter !== "todos") {
    salida = salida.filter((u) => getRol(u) === roleFilter);
  }

  if (statusFilter === "activos") {
    salida = salida.filter((u) => u.activo !== false);
  }

  if (statusFilter === "inactivos") {
    salida = salida.filter((u) => u.activo === false);
  }

  salida.sort((a, b) => {
    return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es");
  });

  return salida;
}

function getUsuarioActual() {
  const id = localStorage.getItem(SESSION_USER_KEY) || "";
  const usuarios = db.personal.getAll();

  return usuarios.find((u) => String(u.id) === String(id)) || {
    id: "",
    nombre: "Usuario",
    permisosAcciones: {
      verTodo: false,
      crear: false,
      editar: false,
      borrar: false,
      aprobar: false
    }
  };
}

function getRol(u) {
  const rol = sanitizeRol(u?.rol || "");
  if (rol) return rol;

  if (u?.permisosAcciones?.aprobar || u?.permisosAcciones?.verTodo) return "admin";
  if (u?.permisosAcciones?.editar) return "encargado";
  return "operario";
}

function sanitizeRol(value) {
  const txt = String(value || "").trim().toLowerCase();
  if (txt === "admin") return "admin";
  if (txt === "encargado") return "encargado";
  return "operario";
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getSearch() {
  return localStorage.getItem(CONFIG_SEARCH_KEY) || "";
}

function setSearch(value) {
  localStorage.setItem(CONFIG_SEARCH_KEY, value);
}

function getRoleFilter() {
  return localStorage.getItem(CONFIG_ROLE_FILTER_KEY) || "todos";
}

function setRoleFilter(value) {
  localStorage.setItem(CONFIG_ROLE_FILTER_KEY, value);
}

function getStatusFilter() {
  return localStorage.getItem(CONFIG_STATUS_FILTER_KEY) || "todos";
}

function setStatusFilter(value) {
  localStorage.setItem(CONFIG_STATUS_FILTER_KEY, value);
}

function valueOf(id) {
  return document.getElementById(id)?.value?.trim() || "";
}

function checked(id) {
  return !!document.getElementById(id)?.checked;
}

function refrescarConfiguracion() {
  const container = document.getElementById("viewContainer");
  if (!container) return;
  container.innerHTML = renderConfiguracion();
}

function statCard(label, value, color) {
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
      <label for="cfg_activo" style="${labelStyle()}">Estado</label>
      <select id="cfg_activo" style="${inputStyle()}">
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

function labelStyle() {
  return "display:block;margin-bottom:5px;font-size:12px;font-weight:700;color:#334155;";
}

function inputStyle() {
  return "width:100%;min-width:0;padding:8px 10px;height:40px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;box-sizing:border-box;font-size:14px;";
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
