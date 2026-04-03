import {
  getPersonal,
  addTrabajador,
  deleteTrabajador,
  getDireccionTexto
} from "../data/personal.js";

const PERSONAL_DRAFT_KEY = "zentryx_personal_draft_v1";

export function renderPersonal() {
  const lista = getPersonal();
  const draft = getDraft();

  setTimeout(() => {
    activarEventosFormulario();
    activarBotonesBorrado();
    toggleOtroTipoVia();
  }, 0);

  return `
    <div class="panel-card">
      <h3>Personal</h3>
      <p>Gestión completa de trabajadores.</p>

      ${formulario(draft)}

      <div style="margin-top:20px; display:grid; gap:14px;">
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
  `;
}

function formulario(draft) {
  return `
    <div style="display:grid; gap:10px; margin-top:10px;">
      <input id="nombre" placeholder="Nombre completo" value="${escapeHtmlAttr(draft.nombre)}" style="${input()}" />
      <input id="usuario" placeholder="Usuario" value="${escapeHtmlAttr(draft.usuario)}" style="${input()}" />
      <input id="password" placeholder="Contraseña" value="${escapeHtmlAttr(draft.password)}" style="${input()}" />

      <input id="telefono" placeholder="Teléfono" value="${escapeHtmlAttr(draft.telefono)}" style="${input()}" />
      <input id="email" placeholder="Email" value="${escapeHtmlAttr(draft.email)}" style="${input()}" />

      <select id="tipoVia" style="${input()}">
        ${renderTipoViaOptions(draft.tipoVia)}
      </select>

      <input
        id="tipoViaOtro"
        placeholder="Escribe el tipo de vía"
        value="${escapeHtmlAttr(draft.tipoViaOtro)}"
        style="${input()} ${mostrarOtroTipoVia(draft.tipoVia) ? "" : "display:none;"}"
      />

      <input id="via" placeholder="Nombre de la vía" value="${escapeHtmlAttr(draft.via)}" style="${input()}" />
      <input id="numero" placeholder="Número" value="${escapeHtmlAttr(draft.numero)}" style="${input()}" />
      <input id="portal" placeholder="Portal" value="${escapeHtmlAttr(draft.portal)}" style="${input()}" />
      <input id="piso" placeholder="Piso" value="${escapeHtmlAttr(draft.piso)}" style="${input()}" />
      <input id="puerta" placeholder="Puerta" value="${escapeHtmlAttr(draft.puerta)}" style="${input()}" />
      <input id="cp" placeholder="Código postal" value="${escapeHtmlAttr(draft.cp)}" style="${input()}" />
      <input id="poblacion" placeholder="Población" value="${escapeHtmlAttr(draft.poblacion)}" style="${input()}" />
      <input id="provincia" placeholder="Provincia" value="${escapeHtmlAttr(draft.provincia)}" style="${input()}" />

      <input id="dni" placeholder="DNI" value="${escapeHtmlAttr(draft.dni)}" style="${input()}" />
      <input id="nss" placeholder="Seguridad Social" value="${escapeHtmlAttr(draft.nss)}" style="${input()}" />

      <button id="btnCrear" type="button" style="${btn()}">+ Crear trabajador</button>
    </div>
  `;
}

function renderTipoViaOptions(valorActual) {
  const opciones = [
    "",
    "Calle",
    "Avenida",
    "Plaza",
    "Camino",
    "Carretera",
    "Paseo",
    "Ronda",
    "Travesía",
    "Urbanización",
    "Polígono",
    "Otro"
  ];

  return opciones.map(op => `
    <option value="${escapeHtmlAttr(op)}" ${valorActual === op ? "selected" : ""}>
      ${op || "Tipo de vía"}
    </option>
  `).join("");
}

function renderTrabajador(t) {
  const direccion = getDireccionTexto(t.direccion);

  return `
    <div style="padding:14px; border:1px solid #ddd; border-radius:12px; background:#fff;">
      <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;">
        <div style="flex:1; min-width:0;">
          <strong style="font-size:18px;">${escapeHtml(t.nombre)}</strong>
          <div style="font-size:13px; color:#666; margin-top:4px;">Usuario: ${escapeHtml(t.usuario || "-")}</div>

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
        </div>

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
  `;
}

function activarEventosFormulario() {
  const ids = [
    "nombre", "usuario", "password", "telefono", "email",
    "tipoVia", "tipoViaOtro", "via", "numero", "portal",
    "piso", "puerta", "cp", "poblacion", "provincia",
    "dni", "nss"
  ];

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("input", guardarDraftDesdeFormulario);
    el.addEventListener("change", guardarDraftDesdeFormulario);
  });

  document.getElementById("tipoVia")?.addEventListener("change", () => {
    toggleOtroTipoVia();
    guardarDraftDesdeFormulario();
  });

  document.getElementById("btnCrear")?.addEventListener("click", crearTrabajador);
}

function activarBotonesBorrado() {
  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const nombre = btn.dataset.nombre || "este trabajador";

      const ok = window.confirm(`Vas a borrar a ${nombre}. ¿Confirmas?`);
      if (!ok) return;

      deleteTrabajador(id);
      refrescar();
    });
  });
}

function crearTrabajador() {
  const tipoViaSeleccionado = val("tipoVia");
  const tipoViaFinal = tipoViaSeleccionado === "Otro" ? val("tipoViaOtro") : tipoViaSeleccionado;

  const data = {
    nombre: val("nombre"),
    usuario: val("usuario"),
    password: val("password"),
    telefono: val("telefono"),
    email: val("email"),
    direccion: {
      tipoVia: tipoViaFinal,
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
    nss: val("nss")
  };

  if (!data.nombre) {
    alert("El nombre es obligatorio.");
    return;
  }

  addTrabajador(data);
  clearDraft();
  refrescar();
}

function toggleOtroTipoVia() {
  const select = document.getElementById("tipoVia");
  const otro = document.getElementById("tipoViaOtro");
  if (!select || !otro) return;

  otro.style.display = select.value === "Otro" ? "" : "none";
}

function guardarDraftDesdeFormulario() {
  const draft = {
    nombre: val("nombre"),
    usuario: val("usuario"),
    password: val("password"),
    telefono: val("telefono"),
    email: val("email"),
    tipoVia: val("tipoVia"),
    tipoViaOtro: val("tipoViaOtro"),
    via: val("via"),
    numero: val("numero"),
    portal: val("portal"),
    piso: val("piso"),
    puerta: val("puerta"),
    cp: val("cp"),
    poblacion: val("poblacion"),
    provincia: val("provincia"),
    dni: val("dni"),
    nss: val("nss")
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
      telefono: data.telefono || "",
      email: data.email || "",
      tipoVia: data.tipoVia || "",
      tipoViaOtro: data.tipoViaOtro || "",
      via: data.via || "",
      numero: data.numero || "",
      portal: data.portal || "",
      piso: data.piso || "",
      puerta: data.puerta || "",
      cp: data.cp || "",
      poblacion: data.poblacion || "",
      provincia: data.provincia || "",
      dni: data.dni || "",
      nss: data.nss || ""
    };
  } catch (error) {
    return {
      nombre: "",
      usuario: "",
      password: "",
      telefono: "",
      email: "",
      tipoVia: "",
      tipoViaOtro: "",
      via: "",
      numero: "",
      portal: "",
      piso: "",
      puerta: "",
      cp: "",
      poblacion: "",
      provincia: "",
      dni: "",
      nss: ""
    };
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

function mostrarOtroTipoVia(tipoVia) {
  return tipoVia === "Otro";
}

function val(id) {
  return document.getElementById(id)?.value.trim() || "";
}

function input() {
  return "padding:10px;border:1px solid #ccc;border-radius:10px;";
}

function btn() {
  return "padding:12px;background:#2563eb;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;";
}

function btnDelete() {
  return "background:#dc2626;color:#fff;border:none;padding:8px 10px;border-radius:8px;cursor:pointer;";
}

function miniBtn(color) {
  return `padding:4px 8px;background:${color};color:#fff;border-radius:6px;text-decoration:none;font-size:12px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;`;
}

function link() {
  return "color:#2563eb;display:inline-block;margin-right:10px;text-decoration:none;font-weight:700;";
}

function normalizaWhatsapp(telefono) {
  let t = String(telefono).replace(/[^\d+]/g, "");
  if (t.startsWith("+")) return t.slice(1);
  if (t.startsWith("34")) return t;
  return "34" + t;
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
