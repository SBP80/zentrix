import { db } from "../db.js";

const CONFIG_EDIT_ID_KEY = "zentryx_config_edit_id";

export function renderConfiguracion() {
  const usuarios = db.personal.getAll();
  const editId = localStorage.getItem(CONFIG_EDIT_ID_KEY) || "";
  const editando =
    usuarios.find((u) => String(u.id) === String(editId)) || null;

  setTimeout(() => activarEventosConfiguracion(), 0);

  return `
    <div style="max-width:100%;width:100%;">
      <div style="
        border:1px solid #e2e8f0;
        border-radius:16px;
        background:#ffffff;
        padding:16px;
        box-sizing:border-box;
      ">
        <h2 style="margin:0 0 6px 0;">Configuración</h2>
        <p style="margin:0 0 16px 0;color:#64748b;">
          Usuarios, roles y permisos.
        </p>

        <div style="
          display:grid;
          gap:10px;
          margin-bottom:16px;
        ">
          ${cardResumen("Usuarios", usuarios.length)}
          ${cardResumen("Admins", usuarios.filter((u) => getRol(u) === "admin").length)}
          ${cardResumen("Encargados", usuarios.filter((u) => getRol(u) === "encargado").length)}
          ${cardResumen("Operarios", usuarios.filter((u) => getRol(u) === "operario").length)}
        </div>

        ${renderFormularioConfiguracion(editando)}

        <div style="display:grid;gap:10px;">
          ${
            usuarios.length
              ? usuarios.map((u) => renderTarjetaUsuario(u)).join("")
              : `
                <div style="
                  padding:14px;
                  border:1px dashed #cbd5e1;
                  border-radius:12px;
                  color:#64748b;
                  background:#f8fafc;
                ">
                  No hay usuarios
                </div>
              `
          }
        </div>
      </div>
    </div>
  `;
}

function renderFormularioConfiguracion(editando) {
  const u = editando || {};
  const rol = getRol(u);
  const mod = u.permisosModulos || {};
  const acc = u.permisosAcciones || {};

  return `
    <div style="
      display:flex;
      flex-direction:column;
      gap:10px;
      margin-bottom:18px;
      padding:12px;
      border:1px solid #e2e8f0;
      border-radius:12px;
      background:#f8fafc;
      box-sizing:border-box;
    ">
      <div style="
        font-size:16px;
        font-weight:800;
        color:#0f172a;
      ">
        ${editando ? "Editar usuario" : "Nuevo usuario"}
      </div>

      ${campo("Nombre completo", "cfg_nombre", u.nombre || "")}
      ${campo("Usuario", "cfg_usuario", u.usuario || "")}
      ${campo("Contraseña", "cfg_password", u.password || "")}
      ${campo("Puesto", "cfg_puesto", u.puesto || "")}
      ${campo("Teléfono", "cfg_telefono", u.telefono || "", 'inputmode="tel"')}
      ${campo("Email", "cfg_email", u.email || "", 'inputmode="email"')}
      ${campo("Fecha de alta", "cfg_fechaAlta", u.fechaAlta || "", 'type="date"')}

      ${campoSelect(
        "Rol",
        "cfg_rol",
        [
          { value: "admin", text: "Admin" },
          { value: "encargado", text: "Encargado" },
          { value: "operario", text: "Operario" }
        ],
        rol
      )}

      ${campoSelect(
        "Estado",
        "cfg_activo",
        [
          { value: "true", text: "Activo" },
          { value: "false", text: "Inactivo" }
        ],
        u.activo !== false ? "true" : "false"
      )}

      <div style="
        margin-top:4px;
        padding:10px;
        border:1px solid #dbe4ee;
        border-radius:10px;
        background:#fff;
      ">
        <div style="font-size:13px;font-weight:800;color:#0f172a;margin-bottom:8px;">
          Permisos por módulos
        </div>

        <div style="display:grid;gap:8px;">
          ${check("cfg_mod_inicio", "Inicio", !!mod.inicio)}
          ${check("cfg_mod_agenda", "Agenda", !!mod.agenda)}
          ${check("cfg_mod_personal", "Personal", !!mod.personal)}
          ${check("cfg_mod_configuracion", "Configuración", !!mod.configuracion)}
          ${check("cfg_mod_vehiculos", "Vehículos", !!mod.vehiculos)}
          ${check("cfg_mod_herramientas", "Herramientas", !!mod.herramientas)}
          ${check("cfg_mod_clientes", "Clientes", !!mod.clientes)}
          ${check("cfg_mod_obras", "Obras", !!mod.obras)}
        </div>
      </div>

      <div style="
        margin-top:4px;
        padding:10px;
        border:1px solid #dbe4ee;
        border-radius:10px;
        background:#fff;
      ">
        <div style="font-size:13px;font-weight:800;color:#0f172a;margin-bottom:8px;">
          Permisos por acciones
        </div>

        <div style="display:grid;gap:8px;">
          ${check("cfg_acc_verTodo", "Ver todo", !!acc.verTodo)}
          ${check("cfg_acc_crear", "Crear", !!acc.crear)}
          ${check("cfg_acc_editar", "Editar", !!acc.editar)}
          ${check("cfg_acc_borrar", "Borrar", !!acc.borrar)}
          ${check("cfg_acc_aprobar", "Aprobar", !!acc.aprobar)}
        </div>
      </div>

      <button id="btnGuardarUsuarioConfig" style="${btnPrincipal()}">
        ${editando ? "Guardar cambios" : "+ Crear usuario"}
      </button>

      ${
        editando
          ? `<button id="btnCancelarUsuarioConfig" style="${btnSecundario()}">Cancelar edición</button>`
          : ""
      }
    </div>
  `;
}

function renderTarjetaUsuario(u) {
  const rol = getRol(u);
  const mod = u.permisosModulos || {};
  const acc = u.permisosAcciones || {};

  return `
    <div style="
      border:1px solid #e2e8f0;
      border-radius:12px;
      padding:12px;
      background:#fff;
      box-sizing:border-box;
    ">
      <div style="display:grid;gap:8px;">
        <div>
          <div style="
            font-weight:800;
            font-size:17px;
            color:#0f172a;
            word-break:break-word;
          ">
            ${escapeHtml(u.nombre || "Sin nombre")}
          </div>

          <div style="
            font-size:13px;
            color:#64748b;
            margin-top:4px;
            word-break:break-word;
          ">
            ${escapeHtml(u.usuario || "-")} · ${escapeHtml(u.puesto || "-")}
          </div>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <span style="${pill(colorRol(rol))}">${escapeHtml(rol)}</span>
          <span style="${pill(u.activo !== false ? "#16a34a" : "#dc2626")}">
            ${u.activo !== false ? "Activo" : "Inactivo"}
          </span>
        </div>

        <div style="display:grid;gap:6px;font-size:13px;color:#334155;">
          ${u.telefono ? `<div>📞 ${escapeHtml(u.telefono)}</div>` : ""}
          ${u.email ? `<div>✉ ${escapeHtml(u.email)}</div>` : ""}
          ${u.fechaAlta ? `<div>Alta: ${escapeHtml(formatFecha(u.fechaAlta))}</div>` : ""}
        </div>

        <div style="display:grid;gap:6px;">
          <div style="${miniBox()}">
            Módulos: ${listaModulosTexto(mod)}
          </div>
          <div style="${miniBox()}">
            Acciones: ${listaAccionesTexto(acc)}
          </div>
        </div>

        <div style="
          display:grid;
          grid-template-columns:1fr;
          gap:8px;
        ">
          <button
            class="btn-editar-config"
            data-id="${escapeHtmlAttr(u.id)}"
            style="${btnPrincipal()}"
          >
            Editar
          </button>

          <button
            class="btn-borrar-config"
            data-id="${escapeHtmlAttr(u.id)}"
            style="${btnBorrar()}"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  `;
}

function activarEventosConfiguracion() {
  document.getElementById("btnGuardarUsuarioConfig")?.addEventListener("click", guardarUsuarioConfiguracion);

  document.getElementById("btnCancelarUsuarioConfig")?.addEventListener("click", () => {
    localStorage.removeItem(CONFIG_EDIT_ID_KEY);
    refrescarConfiguracion();
  });

  document.querySelectorAll(".btn-editar-config").forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.setItem(CONFIG_EDIT_ID_KEY, String(btn.dataset.id));
      refrescarConfiguracion();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll(".btn-borrar-config").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ok = confirm("¿Eliminar usuario?");
      if (!ok) return;
      db.personal.remove(btn.dataset.id);
      if (String(localStorage.getItem(CONFIG_EDIT_ID_KEY) || "") === String(btn.dataset.id)) {
        localStorage.removeItem(CONFIG_EDIT_ID_KEY);
      }
      refrescarConfiguracion();
    });
  });

  document.getElementById("cfg_rol")?.addEventListener("change", aplicarRolPredefinido);
}

function aplicarRolPredefinido() {
  const rol = value("cfg_rol");

  if (rol === "admin") {
    marcarChecks({
      cfg_mod_inicio: true,
      cfg_mod_agenda: true,
      cfg_mod_personal: true,
      cfg_mod_configuracion: true,
      cfg_mod_vehiculos: true,
      cfg_mod_herramientas: true,
      cfg_mod_clientes: true,
      cfg_mod_obras: true,
      cfg_acc_verTodo: true,
      cfg_acc_crear: true,
      cfg_acc_editar: true,
      cfg_acc_borrar: true,
      cfg_acc_aprobar: true
    });
    return;
  }

  if (rol === "encargado") {
    marcarChecks({
      cfg_mod_inicio: true,
      cfg_mod_agenda: true,
      cfg_mod_personal: true,
      cfg_mod_configuracion: false,
      cfg_mod_vehiculos: true,
      cfg_mod_herramientas: true,
      cfg_mod_clientes: true,
      cfg_mod_obras: true,
      cfg_acc_verTodo: true,
      cfg_acc_crear: true,
      cfg_acc_editar: true,
      cfg_acc_borrar: false,
      cfg_acc_aprobar: false
    });
    return;
  }

  marcarChecks({
    cfg_mod_inicio: true,
    cfg_mod_agenda: true,
    cfg_mod_personal: false,
    cfg_mod_configuracion: false,
    cfg_mod_vehiculos: false,
    cfg_mod_herramientas: false,
    cfg_mod_clientes: false,
    cfg_mod_obras: false,
    cfg_acc_verTodo: false,
    cfg_acc_crear: false,
    cfg_acc_editar: false,
    cfg_acc_borrar: false,
    cfg_acc_aprobar: false
  });
}

function marcarChecks(mapa) {
  Object.entries(mapa).forEach(([id, valor]) => {
    const el = document.getElementById(id);
    if (el) el.checked = !!valor;
  });
}

function guardarUsuarioConfiguracion() {
  const editId = localStorage.getItem(CONFIG_EDIT_ID_KEY) || "";
  const actual = editId
    ? db.personal.getAll().find((u) => String(u.id) === String(editId)) || {}
    : {};

  const rol = value("cfg_rol");

  const data = {
    nombre: value("cfg_nombre"),
    usuario: value("cfg_usuario"),
    password: value("cfg_password"),
    puesto: value("cfg_puesto"),
    telefono: value("cfg_telefono"),
    email: value("cfg_email"),
    fechaAlta: value("cfg_fechaAlta"),
    activo: value("cfg_activo") !== "false",
    rol,
    direccion: actual.direccion || {
      tipoVia: "",
      via: "",
      numero: "",
      portal: "",
      piso: "",
      puerta: "",
      cp: "",
      poblacion: "",
      provincia: ""
    },
    dni: actual.dni || "",
    nss: actual.nss || "",
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
    alert("El nombre es obligatorio");
    return;
  }

  if (!data.usuario) {
    alert("El usuario es obligatorio");
    return;
  }

  if (!editId && !data.password) {
    alert("La contraseña es obligatoria");
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

  refrescarConfiguracion();
}

function refrescarConfiguracion() {
  const cont = document.getElementById("viewContainer");
  if (!cont) return;
  cont.innerHTML = renderConfiguracion();
}

function getRol(u) {
  const rol = String(u?.rol || "").trim().toLowerCase();
  if (rol === "admin" || rol === "encargado" || rol === "operario") return rol;

  if (u?.permisosAcciones?.aprobar || u?.permisosAcciones?.verTodo) return "admin";
  if (u?.permisosAcciones?.editar) return "encargado";
  return "operario";
}

function colorRol(rol) {
  if (rol === "admin") return "#7c3aed";
  if (rol === "encargado") return "#2563eb";
  return "#0f766e";
}

function listaModulosTexto(mod) {
  const nombres = [];
  if (mod.inicio) nombres.push("Inicio");
  if (mod.agenda) nombres.push("Agenda");
  if (mod.personal) nombres.push("Personal");
  if (mod.configuracion) nombres.push("Configuración");
  if (mod.vehiculos) nombres.push("Vehículos");
  if (mod.herramientas) nombres.push("Herramientas");
  if (mod.clientes) nombres.push("Clientes");
  if (mod.obras) nombres.push("Obras");
  return nombres.length ? nombres.join(" · ") : "Sin acceso";
}

function listaAccionesTexto(acc) {
  const nombres = [];
  if (acc.verTodo) nombres.push("Ver todo");
  if (acc.crear) nombres.push("Crear");
  if (acc.editar) nombres.push("Editar");
  if (acc.borrar) nombres.push("Borrar");
  if (acc.aprobar) nombres.push("Aprobar");
  return nombres.length ? nombres.join(" · ") : "Sin permisos";
}

function cardResumen(titulo, valor) {
  return `
    <div style="
      padding:14px;
      border:1px solid #e2e8f0;
      border-radius:12px;
      background:#f8fafc;
      box-sizing:border-box;
    ">
      <div style="font-size:12px;color:#64748b;">${escapeHtml(titulo)}</div>
      <div style="font-size:28px;font-weight:800;color:#0f172a;">${escapeHtml(String(valor))}</div>
    </div>
  `;
}

function campo(label, id, valueText, extra = "") {
  return `
    <div style="display:grid;gap:4px;">
      <label for="${id}" style="${labelStyle()}">${escapeHtml(label)}</label>
      <input id="${id}" value="${escapeHtmlAttr(valueText)}" ${extra} style="${input()}">
    </div>
  `;
}

function campoSelect(label, id, options, selectedValue) {
  return `
    <div style="display:grid;gap:4px;">
      <label for="${id}" style="${labelStyle()}">${escapeHtml(label)}</label>
      <select id="${id}" style="${input()}">
        ${options.map((opt) => `
          <option value="${escapeHtmlAttr(opt.value)}" ${String(opt.value) === String(selectedValue) ? "selected" : ""}>
            ${escapeHtml(opt.text)}
          </option>
        `).join("")}
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

function value(id) {
  return document.getElementById(id)?.value?.trim() || "";
}

function checked(id) {
  return !!document.getElementById(id)?.checked;
}

function formatFecha(fecha) {
  if (!fecha) return "";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;

  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const anio = String(d.getFullYear());

  return `${dia}/${mes}/${anio}`;
}

function labelStyle() {
  return `
    font-size:12px;
    font-weight:700;
    color:#475569;
  `;
}

function input() {
  return `
    width:100%;
    min-width:0;
    padding:10px;
    border:1px solid #cbd5e1;
    border-radius:10px;
    box-sizing:border-box;
    background:#fff;
  `;
}

function btnPrincipal() {
  return `
    width:100%;
    padding:12px;
    border:none;
    border-radius:12px;
    background:#2563eb;
    color:#fff;
    font-weight:700;
    box-sizing:border-box;
  `;
}

function btnSecundario() {
  return `
    width:100%;
    padding:12px;
    border:none;
    border-radius:12px;
    background:#64748b;
    color:#fff;
    font-weight:700;
    box-sizing:border-box;
  `;
}

function btnBorrar() {
  return `
    width:100%;
    padding:12px;
    border:none;
    border-radius:12px;
    background:#dc2626;
    color:#fff;
    font-weight:700;
    box-sizing:border-box;
  `;
}

function miniBox() {
  return `
    padding:8px 10px;
    border:1px solid #e2e8f0;
    border-radius:10px;
    background:#f8fafc;
    font-size:12px;
    color:#475569;
    box-sizing:border-box;
  `;
}

function pill(color) {
  return `
    display:inline-flex;
    align-items:center;
    justify-content:center;
    padding:4px 8px;
    border-radius:999px;
    background:${color};
    color:#fff;
    font-size:11px;
    font-weight:700;
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

function escapeHtmlAttr(texto) {
  return escapeHtml(texto);
}