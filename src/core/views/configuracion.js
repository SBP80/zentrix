import { db } from "../db.js";

const SESSION_USER_KEY = "zentrix_session_user_v1";
const CONFIG_EDIT_ID_KEY = "zentryx_config_edit_id";
const CONFIG_NEW_OPEN_KEY = "zentryx_config_new_open";

export function renderConfiguracion() {
  const usuarioActual = getUsuarioActual();
  const acciones = usuarioActual.permisosAcciones || {};
  const puedeCrear = !!acciones.crear || !!acciones.aprobar;
  const puedeEditar = !!acciones.editar || !!acciones.aprobar;
  const puedeBorrar = !!acciones.borrar || !!acciones.aprobar;

  const usuarios = db.personal.getAll();
  const editId = localStorage.getItem(CONFIG_EDIT_ID_KEY) || "";
  const editando =
    usuarios.find((u) => String(u.id) === String(editId)) || null;
  const nuevoAbierto = localStorage.getItem(CONFIG_NEW_OPEN_KEY) === "true";

  setTimeout(() => {
    activarEventosConfiguracion();
  }, 0);

  return `
    <div style="max-width:1100px;width:100%;">
      <div class="panel-card">
        <h3 style="margin-top:0;">Configuración</h3>
        <p style="color:#64748b;margin-bottom:20px;">
          Gestión real de usuarios del sistema.
        </p>

        ${
          puedeCrear && !editando && !nuevoAbierto
            ? `
              <div style="margin-bottom:18px;">
                <button id="btnNuevoUsuarioConfig" type="button" style="${btnPrincipal()}">
                  + Nuevo usuario
                </button>
              </div>
            `
            : ""
        }

        ${
          (puedeCrear && nuevoAbierto) || (puedeEditar && editando)
            ? renderFormularioUsuario(editando)
            : ""
        }

        <div style="display:grid;gap:12px;">
          ${
            usuarios.length
              ? usuarios.map((u) =>
                  renderTarjetaUsuario(u, usuarioActual, puedeEditar, puedeBorrar)
                ).join("")
              : `
                <div style="
                  padding:14px;
                  border:1px dashed #cbd5e1;
                  border-radius:12px;
                  background:#f8fafc;
                  color:#64748b;
                ">
                  No hay usuarios.
                </div>
              `
          }
        </div>
      </div>
    </div>
  `;
}

function renderFormularioUsuario(editando) {
  const u = editando || {};
  const rol = getRol(u);

  return `
    <div style="
      margin-bottom:18px;
      border:1px solid #e2e8f0;
      border-radius:14px;
      background:#fff;
      padding:16px;
    ">
      <div style="font-size:16px;font-weight:800;color:#0f172a;margin-bottom:12px;">
        ${editando ? "Editar usuario" : "Nuevo usuario"}
      </div>

      <div style="
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
        gap:10px;
      ">
        ${campo("Nombre completo", "cfg_nombre", u.nombre || "")}
        ${campo("Usuario", "cfg_usuario", u.usuario || "")}
        ${campo("Contraseña", "cfg_password", u.password || "")}
        ${campo("Puesto", "cfg_puesto", u.puesto || "")}
        ${campo("Teléfono", "cfg_telefono", u.telefono || "", 'inputmode="tel"')}
        ${campo("Email", "cfg_email", u.email || "", 'inputmode="email"')}
        ${campo("DNI", "cfg_dni", u.dni || "")}
        ${campo("Seguridad Social", "cfg_nss", u.nss || "")}
        ${campo("Fecha de alta", "cfg_fechaAlta", u.fechaAlta || "", 'type="date"')}
        ${campoSelectRol(rol)}
        ${campoSelectActivo(u.activo !== false)}
      </div>

      <div style="margin-top:14px;">
        <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:8px;">Permisos por módulos</div>
        <div style="${gridChecks()}">
          ${check("cfg_mod_inicio", "Inicio", !!u.permisosModulos?.inicio)}
          ${check("cfg_mod_agenda", "Agenda", !!u.permisosModulos?.agenda)}
          ${check("cfg_mod_personal", "Personal", !!u.permisosModulos?.personal)}
          ${check("cfg_mod_configuracion", "Configuración", !!u.permisosModulos?.configuracion)}
          ${check("cfg_mod_vehiculos", "Vehículos", !!u.permisosModulos?.vehiculos)}
          ${check("cfg_mod_herramientas", "Herramientas", !!u.permisosModulos?.herramientas)}
          ${check("cfg_mod_clientes", "Clientes", !!u.permisosModulos?.clientes)}
          ${check("cfg_mod_obras", "Obras", !!u.permisosModulos?.obras)}
        </div>
      </div>

      <div style="margin-top:14px;">
        <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:8px;">Permisos por acciones</div>
        <div style="${gridChecks()}">
          ${check("cfg_acc_verTodo", "Ver todo", !!u.permisosAcciones?.verTodo)}
          ${check("cfg_acc_crear", "Crear", !!u.permisosAcciones?.crear)}
          ${check("cfg_acc_editar", "Editar", !!u.permisosAcciones?.editar)}
          ${check("cfg_acc_borrar", "Borrar", !!u.permisosAcciones?.borrar)}
          ${check("cfg_acc_aprobar", "Aprobar", !!u.permisosAcciones?.aprobar)}
        </div>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;">
        <button id="btnGuardarUsuarioConfig" type="button" style="${btnPrincipal()}">
          ${editando ? "Guardar cambios" : "Crear usuario"}
        </button>

        <button id="btnCancelarUsuarioConfig" type="button" style="${btnSecundario()}">
          Cancelar
        </button>
      </div>
    </div>
  `;
}

function renderTarjetaUsuario(u, usuarioActual, puedeEditar, puedeBorrar) {
  const rol = getRol(u);
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
            background:${colorRol(rol)};
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
          margin-top:8px;
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
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${
          puedeEditar
            ? `<button type="button" class="btnEditarConfigUsuario" data-id="${escapeHtmlAttr(u.id)}" style="${btnEditar()}">Editar</button>`
            : ""
        }

        ${
          puedeBorrarEste
            ? `<button type="button" class="btnEliminarConfigUsuario" data-id="${escapeHtmlAttr(u.id)}" data-nombre="${escapeHtmlAttr(u.nombre || "")}" style="${btnBorrar()}">✕</button>`
            : ""
        }
      </div>
    </div>
  `;
}

function activarEventosConfiguracion() {
  document.getElementById("btnNuevoUsuarioConfig")?.addEventListener("click", () => {
    localStorage.setItem(CONFIG_NEW_OPEN_KEY, "true");
    localStorage.removeItem(CONFIG_EDIT_ID_KEY);
    refrescarConfiguracion();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.getElementById("btnCancelarUsuarioConfig")?.addEventListener("click", () => {
    localStorage.removeItem(CONFIG_EDIT_ID_KEY);
    localStorage.removeItem(CONFIG_NEW_OPEN_KEY);
    refrescarConfiguracion();
  });

  document.getElementById("btnGuardarUsuarioConfig")?.addEventListener("click", guardarUsuarioConfiguracion);

  document.querySelectorAll(".btnEditarConfigUsuario").forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.setItem(CONFIG_EDIT_ID_KEY, String(btn.dataset.id));
      localStorage.removeItem(CONFIG_NEW_OPEN_KEY);
      refrescarConfiguracion();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll(".btnEliminarConfigUsuario").forEach((btn) => {
    btn.addEventListener("click", () => {
      const nombre = btn.dataset.nombre || "este usuario";
      const ok = window.confirm(`Vas a borrar a ${nombre}. ¿Confirmas?`);
      if (!ok) return;
      db.personal.remove(btn.dataset.id);
      refrescarConfiguracion();
    });
  });
}

function guardarUsuarioConfiguracion() {
  const editId = localStorage.getItem(CONFIG_EDIT_ID_KEY) || "";
  const actual = editId
    ? db.personal.getAll().find((u) => String(u.id) === String(editId)) || {}
    : {};

  const data = {
    nombre: valueOf("cfg_nombre"),
    usuario: valueOf("cfg_usuario"),
    password: valueOf("cfg_password"),
    puesto: valueOf("cfg_puesto"),
    telefono: valueOf("cfg_telefono"),
    email: valueOf("cfg_email"),
    dni: valueOf("cfg_dni"),
    nss: valueOf("cfg_nss"),
    fechaAlta: valueOf("cfg_fechaAlta"),
    activo: valueOf("cfg_activo") !== "false",
    rol: sanitizeRol(valueOf("cfg_rol")),
    direccion: actual.direccion || {},
    vacaciones: actual.vacaciones || { disponibles: 30, usadas: 0 },
    moscosos: actual.moscosos || { disponibles: 2, usados: 0 },
    permisosModulos: {
      inicio: checked("cfg_mod_inicio"),
      agenda: checked("cfg_mod_agenda"),
      personal: checked("cfg_mod_personal"),
      configuracion: checked("cfg_mod_configuracion"),
      vehiculos: checked("cfg_mod_vehiculos"),
      herramientas: checked("cfg_mod_herramientas"),
      clientes: checked("cfg_mod_clientes"),
      obras: checked("cfg_mod_obras")
    },
    permisosAcciones: {
      verTodo: checked("cfg_acc_verTodo"),
      crear: checked("cfg_acc_crear"),
      editar: checked("cfg_acc_editar"),
      borrar: checked("cfg_acc_borrar"),
      aprobar: checked("cfg_acc_aprobar")
    }
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
    alert("La contraseña es obligatoria.");
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
    db.personal.create(data);
  }

  localStorage.removeItem(CONFIG_NEW_OPEN_KEY);
  refrescarConfiguracion();
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

function colorRol(rol) {
  if (rol === "admin") return "#7c3aed";
  if (rol === "encargado") return "#2563eb";
  return "#0f766e";
}

function refrescarConfiguracion() {
  const container = document.getElementById("viewContainer");
  if (!container) return;
  container.innerHTML = renderConfiguracion();
}

function valueOf(id) {
  return document.getElementById(id)?.value?.trim() || "";
}

function checked(id) {
  return !!document.getElementById(id)?.checked;
}

function campo(label, id, value, extra = "") {
  return `
    <div>
      <label for="${id}" style="${labelStyle()}">${escapeHtml(label)}</label>
      <input id="${id}" value="${escapeHtmlAttr(value)}" ${extra} style="${inputStyle()}">
    </div>
  `;
}

function campoSelectRol(valor) {
  return `
    <div>
      <label for="cfg_rol" style="${labelStyle()}">Rol</label>
      <select id="cfg_rol" style="${inputStyle()}">
        <option value="admin" ${valor === "admin" ? "selected" : ""}>Admin</option>
        <option value="encargado" ${valor === "encargado" ? "selected" : ""}>Encargado</option>
        <option value="operario" ${valor === "operario" ? "selected" : ""}>Operario</option>
      </select>
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

function check(id, texto, valor) {
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
      <input id="${id}" type="checkbox" ${valor ? "checked" : ""}>
      <span>${escapeHtml(texto)}</span>
    </label>
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
