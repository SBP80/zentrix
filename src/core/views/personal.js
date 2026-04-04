import { db } from "../db.js";

export function renderPersonal() {
  const trabajadores = db.personal.getAll();
  const editId = localStorage.getItem("zentryx_personal_edit_id") || "";

  setTimeout(() => {
    activarEventos();
  }, 0);

  return `
    <div style="max-width:1200px;width:100%;">
      <div class="panel-card">
        <h3 style="margin-top:0;">Personal</h3>
        <p style="color:#64748b;margin-bottom:18px;">Equipo, roles y permisos.</p>

        ${renderFormulario(editId)}

        <div style="margin-top:24px;display:grid;gap:14px;">
          ${trabajadores.length
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
            `}
        </div>
      </div>
    </div>
  `;
}

function renderFormulario(editId) {
  const lista = db.personal.getAll();
  const editando = editId ? lista.find((t) => String(t.id) === String(editId)) : null;

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
        <div>
          <label for="p_nombre" style="${labelStyle()}">Nombre completo</label>
          <input id="p_nombre" value="${escapeHtmlAttr(editando?.nombre || "")}" style="${inputStyle()}">
        </div>

        <div>
          <label for="p_usuario" style="${labelStyle()}">Usuario</label>
          <input id="p_usuario" value="${escapeHtmlAttr(editando?.usuario || "")}" style="${inputStyle()}">
        </div>

        <div>
          <label for="p_password" style="${labelStyle()}">Contraseña</label>
          <input id="p_password" value="${escapeHtmlAttr(editando?.password || "")}" style="${inputStyle()}">
        </div>

        <div>
          <label for="p_puesto" style="${labelStyle()}">Puesto</label>
          <input id="p_puesto" value="${escapeHtmlAttr(editando?.puesto || "")}" style="${inputStyle()}">
        </div>

        <div>
          <label for="p_telefono" style="${labelStyle()}">Teléfono</label>
          <input id="p_telefono" value="${escapeHtmlAttr(editando?.telefono || "")}" style="${inputStyle()}">
        </div>

        <div>
          <label for="p_email" style="${labelStyle()}">Email</label>
          <input id="p_email" value="${escapeHtmlAttr(editando?.email || "")}" style="${inputStyle()}">
        </div>

        <div>
          <label for="p_vac" style="${labelStyle()}">Vacaciones disponibles</label>
          <input id="p_vac" type="number" value="${escapeHtmlAttr(String(editando?.vacaciones?.disponibles ?? 30))}" style="${inputStyle()}">
        </div>

        <div>
          <label for="p_mos" style="${labelStyle()}">Moscosos disponibles</label>
          <input id="p_mos" type="number" value="${escapeHtmlAttr(String(editando?.moscosos?.disponibles ?? 2))}" style="${inputStyle()}">
        </div>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;">
        <button id="btn_guardar_trabajador" type="button" style="${btnPrincipal()}">
          ${editando ? "Guardar cambios" : "+ Crear trabajador"}
        </button>

        ${editando ? `
          <button id="btn_cancelar_trabajador" type="button" style="${btnSecundario()}">
            Cancelar edición
          </button>
        ` : ""}
      </div>
    </div>
  `;
}

function renderTrabajador(t) {
  const ausencias = ordenarAusencias(db.ausencias.getByTrabajador(t.id));
  const resumen = calcularResumen(ausencias, t);

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
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <div style="font-size:18px;font-weight:800;color:#0f172a;">
              ${escapeHtml(t.nombre || "Sin nombre")}
            </div>
          </div>

          <div style="margin-top:6px;font-size:13px;color:#64748b;">
            Usuario: ${escapeHtml(t.usuario || "-")} · ${escapeHtml(t.puesto || "-")}
          </div>

          <div style="margin-top:8px;display:grid;gap:6px;font-size:13px;color:#334155;">
            ${t.telefono ? `
              <div>
                <a href="tel:${encodeURIComponent(t.telefono)}" style="${linkStyle()}">📞 ${escapeHtml(t.telefono)}</a>
              </div>
            ` : ""}

            ${t.email ? `
              <div>
                <a href="mailto:${encodeURIComponent(t.email)}" style="${linkStyle()}">✉ ${escapeHtml(t.email)}</a>
              </div>
            ` : ""}
          </div>

          <div style="margin-top:8px;font-size:12px;color:#475569;">
            Vacaciones: ${escapeHtml(String(resumen.vacDisp))} disponibles · ${escapeHtml(String(resumen.vacUsadas))} usadas · ${escapeHtml(String(resumen.vacRest))} restantes
          </div>

          <div style="margin-top:4px;font-size:12px;color:#475569;">
            Moscosos: ${escapeHtml(String(resumen.mosDisp))} disponibles · ${escapeHtml(String(resumen.mosUsados))} usados · ${escapeHtml(String(resumen.mosRest))} restantes
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
            + Añadir ausencia
          </button>
        </div>

        <div style="display:grid;gap:8px;">
          ${ausencias.length
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
            `}
        </div>
      </div>
    </div>
  `;
}

function renderAusencia(a) {
  const dias = contarDias(a.fechaInicio, a.fechaFin);
  const color = getColorAusencia(a.tipo);
  const bg = getBgAusencia(a.tipo);

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
            background:${estadoColor(a.estado)};
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

        ${a.comentario ? `
          <div style="font-size:12px;color:#64748b;margin-top:4px;">
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

function activarEventos() {
  document.getElementById("btn_guardar_trabajador")?.addEventListener("click", guardarTrabajador);
  document.getElementById("btn_cancelar_trabajador")?.addEventListener("click", cancelarEdicion);

  document.querySelectorAll(".btn-editar-trabajador").forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.setItem("zentryx_personal_edit_id", String(btn.dataset.id));
      refrescar();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll(".btn-borrar-trabajador").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ok = window.confirm(`Vas a borrar a ${btn.dataset.nombre || "este trabajador"}. ¿Confirmas?`);
      if (!ok) return;
      db.personal.remove(btn.dataset.id);
      refrescar();
    });
  });

  document.querySelectorAll(".btn-add-ausencia").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const tipo = valueOf(`aus_tipo_${id}`);
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
      const ok = window.confirm("Vas a borrar esta ausencia. ¿Confirmas?");
      if (!ok) return;
      db.ausencias.remove(btn.dataset.id);
      refrescar();
    });
  });
}

function guardarTrabajador() {
  const data = {
    nombre: valueOf("p_nombre"),
    usuario: valueOf("p_usuario"),
    password: valueOf("p_password"),
    puesto: valueOf("p_puesto"),
    telefono: valueOf("p_telefono"),
    email: valueOf("p_email"),
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

  const editId = localStorage.getItem("zentryx_personal_edit_id") || "";

  if (editId) {
    const anterior = db.personal.getAll().find((t) => String(t.id) === String(editId)) || {};
    db.personal.update(editId, {
      ...anterior,
      ...data
    });
    cancelarEdicion(false);
    refrescar();
    return;
  }

  db.personal.create(data);
  refrescar();
}

function cancelarEdicion(refresca = true) {
  localStorage.removeItem("zentryx_personal_edit_id");
  if (refresca) refrescar();
}

function calcularResumen(ausencias, trabajador) {
  let vacUsadas = 0;
  let mosUsados = 0;

  ausencias.forEach((a) => {
    const dias = contarDias(a.fechaInicio, a.fechaFin);
    if (a.tipo === "vacaciones") vacUsadas += dias;
    if (a.tipo === "moscoso") mosUsados += dias;
  });

  const vacDisp = Number(trabajador?.vacaciones?.disponibles ?? 30);
  const mosDisp = Number(trabajador?.moscosos?.disponibles ?? 2);

  return {
    vacDisp,
    vacUsadas,
    vacRest: vacDisp - vacUsadas,
    mosDisp,
    mosUsados,
    mosRest: mosDisp - mosUsados
  };
}

function ordenarAusencias(lista) {
  return [...lista].sort((a, b) => {
    const da = new Date(a.fechaInicio || 0).getTime();
    const dbb = new Date(b.fechaInicio || 0).getTime();
    return da - dbb;
  });
}

function contarDias(inicio, fin) {
  if (!inicio || !fin) return 0;
  const d1 = new Date(inicio);
  const d2 = new Date(fin);
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return 0;
  if (d2 < d1) return 0;
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
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

function estadoColor(estado) {
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

function refrescar() {
  const container = document.getElementById("viewContainer");
  if (!container) return;
  container.innerHTML = renderPersonal();
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

function inputStyle() {
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

function linkStyle() {
  return `
    color:#2563eb;
    display:inline-block;
    margin-right:10px;
    text-decoration:none;
    font-weight:700;
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
