import {
  getPersonal,
  addTrabajador,
  deleteTrabajador,
  updateTrabajador,
  getDireccionTexto
} from "../data/personal.js";

const PERSONAL_DRAFT_KEY = "zentrix_personal_draft_v3";
const PERSONAL_EDIT_KEY = "zentrix_personal_edit_id_v1";

export function renderPersonal() {
  const lista = getPersonal();
  const draft = getDraft();
  const editId = localStorage.getItem(PERSONAL_EDIT_KEY) || "";
  const editTrabajador = editId ? lista.find((t) => String(t.id) === String(editId)) : null;

  setTimeout(() => {
    activarEventosFormulario();
    activarBotonesBorrado();
    activarBotonesEditar();
  }, 0);

  return `
    <div style="max-width:1200px; width:100%;">
      <div class="panel-card">
        <h3 style="margin-top:0;">Personal</h3>
        <p style="color:#64748b; margin-bottom:18px;">Gestión completa de trabajadores.</p>

        ${editTrabajador ? `
          <div style="
            margin-bottom:14px;
            padding:12px;
            border:1px solid #bfdbfe;
            border-radius:12px;
            background:#eff6ff;
            color:#1e3a8a;
            font-weight:700;
          ">
            Editando: ${escapeHtml(editTrabajador.nombre)}
          </div>
        ` : ""}

        ${formulario(draft, !!editTrabajador)}

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

function bloque(titulo, contenido) {
  return `
    <div style="
      padding:16px;
      border:1px solid #e2e8f0;
      border-radius:14px;
      background:#f8fafc;
    ">
      <div style="
        font-size:15px;
        font-weight:700;
        color:#0f172a;
        margin-bottom:12px;
      ">
        ${escapeHtml(titulo)}
      </div>
      ${contenido}
    </div>
  `;
}

function campoInput(label, id, value, extra = "") {
  const isDate = extra.includes('type="date"');
  return `
    <div style="min-width:0;">
      <label for="${id}" style="${labelStyle()}">${escapeHtml(label)}</label>
      <input
        id="${id}"
        value="${escapeHtmlAttr(value || "")}"
        ${extra}
        style="${input(isDate)}"
      />
    </div>
  `;
}

function campoTipoVia(value) {
  return `
    <div style="min-width:0;">
      <label for="tipoVia" style="${labelStyle()}">Tipo de vía</label>
      <input
        id="tipoVia"
        list="tipoViaLista"
        value="${escapeHtmlAttr(value || "")}"
        placeholder="Calle, Avenida, Plaza..."
        style="${input(false)}"
      />
      <datalist id="tipoViaLista">
        <option value="Calle"></option>
        <option value="Avenida"></option>
        <option value="Plaza"></option>
        <option value="Camino"></option>
        <option value="Carretera"></option>
        <option value="Paseo"></option>
        <option value="Ronda"></option>
        <option value="Travesía"></option>
        <option value="Urbanización"></option>
        <option value="Polígono"></option>
      </datalist>
    </div>
  `;
}

function renderTrabajador(t) {
  const direccion = getDireccionTexto(t.direccion);

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
          <strong style="font-size:18px;">${escapeHtml(t.nombre)}</strong>

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
            Vacaciones: ${escapeHtml(String(t.vacaciones?.disponibles ?? 0))} disponibles · ${escapeHtml(String(t.vacaciones?.usadas ?? 0))} usadas
          </div>

          <div style="font-size:12px; margin-top:4px; color:#475569;">
            Moscosos: ${escapeHtml(String(t.moscosos?.disponibles ?? 0))} disponibles · ${escapeHtml(String(t.moscosos?.usados ?? 0))} usados
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

function activarEventosFormulario() {
  const ids = [
    "nombre", "usuario", "password", "puesto",
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

      deleteTrabajador(id);
      refrescar();
    });
  });
}

function activarBotonesEditar() {
  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const lista = getPersonal();
      const trabajador = lista.find((t) => String(t.id) === String(id));
      if (!trabajador) return;

      const d = trabajador.direccion || {};

      const draft = {
        nombre: trabajador.nombre || "",
        usuario: trabajador.usuario || "",
        password: trabajador.password || "",
        puesto: trabajador.puesto || "",
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
        mosUsados: String(trabajador.moscosos?.usados ?? 0)
      };

      localStorage.setItem(PERSONAL_DRAFT_KEY, JSON.stringify(draft));
      localStorage.setItem(PERSONAL_EDIT_KEY, String(id));
      refrescar();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function guardarTrabajador() {
  const data = {
    nombre: val("nombre"),
    usuario: val("usuario"),
    password: val("password"),
    puesto: val("puesto"),
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
    }
  };

  if (!data.nombre) {
    alert("El nombre es obligatorio.");
    return;
  }

  const editId = localStorage.getItem(PERSONAL_EDIT_KEY);

  if (editId) {
    const ok = window.confirm("Vas a guardar cambios en este trabajador. ¿Confirmas?");
    if (!ok) return;

    updateTrabajador(editId, data);
    cancelarEdicion(false);
    refrescar();
    return;
  }

  addTrabajador(data);
  clearDraft();
  refrescar();
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
    mosUsados: val("mosUsados")
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
      mosUsados: data.mosUsados || ""
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

function grid() {
  return `
    display:grid;
    grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));
    gap:10px;
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
