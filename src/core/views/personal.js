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
          Gestión de trabajadores, ausencias y condiciones laborales.
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
  const c = getCondicionesLaborales(t);

  return `
    <div style="
      display:flex;
      flex-direction:column;
      gap:12px;
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

      <div style="${bloqueSeccion()}">
        <div style="${tituloSeccion()}">Datos básicos</div>

        ${campo("Nombre completo", "p_nombre", t.nombre || "")}
        ${campo("Usuario", "p_usuario", t.usuario || "")}
        ${campo("Contraseña", "p_password", t.password || "")}
        ${campo("Puesto", "p_puesto", t.puesto || "")}
        ${campo("Teléfono", "p_telefono", t.telefono || "", 'inputmode="tel"')}
        ${campo("Email", "p_email", t.email || "", 'inputmode="email"')}
        ${campo("DNI", "p_dni", t.dni || "")}
        ${campo("Seguridad Social", "p_nss", t.nss || "")}
        ${campo("Fecha de alta", "p_fechaAlta", t.fechaAlta || "", 'type="date"')}

        ${campoNumero("Vacaciones disponibles", "p_vac_disp", String(t.vacaciones?.disponibles ?? 30))}
        ${campoNumero("Vacaciones usadas", "p_vac_usadas", String(t.vacaciones?.usadas ?? 0))}
        ${campoNumero("Moscosos disponibles", "p_mos_disp", String(t.moscosos?.disponibles ?? 2))}
        ${campoNumero("Moscosos usados", "p_mos_usadas", String(t.moscosos?.usados ?? 0))}

        ${campoSelect(
          "Estado",
          "p_activo",
          [
            { value: "true", text: "Activo" },
            { value: "false", text: "Inactivo" }
          ],
          t.activo !== false ? "true" : "false"
        )}
      </div>

      <div style="${bloqueSeccion()}">
        <div style="${tituloSeccion()}">Dirección</div>

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
      </div>

      <div style="${bloqueSeccion()}">
        <div style="${tituloSeccion()}">Condiciones laborales</div>

        <div style="display:grid;gap:8px;">
          <div style="${subtituloSeccion()}">Días habituales de trabajo</div>
          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;">
            ${checkBoxField("p_dia_lun", "Lunes", c.diasTrabajo.lunes)}
            ${checkBoxField("p_dia_mar", "Martes", c.diasTrabajo.martes)}
            ${checkBoxField("p_dia_mie", "Miércoles", c.diasTrabajo.miercoles)}
            ${checkBoxField("p_dia_jue", "Jueves", c.diasTrabajo.jueves)}
            ${checkBoxField("p_dia_vie", "Viernes", c.diasTrabajo.viernes)}
            ${checkBoxField("p_dia_sab", "Sábado", c.diasTrabajo.sabado)}
            ${checkBoxField("p_dia_dom", "Domingo", c.diasTrabajo.domingo)}
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;">
          ${campo("Hora inicio jornada", "p_hora_inicio", c.horaInicio, 'type="time"')}
          ${campo("Hora fin jornada", "p_hora_fin", c.horaFin, 'type="time"')}
        </div>

        <div style="display:grid;gap:8px;">
          ${checkBoxField("p_trabaja_festivos", "Puede trabajar festivos", c.trabajaFestivos)}
          ${checkBoxField("p_turno_nocturno", "Turno nocturno", c.turnoNocturno)}
        </div>

        <div style="display:grid;gap:8px;">
          <div style="${subtituloSeccion()}">Precios y pluses</div>
          ${campoDecimal("p_hextra_normal", "Hora extra normal (€)", c.horaExtraNormal)}
          ${campoDecimal("p_hextra_festiva", "Hora extra festiva (€)", c.horaExtraFestiva)}
          ${campoDecimal("p_hextra_nocturna", "Hora extra nocturna (€)", c.horaExtraNocturna)}
          ${campoDecimal("p_plus_productividad", "Plus productividad (€)", c.plusProductividad)}
          ${campoDecimal("p_dieta", "Dieta (€)", c.dieta)}
          ${campoDecimal("p_km", "Kilometraje €/km", c.kilometraje)}
        </div>
      </div>

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
  const ausencias = ordenarAusencias(db.ausencias.getByTrabajador(t.id));
  const resumen = calcularResumenTrabajador(t, ausencias);
  const c = getCondicionesLaborales(t);

  const telefonoNormalizado = normalizarTelefono(t.telefono || "");
  const telefonoHref = telefonoNormalizado ? `tel:${telefonoNormalizado}` : "";
  const smsHref = telefonoNormalizado ? `sms:${telefonoNormalizado}` : "";
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
      <div style="display:grid;gap:8px;">
        <div>
          <div style="
            font-weight:800;
            font-size:18px;
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

        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <span style="${pill(t.activo !== false ? "#16a34a" : "#dc2626")}">
            ${t.activo !== false ? "Activo" : "Inactivo"}
          </span>
          ${c.turnoNocturno ? `<span style="${pill("#7c3aed")}">Nocturno</span>` : ""}
          ${c.trabajaFestivos ? `<span style="${pill("#dc2626")}">Festivos</span>` : ""}
        </div>

        <div style="display:grid;gap:6px;font-size:13px;color:#334155;">
          ${
            t.telefono
              ? `
                <div>
                  📞 <a href="${escapeHtmlAttr(telefonoHref)}" style="${linkStyle()}">${escapeHtml(t.telefono)}</a>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                  <a href="${escapeHtmlAttr(telefonoHref)}" style="${btnMini("#2563eb")}">Llamar</a>
                  <a href="${escapeHtmlAttr(smsHref)}" style="${btnMini("#7c3aed")}">SMS</a>
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

          ${t.fechaAlta ? `<div>Alta: ${escapeHtml(formatFecha(t.fechaAlta))}</div>` : ""}
          ${t.dni ? `<div>DNI: ${escapeHtml(t.dni)}</div>` : ""}
          ${t.nss ? `<div>NSS: ${escapeHtml(t.nss)}</div>` : ""}
        </div>

        <div style="display:grid;gap:6px;">
          <div style="${miniBox()}">
            Vacaciones: ${resumen.vacacionesDisponibles} disp. · ${resumen.vacacionesUsadas} usadas · ${resumen.vacacionesRestantes} restantes
          </div>
          <div style="${miniBox()}">
            Moscosos: ${resumen.moscososDisponibles} disp. · ${resumen.moscososUsados} usados · ${resumen.moscososRestantes} restantes
          </div>
        </div>

        <div style="display:grid;gap:6px;">
          <div style="${miniBox()}">
            Días: ${resumenDiasTrabajo(c.diasTrabajo)}
          </div>
          <div style="${miniBox()}">
            Jornada: ${escapeHtml(c.horaInicio)} - ${escapeHtml(c.horaFin)}
          </div>
          <div style="${miniBox()}">
            H. extra normal: ${formatEuro(c.horaExtraNormal)} · festiva: ${formatEuro(c.horaExtraFestiva)} · nocturna: ${formatEuro(c.horaExtraNocturna)}
          </div>
          <div style="${miniBox()}">
            Plus productividad: ${formatEuro(c.plusProductividad)} · Dieta: ${formatEuro(c.dieta)} · Km: ${formatEuro(c.kilometraje)}/km
          </div>
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
    vacaciones: {
      disponibles: numberValue("p_vac_disp", actual.vacaciones?.disponibles ?? 30),
      usadas: numberValue("p_vac_usadas", actual.vacaciones?.usadas ?? 0)
    },
    moscosos: {
      disponibles: numberValue("p_mos_disp", actual.moscosos?.disponibles ?? 2),
      usados: numberValue("p_mos_usadas", actual.moscosos?.usados ?? 0)
    },
    condicionesLaborales: {
      diasTrabajo: {
        lunes: checked("p_dia_lun"),
        martes: checked("p_dia_mar"),
        miercoles: checked("p_dia_mie"),
        jueves: checked("p_dia_jue"),
        viernes: checked("p_dia_vie"),
        sabado: checked("p_dia_sab"),
        domingo: checked("p_dia_dom")
      },
      horaInicio: value("p_hora_inicio") || "08:00",
      horaFin: value("p_hora_fin") || "16:00",
      trabajaFestivos: checked("p_trabaja_festivos"),
      turnoNocturno: checked("p_turno_nocturno"),
      horaExtraNormal: decimalValue("p_hextra_normal", actual.condicionesLaborales?.horaExtraNormal ?? 0),
      horaExtraFestiva: decimalValue("p_hextra_festiva", actual.condicionesLaborales?.horaExtraFestiva ?? 0),
      horaExtraNocturna: decimalValue("p_hextra_nocturna", actual.condicionesLaborales?.horaExtraNocturna ?? 0),
      plusProductividad: decimalValue("p_plus_productividad", actual.condicionesLaborales?.plusProductividad ?? 0),
      dieta: decimalValue("p_dieta", actual.condicionesLaborales?.dieta ?? 0),
      kilometraje: decimalValue("p_km", actual.condicionesLaborales?.kilometraje ?? 0)
    },
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

function getCondicionesLaborales(trabajador) {
  const c = trabajador?.condicionesLaborales || {};

  return {
    diasTrabajo: {
      lunes: c.diasTrabajo?.lunes ?? true,
      martes: c.diasTrabajo?.martes ?? true,
      miercoles: c.diasTrabajo?.miercoles ?? true,
      jueves: c.diasTrabajo?.jueves ?? true,
      viernes: c.diasTrabajo?.viernes ?? true,
      sabado: c.diasTrabajo?.sabado ?? false,
      domingo: c.diasTrabajo?.domingo ?? false
    },
    horaInicio: c.horaInicio || "08:00",
    horaFin: c.horaFin || "16:00",
    trabajaFestivos: c.trabajaFestivos === true,
    turnoNocturno: c.turnoNocturno === true,
    horaExtraNormal: Number(c.horaExtraNormal ?? 0),
    horaExtraFestiva: Number(c.horaExtraFestiva ?? 0),
    horaExtraNocturna: Number(c.horaExtraNocturna ?? 0),
    plusProductividad: Number(c.plusProductividad ?? 0),
    dieta: Number(c.dieta ?? 0),
    kilometraje: Number(c.kilometraje ?? 0)
  };
}

function calcularResumenTrabajador(trabajador, ausencias) {
  let vacacionesUsadasAusencias = 0;
  let moscososUsadosAusencias = 0;

  ausencias.forEach((a) => {
    if (String(a.estado || "") === "rechazada") return;
    const dias = contarDias(a.fechaInicio, a.fechaFin);
    if (a.tipo === "vacaciones") vacacionesUsadasAusencias += dias;
    if (a.tipo === "moscoso") moscososUsadosAusencias += dias;
  });

  const vacacionesDisponibles = Number(trabajador?.vacaciones?.disponibles ?? 30);
  const vacacionesUsadasBase = Number(trabajador?.vacaciones?.usadas ?? 0);
  const vacacionesUsadas = Math.max(vacacionesUsadasBase, vacacionesUsadasAusencias);

  const moscososDisponibles = Number(trabajador?.moscosos?.disponibles ?? 2);
  const moscososUsadosBase = Number(trabajador?.moscosos?.usados ?? 0);
  const moscososUsados = Math.max(moscososUsadosBase, moscososUsadosAusencias);

  return {
    vacacionesDisponibles,
    vacacionesUsadas,
    vacacionesRestantes: vacacionesDisponibles - vacacionesUsadas,
    moscososDisponibles,
    moscososUsados,
    moscososRestantes: moscososDisponibles - moscososUsados
  };
}

function resumenDiasTrabajo(diasTrabajo) {
  const mapa = [
    ["lunes", "L"],
    ["martes", "M"],
    ["miercoles", "X"],
    ["jueves", "J"],
    ["viernes", "V"],
    ["sabado", "S"],
    ["domingo", "D"]
  ];

  const activos = mapa.filter(([k]) => diasTrabajo?.[k]).map(([, txt]) => txt);
  return activos.length ? activos.join(" · ") : "Sin días definidos";
}

function formatEuro(valor) {
  const n = Number(valor || 0);
  return `${n.toFixed(2)} €`;
}

function ordenarAusencias(lista) {
  return [...lista].sort((a, b) => {
    const aa = new Date(a.fechaInicio || 0).getTime();
    const bb = new Date(b.fechaInicio || 0).getTime();
    return aa - bb;
  });
}

function refrescar() {
  const cont = document.getElementById("viewContainer");
  if (!cont) return;
  cont.innerHTML = renderPersonal();
}

function value(id) {
  return document.getElementById(id)?.value?.trim() || "";
}

function checked(id) {
  return !!document.getElementById(id)?.checked;
}

function numberValue(id, fallback) {
  const txt = value(id);
  if (txt === "") return Number(fallback || 0);
  const n = Number(txt);
  return Number.isFinite(n) ? n : Number(fallback || 0);
}

function decimalValue(id, fallback) {
  const txt = value(id).replace(",", ".");
  if (txt === "") return Number(fallback || 0);
  const n = Number(txt);
  return Number.isFinite(n) ? n : Number(fallback || 0);
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

function campoNumero(label, id, valueText) {
  return `
    <div style="display:grid;gap:4px;">
      <label for="${id}" style="${labelStyle()}">${escapeHtml(label)}</label>
      <input id="${id}" type="number" value="${escapeHtmlAttr(valueText)}" style="${input()}">
    </div>
  `;
}

function campoDecimal(id, label, valueText) {
  return `
    <div style="display:grid;gap:4px;">
      <label for="${id}" style="${labelStyle()}">${escapeHtml(label)}</label>
      <input id="${id}" type="number" step="0.01" value="${escapeHtmlAttr(String(valueText ?? 0))}" style="${input()}">
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

function checkBoxField(id, texto, marcado) {
  return `
    <label style="
      display:flex;
      align-items:center;
      gap:8px;
      padding:10px;
      border:1px solid #dbe4ee;
      border-radius:10px;
      background:#fff;
      box-sizing:border-box;
      font-size:14px;
      color:#0f172a;
      font-weight:700;
    ">
      <input id="${id}" type="checkbox" ${marcado ? "checked" : ""}>
      <span>${escapeHtml(texto)}</span>
    </label>
  `;
}

function bloqueSeccion() {
  return `
    display:grid;
    gap:10px;
    padding:12px;
    border:1px solid #e2e8f0;
    border-radius:12px;
    background:#ffffff;
  `;
}

function tituloSeccion() {
  return `
    font-size:14px;
    font-weight:800;
    color:#0f172a;
    margin-bottom:2px;
  `;
}

function subtituloSeccion() {
  return `
    font-size:13px;
    font-weight:700;
    color:#334155;
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