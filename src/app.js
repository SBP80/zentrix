import { db } from "../data/db.js";

const EDIT_ID_KEY = "zentryx_personal_edit_id";

export function renderPersonal() {
  const trabajadores = db.personal.getAll();
  const editId = localStorage.getItem(EDIT_ID_KEY) || "";
  const editando = trabajadores.find((t) => String(t.id) === String(editId)) || null;

  setTimeout(() => {
    activarEventosPersonal();
  }, 0);

  return `
    <div style="max-width:1200px;width:100%;">
      <div class="panel-card">
        <h3 style="margin-top:0;">Personal</h3>
        <p style="color:#64748b;margin-bottom:18px;">Equipo, roles y permisos.</p>

        ${renderFormularioTrabajador(editando)}

        <div style="margin-top:24px;display:grid;gap:14px;">
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
                  No hay trabajadores todavía.
                </div>
              `
          }
        </div>
      </div>
    </div>
  `;
}

function renderFormularioTrabajador(editando) {
  const t = editando || {};
  const direccion = t.direccion || {};
  const vacaciones = t.vacaciones || {};
  const moscosos = t.moscosos || {};

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
        ${editando ? "Editar trabajador" : "Nuevo trabajador"}
      </div>

      <div style="
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
        gap:10px;
      ">
        ${campo("Nombre completo", "p_nombre", t.nombre || "")}
        ${campo("Usuario", "p_usuario", t.usuario || "")}
        ${campo("Contraseña", "p_password", t.password || "")}
        ${campo("Puesto", "p_puesto", t.puesto || "")}
        ${campoSelectRol(t.rol || "operario")}
        ${campo("Teléfono", "p_telefono", t.telefono || "", 'inputmode="tel"')}
        ${campo("Email", "p_email", t.email || "", 'inputmode="email"')}
        ${campo("DNI", "p_dni", t.dni || "")}
        ${campo("Seguridad Social", "p_nss", t.nss || "")}
        ${campo("Tipo de vía", "p_tipo_via", direccion.tipoVia || "")}
        ${campo("Nombre de la vía", "p_via", direccion.via || "")}
        ${campo("Número", "p_numero", direccion.numero || "")}
        ${campo("Portal", "p_portal", direccion.portal || "")}
        ${campo("Piso", "p_piso", direccion.piso || "")}
        ${campo("Puerta", "p_puerta", direccion.puerta || "")}
        ${campo("Código postal", "p_cp", direccion.cp || "")}
        ${campo("Población", "p_poblacion", direccion.poblacion || "")}
        ${campo("Provincia", "p_provincia", direccion.provincia || "")}
        ${campo("Vacaciones disponibles", "p_vac", String(vacaciones.disponibles ?? 30), 'type="number"')}
        ${campo("Moscosos disponibles", "p_mos", String(moscosos.disponibles ?? 2), 'type="number"')}
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;">
        <button id="btn_guardar_trabajador" type="button" style="${btnPrincipal()}">
          ${editando ? "Guardar cambios" : "Añadir trabajador"}
        </button>

        ${
          editando
            ? `
              <button id="btn_cancelar_trabajador" type="button" style="${btnSecundario()}">
                Cancelar edición
              </button>
            `
            : ""
        }
      </div>
    </div>
  `;
}

function renderTrabajador(t) {
  const ausencias = ordenarAusencias(db.ausencias.getByTrabajador(t.id));
  const resumen = calcularResumenTrabajador(t, ausencias);
  const direccionTexto = getDireccionTexto(t.direccion || {});

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
        <div style="flex:1;min-width:280px;">
          <div style="font-size:18px;font-weight:800;color:#0f172a;">
            ${escapeHtml(t.nombre || "Sin nombre")}
          </div>

          <div style="margin-top:6px;font-size:13px;color:#64748b;">
            ${escapeHtml(t.usuario || "-")} · ${escapeHtml(t.rol || "sin rol")} · ${escapeHtml(t.puesto || "-")}
          </div>

          <div style="margin-top:8px;display:grid;gap:6px;font-size:13px;color:#334155;">
            ${
              t.telefono
                ? `<div><a href="tel:${encodeURIComponent(t.telefono)}" style="${linkStyle()}">📞 ${escapeHtml(t.telefono)}</a></div>`
                : ""
            }
            ${
              t.email
                ? `<div><a href="mailto:${encodeURIComponent(t.email)}" style="${linkStyle()}">✉ ${escapeHtml(t.email)}</a></div>`
                : ""
            }
            ${
              direccionTexto
                ? `<div>📍 ${escapeHtml(direccionTexto)}</div>`
                : ""
            }
            ${
              t.dni
                ? `<div>DNI: ${escapeHtml(t.dni)}</div>`
                : ""
            }
            ${
              t.nss
                ? `<div>NSS: ${escapeHtml(t.nss)}</div>`
                : ""
            }
          </div>

          <div style="margin-top:10px;font-size:12px;color:#475569;">
            Vacaciones: ${escapeHtml(String(resumen.vacacionesDisponibles))} disponibles · ${escapeHtml(String(resumen.vacacionesUsadas))} usadas · ${escapeHtml(String(resumen.vacacionesRestantes))} restantes
          </div>

          <div style="margin-top:4px;font-size:12px;color:#475569;">
            Moscosos: ${escapeHtml(String(resumen.moscososDisponibles))} disponibles · ${escapeHtml(String(resumen.moscososUsados))} usados · ${escapeHtml(String(resumen.moscososRestantes))} restantes
          </div>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;">
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

      <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e2e8f0;">
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

          <input
            id="aus_comentario_${escapeHtmlAttr(t.id)}"
            placeholder="Comentario opcional"
            style="${inputStyle()}"
          >

          <button
            type="button"
            class="btn-add-ausencia"
            data-id="${escapeHtmlAttr(t.id)}"
            style="${btnPrincipal()}"
          >
            Añadir ausencia
          </button>
        </div>

        <div style="display:grid;gap:8px;">
          ${
            ausencias.length
              ? ausencias.map((a) => renderAusencia(a)).join("")
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

function renderAusencia(a) {
  const dias = contarDias(a.fechaInicio, a.fechaFin);

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
        <div style="
          display:flex;
          gap:8px;
          align-items:center;
          flex-wrap:wrap;
        ">
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

        ${
          a.comentario
            ? `<div style="font-size:12px;color:#64748b;margin-top:4px;">${escapeHtml(a.comentario)}</div>`
            : ""
        }
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

function activarEventosPersonal() {
  document.getElementById("btn_guardar_trabajador")?.addEventListener("click", guardarTrabajador);

  document.getElementById("btn_cancelar_trabajador")?.addEventListener("click", () => {
    localStorage.removeItem(EDIT_ID_KEY);
    refrescarPersonal();
  });

  document.querySelectorAll(".btn-editar-trabajador").forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.setItem(EDIT_ID_KEY, String(btn.dataset.id));
      refrescarPersonal();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

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

  document.querySelectorAll(".btn-borrar-ausencia").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ok = window.confirm("Vas a borrar esta ausencia. ¿Confirmas?");
      if (!ok) return;
      db.ausencias.remove(btn.dataset.id);
      refrescarPersonal();
    });
  });
}

function guardarTrabajador() {
  const data = {
    nombre: valueOf("p_nombre"),
    usuario: valueOf("p_usuario"),
    password: valueOf("p_password"),
    puesto: valueOf("p_puesto"),
    rol: valueOf("p_rol") || "operario",
    telefono: valueOf("p_telefono"),
    email: valueOf("p_email"),
    dni: valueOf("p_dni"),
    nss: valueOf("p_nss"),
    direccion: {
      tipoVia: valueOf("p_tipo_via"),
      via: valueOf("p_via"),
      numero: valueOf("p_numero"),
      portal: valueOf("p_portal"),
      piso: valueOf("p_piso"),
      puerta: valueOf("p_puerta"),
      cp: valueOf("p_cp"),
      poblacion: valueOf("p_poblacion"),
      provincia: valueOf("p_provincia")
    },
    vacaciones: {
      disponibles: numberOf("p_vac", 30)
    },
    moscosos: {
      disponibles: numberOf("p_mos", 2)
    }
  };

  if (!data.nombre) {
    alert("El nombre es obligatorio.");
    return;
  }

  const editId = localStorage.getItem(EDIT_ID_KEY) || "";

  if (editId) {
    const actual = db.personal.getAll().find((t) => String(t.id) === String(editId)) || {};
    db.personal.update(editId, {
      ...actual,
      ...data
    });
    localStorage.removeItem(EDIT_ID_KEY);
  } else {
    db.personal.create(data);
  }

  refrescarPersonal();
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

function getDireccionTexto(d) {
  const partes = [
    d.tipoVia,
    d.via,
    d.numero,
    d.portal ? `Portal ${d.portal}` : "",
    d.piso ? `Piso ${d.piso}` : "",
    d.puerta ? `Puerta ${d.puerta}` : "",
    d.cp,
    d.poblacion,
    d.provincia
  ].filter(Boolean);

  return partes.join(", ");
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

function valueOf(id) {
  return document.getElementById(id)?.value?.trim() || "";
}

function numberOf(id, fallback) {
  const raw = valueOf(id);
  if (raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
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

function campoSelectRol(valor) {
  return `
    <div>
      <label for="p_rol" style="${labelStyle()}">Rol</label>
      <select id="p_rol" style="${inputStyle()}">
        <option value="admin" ${valor === "admin" ? "selected" : ""}>Admin</option>
        <option value="encargado" ${valor === "encargado" ? "selected" : ""}>Encargado</option>
        <option value="operario" ${valor === "operario" ? "selected" : ""}>Operario</option>
      </select>
    </div>
  `;
}

function labelStyle() {
  return "display:block;margin-bottom:6px;font-size:13px;font-weight:700;color:#334155;";
}

function inputStyle() {
  return "width:100%;min-width:0;padding:10px 12px;height:46px;border:1px solid #ccc;border-radius:10px;background:#fff;box-sizing:border-box;";
}

function btnPrincipal() {
  return "padding:12px 18px;background:#2563eb;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;";
}

function btnSecundario() {
  return "padding:12px 18px;background:#64748b;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;";
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
