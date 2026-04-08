import { db } from "../db.js";
import { getDireccionTexto } from "../data/personal.js";

const EDIT_ID_KEY = "zentryx_personal_edit_id";

export function renderPersonal() {
  const trabajadores = db.personal.getAll();
  const editId = localStorage.getItem(EDIT_ID_KEY) || "";
  const editando =
    trabajadores.find((t) => String(t.id) === String(editId)) || null;

  setTimeout(() => activarEventos(), 0);

  return `
    <div style="max-width:100%;width:100%;">
      <div style="
        border:1px solid #e2e8f0;
        border-radius:16px;
        background:#ffffff;
        padding:16px;
      ">
        <h2 style="margin:0 0 6px 0;">Personal</h2>
        <p style="margin:0 0 16px 0;color:#64748b;">
          Gestión de trabajadores.
        </p>

        ${renderFormulario(editando)}

        <div style="display:grid;gap:10px;">
          ${
            trabajadores.length
              ? trabajadores.map((t) => renderTrabajador(t)).join("")
              : `
                <div style="
                  padding:14px;
                  border:1px dashed #cbd5e1;
                  border-radius:12px;
                  color:#64748b;
                  background:#f8fafc;
                ">
                  No hay trabajadores
                </div>
              `
          }
        </div>
      </div>
    </div>
  `;
}

function renderFormulario(editando) {
  const t = editando || {};
  const d = t.direccion || {};

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
    ">
      <div style="
        font-size:16px;
        font-weight:800;
        color:#0f172a;
      ">
        ${editando ? "Editar trabajador" : "Nuevo trabajador"}
      </div>

      <input id="p_nombre" placeholder="Nombre completo" value="${escapeHtmlAttr(t.nombre || "")}" style="${input()}">
      <input id="p_usuario" placeholder="Usuario" value="${escapeHtmlAttr(t.usuario || "")}" style="${input()}">
      <input id="p_password" placeholder="Contraseña" value="${escapeHtmlAttr(t.password || "")}" style="${input()}">
      <input id="p_puesto" placeholder="Puesto" value="${escapeHtmlAttr(t.puesto || "")}" style="${input()}">
      <input id="p_telefono" placeholder="Teléfono" value="${escapeHtmlAttr(t.telefono || "")}" style="${input()}">
      <input id="p_email" placeholder="Email" value="${escapeHtmlAttr(t.email || "")}" style="${input()}">
      <input id="p_dni" placeholder="DNI" value="${escapeHtmlAttr(t.dni || "")}" style="${input()}">
      <input id="p_nss" placeholder="Seguridad Social" value="${escapeHtmlAttr(t.nss || "")}" style="${input()}">
      <input id="p_fechaAlta" type="date" value="${escapeHtmlAttr(t.fechaAlta || "")}" style="${input()}">

      <select id="p_activo" style="${input()}">
        <option value="true" ${t.activo !== false ? "selected" : ""}>Activo</option>
        <option value="false" ${t.activo === false ? "selected" : ""}>Inactivo</option>
      </select>

      <input id="p_tipoVia" placeholder="Tipo de vía" value="${escapeHtmlAttr(d.tipoVia || "")}" style="${input()}">
      <input id="p_via" placeholder="Nombre de la vía" value="${escapeHtmlAttr(d.via || "")}" style="${input()}">
      <input id="p_numero" placeholder="Número" value="${escapeHtmlAttr(d.numero || "")}" style="${input()}">
      <input id="p_cp" placeholder="Código postal" value="${escapeHtmlAttr(d.cp || "")}" style="${input()}">
      <input id="p_poblacion" placeholder="Población" value="${escapeHtmlAttr(d.poblacion || "")}" style="${input()}">
      <input id="p_provincia" placeholder="Provincia" value="${escapeHtmlAttr(d.provincia || "")}" style="${input()}">

      <button id="btnGuardarTrabajador" style="${btnPrincipal()}">
        ${editando ? "Guardar cambios" : "+ Crear trabajador"}
      </button>

      ${
        editando
          ? `<button id="btnCancelarEdicion" style="${btnSecundario()}">Cancelar edición</button>`
          : ""
      }
    </div>
  `;
}

function renderTrabajador(t) {
  const direccionTexto = getDireccionTexto(t.direccion || {});

  return `
    <div style="
      border:1px solid #e2e8f0;
      border-radius:12px;
      padding:12px;
      background:#fff;
    ">
      <div style="
        display:flex;
        flex-direction:column;
        gap:8px;
      ">
        <div>
          <div style="
            font-weight:800;
            font-size:17px;
            color:#0f172a;
            word-break:break-word;
          ">
            ${escapeHtml(t.nombre || "Sin nombre")}
          </div>

          <div style="
            font-size:13px;
            color:#64748b;
            margin-top:4px;
            word-break:break-word;
          ">
            ${escapeHtml(t.usuario || "-")} · ${escapeHtml(t.puesto || "-")}
          </div>
        </div>

        <div style="
          display:flex;
          flex-wrap:wrap;
          gap:8px;
        ">
          <span style="${pill(t.activo !== false ? "#16a34a" : "#dc2626")}">
            ${t.activo !== false ? "Activo" : "Inactivo"}
          </span>
        </div>

        <div style="
          display:grid;
          gap:6px;
          font-size:13px;
          color:#334155;
        ">
          ${t.telefono ? `<div>📞 ${escapeHtml(t.telefono)}</div>` : ""}
          ${t.email ? `<div>✉ ${escapeHtml(t.email)}</div>` : ""}
          ${t.fechaAlta ? `<div>Alta: ${escapeHtml(t.fechaAlta)}</div>` : ""}
          ${t.dni ? `<div>DNI: ${escapeHtml(t.dni)}</div>` : ""}
          ${t.nss ? `<div>NSS: ${escapeHtml(t.nss)}</div>` : ""}
          ${direccionTexto ? `<div>📍 ${escapeHtml(direccionTexto)}</div>` : ""}
        </div>

        <div style="
          display:grid;
          grid-template-columns:1fr;
          gap:8px;
          margin-top:4px;
        ">
          <button
            class="btn-editar"
            data-id="${escapeHtmlAttr(t.id)}"
            style="${btnPrincipal()}"
          >
            Editar
          </button>

          <button
            class="btn-borrar"
            data-id="${escapeHtmlAttr(t.id)}"
            style="${btnBorrar()}"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  `;
}

function activarEventos() {
  document.getElementById("btnGuardarTrabajador")?.addEventListener("click", guardarTrabajador);

  document.getElementById("btnCancelarEdicion")?.addEventListener("click", () => {
    localStorage.removeItem(EDIT_ID_KEY);
    refrescar();
  });

  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.setItem(EDIT_ID_KEY, String(btn.dataset.id));
      refrescar();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll(".btn-borrar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ok = confirm("¿Eliminar trabajador?");
      if (!ok) return;
      db.personal.remove(btn.dataset.id);
      if (String(localStorage.getItem(EDIT_ID_KEY) || "") === String(btn.dataset.id)) {
        localStorage.removeItem(EDIT_ID_KEY);
      }
      refrescar();
    });
  });
}

function guardarTrabajador() {
  const editId = localStorage.getItem(EDIT_ID_KEY) || "";
  const actual = editId
    ? db.personal.getAll().find((t) => String(t.id) === String(editId)) || {}
    : {};

  const data = {
    nombre: value("p_nombre"),
    usuario: value("p_usuario"),
    password: value("p_password"),
    puesto: value("p_puesto"),
    telefono: value("p_telefono"),
    email: value("p_email"),
    dni: value("p_dni"),
    nss: value("p_nss"),
    fechaAlta: value("p_fechaAlta"),
    activo: value("p_activo") !== "false",
    direccion: {
      tipoVia: value("p_tipoVia"),
      via: value("p_via"),
      numero: value("p_numero"),
      portal: actual.direccion?.portal || "",
      piso: actual.direccion?.piso || "",
      puerta: actual.direccion?.puerta || "",
      cp: value("p_cp"),
      poblacion: value("p_poblacion"),
      provincia: value("p_provincia")
    },
    vacaciones: actual.vacaciones || { disponibles: 30, usadas: 0 },
    moscosos: actual.moscosos || { disponibles: 2, usados: 0 },
    permisosModulos: actual.permisosModulos || {
      inicio: true,
      agenda: true,
      personal: false,
      configuracion: false,
      vehiculos: false,
      herramientas: false,
      clientes: false,
      obras: false
    },
    permisosAcciones: actual.permisosAcciones || {
      verTodo: false,
      crear: false,
      editar: false,
      borrar: false,
      aprobar: false
    }
  };

  if (!data.nombre) {
    alert("El nombre es obligatorio");
    return;
  }

  if (editId) {
    db.personal.update(editId, { ...actual, ...data });
    localStorage.removeItem(EDIT_ID_KEY);
  } else {
    db.personal.create(data);
  }

  refrescar();
}

function refrescar() {
  const cont = document.getElementById("viewContainer");
  if (!cont) return;
  cont.innerHTML = renderPersonal();
}

function value(id) {
  return document.getElementById(id)?.value?.trim() || "";
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