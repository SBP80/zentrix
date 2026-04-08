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
        box-sizing:border-box;
      ">
        <h2 style="margin:0 0 6px 0;">Personal</h2>
        <p style="margin:0 0 16px 0;color:#64748b;">
          Gestión de trabajadores y ausencias.
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
  const tipoVia = d.tipoVia || "";
  const usaTipoViaManual = !!tipoVia && !TIPOS_VIA.includes(tipoVia);

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
        ${editando ? "Editar trabajador" : "Nuevo trabajador"}
      </div>

      ${campo("Nombre completo", "p_nombre", t.nombre || "")}
      ${campo("Usuario", "p_usuario", t.usuario || "")}
      ${campo("Contraseña", "p_password", t.password || "")}
      ${campo("Puesto", "p_puesto", t.puesto || "")}
      ${campo("Teléfono", "p_telefono", t.telefono || "", 'inputmode="tel"')}
      ${campo("Email", "p_email", t.email || "", 'inputmode="email"')}
      ${campo("DNI", "p_dni", t.dni || "")}
      ${campo("Seguridad Social", "p_nss", t.nss || "")}
      ${campo("Fecha de alta", "p_fechaAlta", t.fechaAlta || "", 'type="date"')}

      ${campoSelect(
        "Estado",
        "p_activo",
        [
          { value: "true", text: "Activo" },
          { value: "false", text: "Inactivo" }
        ],
        t.activo !== false ? "true" : "false"
      )}

      ${campoSelect(
        "Tipo de vía",
        "p_tipoVia",
        [
          { value: "", text: "Selecciona tipo de vía" },
          ...TIPOS_VIA.map((item) => ({ value: item, text: item })),
          { value: "__otro__", text: "Otro" }
        ],
        usaTipoViaManual ? "__otro__" : tipoVia
      )}

      <div id="bloque_tipo_via_manual" style="display:${usaTipoViaManual ? "grid" : "none"};gap:4px;">
        <label for="p_tipoViaManual" style="${labelStyle()}">Escribe el tipo de vía</label>
        <input id="p_tipoViaManual" value="${escapeHtmlAttr(usaTipoViaManual ? tipoVia : "")}" style="${input()}">
      </div>

      ${campo("Nombre de la vía", "p_via", d.via || "")}
      ${campo("Número", "p_numero", d.numero || "")}
      ${campo("Portal", "p_portal", d.portal || "")}
      ${campo("Piso", "p_piso", d.piso || "")}
      ${campo("Puerta", "p_puerta", d.puerta || "")}
      ${campo("Código postal", "p_cp", d.cp || "")}
      ${campo("Población", "p_poblacion", d.poblacion || "")}
      ${campo("Provincia", "p_provincia", d.provincia || "")}

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
  const direccion = t.direccion || {};
  const direccionTexto = getDireccionTexto(direccion);
  const ausencias = db.ausencias.getByTrabajador(t.id);

  const telefonoNormalizado = normalizarTelefono(t.telefono || "");
  const telefonoHref = telefonoNormalizado ? `tel:${telefonoNormalizado}` : "";
  const whatsappHref = telefonoNormalizado ? `https://wa.me/${telefonoNormalizado}` : "";
  const emailHref = t.email ? `mailto:${String(t.email).trim()}` : "";

  const direccionCodificada = direccionTexto ? encodeURIComponent(direccionTexto) : "";
  const appleMapsHref = direccionTexto ? `https://maps.apple.com/?q=${direccionCodificada}` : "";
  const googleMapsHref = direccionTexto ? `https://www.google.com/maps/search/?api=1&query=${direccionCodificada}` : "";
  const wazeHref = direccionTexto ? `https://waze.com/ul?q=${direccionCodificada}&navigate=yes` : "";

  return `
    <div style="
      border:1px solid #e2e8f0;
      border-radius:12px;
      padding:12px;
      background:#fff;
      box-sizing:border-box;
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
          ${
            t.telefono
              ? `
                <div>
                  📞 <a href="${escapeHtmlAttr(telefonoHref)}" style="${linkStyle()}">${escapeHtml(t.telefono)}</a>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                  <a href="${escapeHtmlAttr(telefonoHref)}" style="${btnMini("#2563eb")}">Llamar</a>
                  <a href="${escapeHtmlAttr(whatsappHref)}" target="_blank" rel="noopener noreferrer" style="${btnMini("#16a34a")}">WhatsApp</a>
                </div>
              `
              : ""
          }

          ${
            t.email
              ? `
                <div>
                  ✉ <a href="${escapeHtmlAttr(emailHref)}" style="${linkStyle()}">${escapeHtml(t.email)}</a>
                </div>
              `
              : ""
          }

          ${t.fechaAlta ? `<div>Alta: ${escapeHtml(formatFecha(t.fechaAlta))}</div>` : ""}
          ${t.dni ? `<div>DNI: ${escapeHtml(t.dni)}</div>` : ""}
          ${t.nss ? `<div>NSS: ${escapeHtml(t.nss)}</div>` : ""}

          ${
            direccionTexto
              ? `
                <div>📍 ${escapeHtml(direccionTexto)}</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                  <a href="${escapeHtmlAttr(appleMapsHref)}" target="_blank" rel="noopener noreferrer" style="${btnMini("#64748b")}">Mapas</a>
                  <a href="${escapeHtmlAttr(googleMapsHref)}" target="_blank" rel="noopener noreferrer" style="${btnMini("#2563eb")}">Google Maps</a>
                  <a href="${escapeHtmlAttr(wazeHref)}" target="_blank" rel="noopener noreferrer" style="${btnMini("#0ea5e9")}">Waze</a>
                </div>
              `
              : ""
          }
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

      <div style="
        margin-top:14px;
        padding-top:12px;
        border-top:1px solid #e2e8f0;
      ">
        <div style="
          font-size:13px;
          font-weight:800;
          margin-bottom:8px;
          color:#0f172a;
        ">
          Ausencias
        </div>

        <div style="
          display:grid;
          gap:6px;
          margin-bottom:10px;
        ">
          ${campoSelectInline(
            `aus_tipo_${escapeHtmlAttr(t.id)}`,
            [
              { value: "vacaciones", text: "Vacaciones" },
              { value: "moscoso", text: "Moscoso" },
              { value: "baja", text: "Baja" },
              { value: "permiso", text: "Permiso" }
            ],
            "vacaciones"
          )}

          ${campoInline(`aus_inicio_${escapeHtmlAttr(t.id)}`, "", 'type="date"')}
          ${campoInline(`aus_fin_${escapeHtmlAttr(t.id)}`, "", 'type="date"')}
          ${campoInline(`aus_com_${escapeHtmlAttr(t.id)}`, "Comentario")}

          <button class="btn-add-aus" data-id="${escapeHtmlAttr(t.id)}" style="${btnPrincipal()}">
            + Añadir ausencia
          </button>
        </div>

        <div style="display:grid;gap:6px;">
          ${
            ausencias.length
              ? ausencias.map((a) => renderAusencia(a)).join("")
              : `<div style="font-size:12px;color:#64748b;">Sin ausencias</div>`
          }
        </div>
      </div>
    </div>
  `;
}

function renderAusencia(a) {
  const dias = contarDias(a.fechaInicio, a.fechaFin);

  return `
    <div style="
      padding:8px;
      border:1px solid #e2e8f0;
      border-radius:8px;
      font-size:12px;
      background:#f8fafc;
      color:#334155;
      box-sizing:border-box;
      display:flex;
      flex-direction:column;
      gap:8px;
    ">
      <div>
        <b>${escapeHtml(capitaliza(a.tipo || ""))}</b> ·
        ${escapeHtml(formatFecha(a.fechaInicio || ""))} → ${escapeHtml(formatFecha(a.fechaFin || ""))}
        ${dias > 0 ? `(${dias} día${dias === 1 ? "" : "s"})` : ""}
      </div>

      ${a.comentario ? `<div style="color:#64748b;">${escapeHtml(a.comentario)}</div>` : ""}

      <button
        class="btn-borrar-ausencia"
        data-id="${escapeHtmlAttr(a.id)}"
        style="${btnMiniBoton("#dc2626")}"
      >
        Borrar ausencia
      </button>
    </div>
  `;
}

function activarEventos() {
  document.getElementById("btnGuardarTrabajador")?.addEventListener("click", guardarTrabajador);

  document.getElementById("btnCancelarEdicion")?.addEventListener("click", () => {
    localStorage.removeItem(EDIT_ID_KEY);
    refrescar();
  });

  document.getElementById("p_tipoVia")?.addEventListener("change", actualizarCampoTipoViaManual);

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

  document.querySelectorAll(".btn-add-aus").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const tipo = value(`aus_tipo_${id}`);
      const inicio = value(`aus_inicio_${id}`);
      const fin = value(`aus_fin_${id}`);
      const comentario = value(`aus_com_${id}`);

      if (!inicio || !fin) {
        alert("Faltan fechas");
        return;
      }

      if (new Date(fin) < new Date(inicio)) {
        alert("La fecha fin no puede ser menor que la fecha inicio");
        return;
      }

      db.ausencias.create({
        trabajadorId: id,
        tipo,
        fechaInicio: inicio,
        fechaFin: fin,
        comentario,
        estado: "aprobada"
      });

      refrescar();
    });
  });

  document.querySelectorAll(".btn-borrar-ausencia").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ok = confirm("¿Borrar ausencia?");
      if (!ok) return;
      db.ausencias.remove(btn.dataset.id);
      refrescar();
    });
  });
}

function actualizarCampoTipoViaManual() {
  const select = document.getElementById("p_tipoVia");
  const bloque = document.getElementById("bloque_tipo_via_manual");
  if (!select || !bloque) return;
  bloque.style.display = select.value === "__otro__" ? "grid" : "none";
}

function guardarTrabajador() {
  const editId = localStorage.getItem(EDIT_ID_KEY) || "";
  const actual = editId
    ? db.personal.getAll().find((t) => String(t.id) === String(editId)) || {}
    : {};

  const tipoViaSeleccionado = value("p_tipoVia");
  const tipoViaManual = value("p_tipoViaManual");
  const tipoViaFinal =
    tipoViaSeleccionado === "__otro__" ? tipoViaManual : tipoViaSeleccionado;

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
      tipoVia: tipoViaFinal,
      via: value("p_via"),
      numero: value("p_numero"),
      portal: value("p_portal"),
      piso: value("p_piso"),
      puerta: value("p_puerta"),
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

  if (tipoViaSeleccionado === "__otro__" && !tipoViaManual) {
    alert("Escribe el tipo de vía");
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

function contarDias(inicio, fin) {
  if (!inicio || !fin) return 0;
  const d1 = new Date(inicio);
  const d2 = new Date(fin);
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return 0;
  if (d2 < d1) return 0;
  return Math.floor((d2 - d1) / 86400000) + 1;
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

function normalizarTelefono(telefono) {
  const limpio = String(telefono || "").replace(/[^\d+]/g, "");
  if (!limpio) return "";
  if (limpio.startsWith("+")) return limpio.replace(/[^\d]/g, "");
  return limpio.replace(/[^\d]/g, "");
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

function campoInline(id, placeholder, extra = "") {
  return `
    <input id="${id}" placeholder="${escapeHtmlAttr(placeholder)}" ${extra} style="${input()}">
  `;
}

function campoSelectInline(id, options, selectedValue) {
  return `
    <select id="${id}" style="${input()}">
      ${options.map((opt) => `
        <option value="${escapeHtmlAttr(opt.value)}" ${String(opt.value) === String(selectedValue) ? "selected" : ""}>
          ${escapeHtml(opt.text)}
        </option>
      `).join("")}
    </select>
  `;
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

function btnMini(color) {
  return `
    display:inline-flex;
    align-items:center;
    justify-content:center;
    padding:8px 10px;
    border:none;
    border-radius:10px;
    background:${color};
    color:#fff;
    font-weight:700;
    font-size:12px;
    text-decoration:none;
    box-sizing:border-box;
  `;
}

function btnMiniBoton(color) {
  return `
    width:100%;
    padding:10px;
    border:none;
    border-radius:10px;
    background:${color};
    color:#fff;
    font-weight:700;
    font-size:12px;
    box-sizing:border-box;
  `;
}

function linkStyle() {
  return `
    color:#2563eb;
    text-decoration:none;
    font-weight:700;
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

const TIPOS_VIA = [
  "Calle",
  "Avenida",
  "Paseo",
  "Plaza",
  "Camino",
  "Carretera",
  "Ronda",
  "Travesía"
];