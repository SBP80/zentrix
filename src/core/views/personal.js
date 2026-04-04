import { db } from "../db.js";
import { getDireccionTexto } from "../data/personal.js";
import { contarDiasEntreFechas } from "../data/ausencias.js";

const PERSONAL_DRAFT_KEY = "zentrix_personal_draft_estable_v1";
const PERSONAL_EDIT_KEY = "zentrix_personal_edit_id_estable_v1";

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

export function renderPersonal() {
  const lista = db.personal.getAll();
  const draft = getDraft();
  const editId = localStorage.getItem(PERSONAL_EDIT_KEY) || "";
  const editTrabajador = editId
    ? lista.find((t) => String(t.id) === String(editId))
    : null;

  setTimeout(() => {
    activarEventosFormulario();
    activarBotonesTrabajador();
    activarBotonesAusencias();
  }, 0);

  return `
    <div style="max-width:1200px; width:100%;">
      <div class="panel-card">
        <h3 style="margin-top:0;">Personal</h3>
        <p style="color:#64748b; margin-bottom:18px;">Equipo, roles y permisos.</p>

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
            Editando trabajador: ${escapeHtml(editTrabajador.nombre || "")}
          </div>
        ` : ""}

        ${renderFormulario(draft, !!editTrabajador)}

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

function renderFormulario(draft, editando) {
  return `
    <div style="display:grid; gap:18px;">
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
            ${campoInput("Tipo de vía", "tipoVia", draft.tipoVia, 'list="tipoViaLista" placeholder="Calle, Avenida, Plaza..."')}
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
            ${MODULOS.map(([key, label]) => `
              <label style="${checkWrap()}">
                <input type="checkbox" id="mod_${key}" ${draft.permisosModulos?.[key] ? "checked" : ""}>
                <span>${escapeHtml(label)}</span>
              </label>
            `).join("")}
          </div>
        `
      )}

      ${bloque(
        "Permisos por acciones",
        `
          <div style="${gridChecks()}">
            ${ACCIONES.map(([key, label]) => `
              <label style="${checkWrap()}">
                <input type="checkbox" id="acc_${key}" ${draft.permisosAcciones?.[key] ? "checked" : ""}>
                <span>${escapeHtml(label)}</span>
              </label>
            `).join("")}
          </div>
        `
      )}

      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button id="btnGuardarTrabajador" type="button" style="${btnPrincipal()}">
          ${editando ? "Guardar cambios" : "+ Crear trabajador"}
        </button>

        ${editando ? `
          <button id="btnCancelarEdicionTrabajador" type="button" style="${btnSecundario()}">
            Cancelar edición
          </button>
        ` : ""}
      </div>
    </div>
  `;
}

function renderTrabajador(t) {
  const ausencias = ordenarAusencias(db.ausencias.getByTrabajador(t.id));
  const resumen = calcularResumenAusenciasLocal(ausencias);
  const direccion = getDireccionTexto(t.direccion || {});
  const activo = t.activo !== false;

  return `
    <div style="
      padding:16px;
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
        <div style="flex:1; min-width:280px;">
          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <div style="font-size:18px; font-weight:800; color:#0f172a;">
              ${escapeHtml(t.nombre || "Sin nombre")}
            </div>
            <span style="
              display:inline-flex;
              align-items:center;
              justify-content:center;
              padding:4px 8px;
              border-radius:999px;
              background:${activo ? "#16a34a" : "#dc2626"};
              color:#fff;
              font-size:11px;
              font-weight:700;
            ">
              ${activo ? "Activo" : "Inactivo"}
            </span>
          </div>

          <div style="margin-top:6px; font-size:13px; color:#64748b;">
            Usuario: ${escapeHtml(t.usuario || "-")} · ${escapeHtml(t.puesto || "-")}
          </div>

          <div style="margin-top:8px; display:grid; gap:6px; font-size:13px; color:#334155;">
            ${t.telefono ? `
              <div>
                <a href="tel:${encodeURIComponent(t.telefono)}" style="${link()}">📞 ${escapeHtml(t.telefono)}</a>
                <a href="sms:${encodeURIComponent(t.telefono)}" style="${miniBtn("#0f766e")}">SMS</a>
                <a href="https://wa.me/${encodeURIComponent(normalizaWhatsapp(t.telefono))}" target="_blank" rel="noreferrer" style="${miniBtn("#25D366")}">WhatsApp</a>
              </div>
            ` : ""}

            ${t.email ? `
              <div>
                <a href="mailto:${encodeURIComponent(t.email)}" style="${link()}">✉ ${escapeHtml(t.email)}</a>
              </div>
            ` : ""}

            ${direccion ? `
              <div>
                <div>📍 ${escapeHtml(direccion)}</div>
                <div style="margin-top:6px; display:flex; gap:6px; flex-wrap:wrap;">
                  <a href="https://maps.apple.com/?q=${encodeURIComponent(direccion)}" target="_blank" rel="noreferrer" style="${miniBtn("#2563eb")}">Maps</a>
                  <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}" target="_blank" rel="noreferrer" style="${miniBtn("#16a34a")}">Google Maps</a>
                  <a href="https://waze.com/ul?q=${encodeURIComponent(direccion)}&navigate=yes" target="_blank" rel="noreferrer" style="${miniBtn("#0ea5e9")}">Waze</a>
                </div>
              </div>
            ` : ""}
          </div>

          <div style="margin-top:10px; font-size:12px; color:#475569;">
            DNI: ${escapeHtml(t.dni || "-")} | NSS: ${escapeHtml(t.nss || "-")}
          </div>

          <div style="margin-top:8px; font-size:12px; color:#475569;">
            Vacaciones: ${escapeHtml(String(t.vacaciones?.disponibles ?? 0))} disponibles · ${escapeHtml(String(resumen.vacaciones))} usadas · ${escapeHtml(String((t.vacaciones?.disponibles ?? 0) - resumen.vacaciones))} restantes
          </div>

          <div style="margin-top:4px; font-size:12px; color:#475569;">
            Moscosos: ${escapeHtml(String(t.moscosos?.disponibles ?? 0))} disponibles · ${escapeHtml(String(resumen.moscosos))} usados · ${escapeHtml(String((t.moscosos?.disponibles ?? 0) - resumen.moscosos))} restantes
          </div>

          <div style="margin-top:10px;">
            <div style="font-size:12px; font-weight:700; color:#334155; margin-bottom:6px;">Módulos</div>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              ${renderPills(t.permisosModulos)}
            </div>
          </div>

          <div style="margin-top:10px;">
            <div style="font-size:12px; font-weight:700; color:#334155; margin-bottom:6px;">Acciones</div>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              ${renderPills(t.permisosAcciones)}
            </div>
          </div>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button
            type="button"
            class="btn-editar-trabajador"
            data-id="${escapeHtmlAttr(t.id)}"
            style="${btnEditar()}"
          >
            Editar
          </button>

          <button
            type="button"
            class="btn-borrar-trabajador"
            data-id="${escapeHtmlAttr(t.id)}"
            data-nombre="${escapeHtmlAttr(t.nombre || "")}"
            style="${btnBorrar()}"
          >
            ✕
          </button>
        </div>
      </div>

      <div style="margin-top:16px; padding-top:16px; border-top:1px solid #e2e8f0;">
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          flex-wrap:wrap;
          margin-bottom:10px;
        ">
          <div style="font-size:13px; font-weight:800; color:#0f172a;">
            Ausencias
          </div>
          <div style="font-size:12px; color:#64748b;">
            ${ausencias.length} registradas
          </div>
        </div>

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
            grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));
            gap:8px;
          ">
            <select id="aus_tipo_${escapeHtmlAttr(t.id)}" style="${input()}">
              <option value="vacaciones">Vacaciones</option>
              <option value="moscoso">Moscoso</option>
              <option value="baja">Baja</option>
              <option value="permiso">Permiso</option>
            </select>

            <input id="aus_inicio_${escapeHtmlAttr(t.id)}" type="date" style="${input()}">
            <input id="aus_fin_${escapeHtmlAttr(t.id)}" type="date" style="${input()}">
          </div>

          <input
            id="aus_comentario_${escapeHtmlAttr(t.id)}"
            placeholder="Comentario opcional"
            style="${input()}"
          >

          <button
            type="button"
            class="btn-add-ausencia"
            data-id="${escapeHtmlAttr(t.id)}"
            style="${btnPrincipal()}"
          >
            + Añadir ausencia
          </button>
        </div>

        <div style="display:grid; gap:8px;">
          ${ausencias.length ? ausencias.map(renderAusencia).join("") : `
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
  `;
}

function renderAusencia(a) {
  const color = getColorAusencia(a.tipo);
  const bg = getBgAusencia(a.tipo);
  const dias = contarDiasEntreFechas(a.fechaInicio, a.fechaFin);

  return `
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

      <button
        type="button"
        class="btn-borrar-ausencia"
        data-id="${escapeHtmlAttr(a.id)}"
        style="${btnBorrar()}"
      >
        ✕
      </button>
    </div>
  `;
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

  document.getElementById("btnGuardarTrabajador")?.addEventListener("click", guardarTrabajador);
  document.getElementById("btnCancelarEdicionTrabajador")?.addEventListener("click", cancelarEdicionTrabajador);
}

function activarBotonesTrabajador() {
  document.querySelectorAll(".btn-editar-trabajador").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const trabajador = db.personal.getAll().find((t) => String(t.id) === String(id));
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
        dni: trabajador.dni || "",
        nss: trabajador.nss || "",
        tipoVia: d.tipoVia || "",
        via: d.via || "",
        numero: d.numero || "",
        portal: d.portal || "",
        piso: d.piso || "",
        puerta: d.puerta || "",
        cp: d.cp || "",
        poblacion: d.poblacion || "",
        provincia: d.provincia || "",
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

  document.querySelectorAll(".btn-borrar-trabajador").forEach((btn) => {
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

  document.querySelectorAll(".btn-borrar-ausencia").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const ok = window.confirm("Vas a borrar esta ausencia. ¿Confirmas?");
      if (!ok) return;

      db.ausencias.remove(id);
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
    dni: val("dni"),
    nss: val("nss"),
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
    cancelarEdicionTrabajador(false);
    refrescar();
    return;
  }

  db.personal.create(data);
  clearDraft();
  refrescar();
}

function cancelarEdicionTrabajador(refresca = true) {
  localStorage.removeItem(PERSONAL_EDIT_KEY);
  clearDraft();
  if (refresca) refrescar();
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

function guardarDraftDesdeFormulario() {
  const draft = {
    nombre: val("nombre"),
    usuario: val("usuario"),
    password: val("password"),
    puesto: val("puesto"),
    activo: document.getElementById("activo")?.value !== "false",
    telefono: val("telefono"),
    email: val("email"),
    dni: val("dni"),
    nss: val("nss"),
    tipoVia: val("tipoVia"),
    via: val("via"),
    numero: val("numero"),
    portal: val("portal"),
    piso: val("piso"),
    puerta: val("puerta"),
    cp: val("cp"),
    poblacion: val("poblacion"),
    provincia: val("provincia"),
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
      dni: data.dni || "",
      nss: data.nss || "",
      tipoVia: data.tipoVia || "",
      via: data.via || "",
      numero: data.numero || "",
      portal: data.portal || "",
      piso: data.piso || "",
      puerta: data.puerta || "",
      cp: data.cp || "",
      poblacion: data.poblacion || "",
      provincia: data.provincia || "",
      fechaAlta: data.fechaAlta || "",
      vacDisp: data.vacDisp || "",
      vacUsadas: data.vacUsadas || "",
      mosDisp: data.mosDisp || "",
      mosUsados: data.mosUsados || "",
      permisosModulos: data.permisosModulos || {},
      permisosAcciones: data.permisosAcciones || {}
    };
  } catch (error) {
    return {
      nombre: "",
      usuario: "",
      password: "",
      puesto: "",
      activo: true,
      telefono: "",
      email: "",
      dni: "",
      nss: "",
      tipoVia: "",
      via: "",
      numero: "",
      portal: "",
      piso: "",
      puerta: "",
      cp: "",
      poblacion: "",
      provincia: "",
      fechaAlta: "",
      vacDisp: "",
      vacUsadas: "",
      mosDisp: "",
      mosUsados: "",
      permisosModulos: {},
      permisosAcciones: {}
    };
  }
}

function clearDraft() {
  localStorage.removeItem(PERSONAL_DRAFT_KEY);
}

function ordenarAusencias(lista) {
  return [...lista].sort((a, b) => {
    const da = new Date(a.fechaInicio || 0).getTime();
    const dbb = new Date(b.fechaInicio || 0).getTime();
    return da - dbb;
  });
}

function calcularResumenAusenciasLocal(ausencias) {
  let vacaciones = 0;
  let moscosos = 0;

  ausencias.forEach((a) => {
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

function formateaFecha(fecha) {
  if (!fecha) return "-";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString("es-ES");
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

function refrescar() {
  const container = document.getElementById("viewContainer");
  if (!container) return;
  container.innerHTML = renderPersonal();
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
  return `
    <div style="min-width:0;">
      <label for="${id}" style="${labelStyle()}">${escapeHtml(label)}</label>
      <input
        id="${id}"
        value="${escapeHtmlAttr(value || "")}"
        ${extra}
        style="${input()}"
      />
    </div>
  `;
}

function campoSelectActivo(valor) {
  return `
    <div style="min-width:0;">
      <label for="activo" style="${labelStyle()}">Estado</label>
      <select id="activo" style="${input()}">
        <option value="true" ${valor !== false ? "selected" : ""}>Activo</option>
        <option value="false" ${valor === false ? "selected" : ""}>Inactivo</option>
      </select>
    </div>
  `;
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

function input() {
  return `
    width:100%;
    min-width:0;
    padding:10px 12px;
    height:46px;
    border:1px solid #ccc;
    border-radius:10px;
    background:#fff;
    box-sizing:border-box;
  `;
}

function btnPrincipal() {
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

function btnEditar() {
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

function btnBorrar() {
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
