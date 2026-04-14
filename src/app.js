import {
  loginUsuario,
  guardarFichaje,
  leerUltimosFichajes,
  guardarEventoAgenda,
  leerEventosAgenda
} from "./data.js";

const app = document.getElementById("app");

/* =========================
   SESIÓN
========================= */

function getSesion() {
  try {
    return JSON.parse(localStorage.getItem("usuario") || "null");
  } catch {
    return null;
  }
}

function setSesion(user) {
  localStorage.setItem("usuario", JSON.stringify(user));
}

function clearSesion() {
  localStorage.removeItem("usuario");
}

/* =========================
   UTILIDADES
========================= */

function escapeHtml(texto) {
  return String(texto || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatFechaHora(fechaIso) {
  if (!fechaIso) return { fecha: "", hora: "" };

  const d = new Date(fechaIso);

  return {
    fecha: d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }),
    hora: d.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })
  };
}

function colorTipoFichaje(tipo) {
  if (tipo === "entrada") return "#16a34a";
  if (tipo === "salida") return "#dc2626";
  return "#475569";
}

function buttonStyle(bg) {
  return `
    width:100%;
    height:56px;
    border:none;
    border-radius:16px;
    background:${bg};
    color:#ffffff;
    font-size:18px;
    font-weight:800;
    cursor:pointer;
  `;
}

function inputStyle() {
  return `
    width:100%;
    height:50px;
    border:1px solid #cbd5e1;
    border-radius:14px;
    padding:0 14px;
    box-sizing:border-box;
    font-size:16px;
    background:#ffffff;
    color:#111827;
  `;
}

function textareaStyle() {
  return `
    width:100%;
    min-height:110px;
    border:1px solid #cbd5e1;
    border-radius:14px;
    padding:14px;
    box-sizing:border-box;
    font-size:16px;
    background:#ffffff;
    color:#111827;
    resize:vertical;
  `;
}

function pageWrap(content) {
  return `
    <div style="
      min-height:100vh;
      background:#f3f4f6;
      padding:24px;
      box-sizing:border-box;
      font-family:Arial,sans-serif;
    ">
      <div style="
        width:100%;
        max-width:820px;
        margin:0 auto;
        background:#ffffff;
        border:1px solid #dbe4ee;
        border-radius:24px;
        padding:24px;
        box-sizing:border-box;
      ">
        ${content}
      </div>
    </div>
  `;
}

function statusBox(id, texto = "Estado: listo.") {
  return `
    <div id="${id}" style="
      margin-top:20px;
      padding:16px;
      border:1px solid #dbe4ee;
      border-radius:16px;
      background:#f8fafc;
      color:#111827;
      line-height:1.7;
      white-space:pre-wrap;
      word-break:break-word;
    ">${texto}</div>
  `;
}

function cardBox(content) {
  return `
    <div style="
      margin-top:12px;
      padding:16px;
      border:1px solid #dbe4ee;
      border-radius:16px;
      background:#ffffff;
      box-shadow:0 1px 2px rgba(0,0,0,0.04);
    ">
      ${content}
    </div>
  `;
}

function hoyPorDefecto() {
  return new Date().toISOString().slice(0, 10);
}

function redondearCoord(valor) {
  if (typeof valor !== "number" || Number.isNaN(valor)) return null;
  return Math.round(valor * 1000000) / 1000000;
}

async function obtenerDireccionAproximada(lat, lng) {
  const latTxt = typeof lat === "number" ? lat.toFixed(6) : "";
  const lngTxt = typeof lng === "number" ? lng.toFixed(6) : "";
  return `Lat ${latTxt}, Lng ${lngTxt}`;
}

function obtenerPosicion() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Este dispositivo no permite obtener ubicación"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => {
        if (error.code === 1) {
          reject(new Error("Permiso de ubicación denegado"));
          return;
        }
        if (error.code === 2) {
          reject(new Error("Ubicación no disponible"));
          return;
        }
        if (error.code === 3) {
          reject(new Error("Tiempo de espera agotado al obtener ubicación"));
          return;
        }
        reject(new Error("No se pudo obtener la ubicación"));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  });
}

async function obtenerDatosUbicacion() {
  const position = await obtenerPosicion();
  const lat = redondearCoord(position.coords.latitude);
  const lng = redondearCoord(position.coords.longitude);
  const direccion = await obtenerDireccionAproximada(lat, lng);

  return { lat, lng, direccion };
}

/* =========================
   LOGIN
========================= */

function renderLogin() {
  app.innerHTML = `
    <div style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:24px;
      box-sizing:border-box;
      background:#f3f4f6;
      font-family:Arial,sans-serif;
    ">
      <div style="
        width:100%;
        max-width:420px;
        background:#ffffff;
        border:1px solid #dbe4ee;
        border-radius:24px;
        padding:24px;
        box-sizing:border-box;
      ">
        <h1 style="
          margin:0 0 10px 0;
          font-size:34px;
          line-height:1.1;
          color:#111827;
        ">Zentryx</h1>

        <p style="
          margin:0 0 24px 0;
          color:#6b7280;
          font-size:16px;
        ">Acceso al sistema</p>

        <div style="display:grid;gap:14px;">
          <div>
            <label for="user" style="
              display:block;
              margin-bottom:6px;
              font-weight:700;
              color:#111827;
            ">Usuario</label>

            <input
              id="user"
              type="text"
              placeholder="Usuario"
              style="${inputStyle()}"
            />
          </div>

          <div>
            <label for="pass" style="
              display:block;
              margin-bottom:6px;
              font-weight:700;
              color:#111827;
            ">Contraseña</label>

            <input
              id="pass"
              type="password"
              placeholder="Contraseña"
              style="${inputStyle()}"
            />
          </div>

          <div id="msg" style="
            min-height:20px;
            color:#16a34a;
            font-size:14px;
            font-weight:700;
          ">Listo</div>

          <button id="btn_login" type="button" style="${buttonStyle("#4361ee")}">
            Entrar
          </button>
        </div>
      </div>
    </div>
  `;

  const btn = document.getElementById("btn_login");
  const userEl = document.getElementById("user");
  const passEl = document.getElementById("pass");
  const msg = document.getElementById("msg");

  async function entrar() {
    const usuario = String(userEl?.value || "").trim();
    const password = String(passEl?.value || "").trim();

    if (!usuario || !password) {
      msg.style.color = "#b91c1c";
      msg.textContent = "Escribe usuario y contraseña";
      return;
    }

    msg.style.color = "#111827";
    msg.textContent = "Comprobando...";

    try {
      const user = await loginUsuario(usuario, password);
      setSesion(user);
      renderHome();
    } catch (error) {
      msg.style.color = "#b91c1c";
      msg.textContent = error?.message || "Error de conexión";
    }
  }

  btn?.addEventListener("click", entrar);

  passEl?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") entrar();
  });
}

/* =========================
   INICIO
========================= */

function renderHome() {
  const user = getSesion();

  if (!user) {
    renderLogin();
    return;
  }

  app.innerHTML = pageWrap(`
    <h1 style="
      margin:0 0 12px 0;
      font-size:34px;
      color:#111827;
    ">Zentryx</h1>

    <div style="
      margin-bottom:18px;
      color:#475569;
      font-size:16px;
      font-weight:700;
      line-height:1.7;
    ">
      Usuario: ${escapeHtml(user.nombre || user.usuario || "")}
      <br>
      Rol: ${escapeHtml(user.rol || "")}
      <br>
      ID usuario: ${escapeHtml(user.id)}
    </div>

    <div style="display:grid;gap:12px;">
      <button id="btn_ir_fichajes" type="button" style="${buttonStyle("#4361ee")}">
        Ir a fichajes
      </button>

      <button id="btn_ir_agenda" type="button" style="${buttonStyle("#1e293b")}">
        Ir a agenda
      </button>

      <button id="btn_ir_personal" type="button" style="${buttonStyle("#0f766e")}">
        Ir a personal
      </button>

      <button id="btn_logout" type="button" style="${buttonStyle("#dc2626")}">
        Cerrar sesión
      </button>
    </div>
  `);

  document.getElementById("btn_ir_fichajes")?.addEventListener("click", renderFichajes);
  document.getElementById("btn_ir_agenda")?.addEventListener("click", renderAgenda);
  document.getElementById("btn_ir_personal")?.addEventListener("click", renderPersonal);

  document.getElementById("btn_logout")?.addEventListener("click", () => {
    clearSesion();
    renderLogin();
  });
}

/* =========================
   FICHAJES
========================= */

function renderFichajes() {
  const user = getSesion();

  if (!user) {
    renderLogin();
    return;
  }

  app.innerHTML = pageWrap(`
    <h1 style="
      margin:0 0 12px 0;
      font-size:34px;
      color:#111827;
    ">Fichajes</h1>

    <div style="
      margin-bottom:18px;
      color:#475569;
      font-size:16px;
      font-weight:700;
      line-height:1.7;
    ">
      Usuario activo: ${escapeHtml(user.nombre || user.usuario || "")}
      <br>
      ID usuario: ${escapeHtml(user.id)}
    </div>

    <div style="display:grid;gap:12px;">
      <button id="btn_fichar_entrada" type="button" style="${buttonStyle("#16a34a")}">
        Entrada
      </button>

      <button id="btn_fichar_salida" type="button" style="${buttonStyle("#dc2626")}">
        Salida
      </button>

      <button id="btn_ver_fichajes" type="button" style="${buttonStyle("#0f766e")}">
        Ver mis últimos fichajes
      </button>

      <button id="btn_ocultar_fichajes" type="button" style="${buttonStyle("#334155")}">
        Ocultar historial
      </button>

      <button id="btn_volver_inicio_1" type="button" style="${buttonStyle("#475569")}">
        Volver
      </button>
    </div>

    ${statusBox("estado_fichaje", "Estado: listo para fichar.")}

    <div id="resumen_fichajes" style="
      margin-top:20px;
      padding:16px;
      border:1px solid #dbe4ee;
      border-radius:16px;
      background:#f8fafc;
      color:#111827;
      line-height:1.7;
      display:none;
    "></div>

    <div id="lista_fichajes" style="
      margin-top:20px;
      display:none;
    "></div>
  `);

  document.getElementById("btn_fichar_entrada")?.addEventListener("click", () => fichar("entrada"));
  document.getElementById("btn_fichar_salida")?.addEventListener("click", () => fichar("salida"));
  document.getElementById("btn_ver_fichajes")?.addEventListener("click", verUltimosFichajes);
  document.getElementById("btn_ocultar_fichajes")?.addEventListener("click", ocultarHistorialFichajes);
  document.getElementById("btn_volver_inicio_1")?.addEventListener("click", renderHome);
}

async function obtenerUltimoFichajeUsuario(usuarioId) {
  const data = await leerUltimosFichajes(usuarioId, 1);

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  return data[0];
}

async function fichar(tipo) {
  const user = getSesion();
  const estado = document.getElementById("estado_fichaje");

  if (!user || !estado) {
    renderLogin();
    return;
  }

  estado.textContent = "Estado: comprobando...";

  try {
    const ultimo = await obtenerUltimoFichajeUsuario(user.id);

    if (tipo === "entrada" && ultimo?.tipo === "entrada") {
      const fh = formatFechaHora(ultimo.created_at);
      estado.textContent =
        `Estado: no se puede registrar otra entrada seguida.\nÚltima entrada: ${fh.fecha} ${fh.hora}`;
      return;
    }

    if (tipo === "salida" && !ultimo) {
      estado.textContent =
        "Estado: no se puede registrar salida porque no existe una entrada previa.";
      return;
    }

    if (tipo === "salida" && ultimo?.tipo === "salida") {
      const fh = formatFechaHora(ultimo.created_at);
      estado.textContent =
        `Estado: no se puede registrar otra salida seguida.\nÚltima salida: ${fh.fecha} ${fh.hora}`;
      return;
    }

    estado.textContent = "Estado: obteniendo ubicación...";

    const ubicacion = await obtenerDatosUbicacion();

    estado.textContent = "Estado: guardando...";

    await guardarFichaje({
      usuario_id: user.id,
      trabajador: user.nombre || user.usuario || "Sin nombre",
      tipo,
      nota: "",
      lat: ubicacion.lat,
      lng: ubicacion.lng,
      direccion: ubicacion.direccion
    });

    estado.textContent =
      `Estado: ${tipo} guardada correctamente.\nUbicación: ${ubicacion.direccion}`;

    await verUltimosFichajes();
  } catch (error) {
    estado.textContent = `Estado: ${error?.message || "error guardando fichaje"}`;
  }
}

function ocultarHistorialFichajes() {
  const resumen = document.getElementById("resumen_fichajes");
  const lista = document.getElementById("lista_fichajes");

  if (resumen) {
    resumen.style.display = "none";
    resumen.innerHTML = "";
  }

  if (lista) {
    lista.style.display = "none";
    lista.innerHTML = "";
  }
}

async function verUltimosFichajes() {
  const user = getSesion();
  const resumen = document.getElementById("resumen_fichajes");
  const lista = document.getElementById("lista_fichajes");

  if (!user || !resumen || !lista) {
    renderLogin();
    return;
  }

  resumen.style.display = "block";
  lista.style.display = "block";

  resumen.textContent = "Cargando historial...";
  lista.innerHTML = "";

  try {
    const data = await leerUltimosFichajes(user.id, 10);

    if (!Array.isArray(data) || data.length === 0) {
      resumen.innerHTML = `
        <strong>Historial</strong><br>
        No hay fichajes para este usuario.
      `;
      lista.innerHTML = "";
      return;
    }

    const total = data.length;
    const entradas = data.filter((item) => item.tipo === "entrada").length;
    const salidas = data.filter((item) => item.tipo === "salida").length;
    const ultimo = data[0];
    const fhUltimo = formatFechaHora(ultimo.created_at);

    resumen.innerHTML = `
      <div style="font-size:18px;font-weight:800;color:#111827;margin-bottom:8px;">
        Historial cargado
      </div>
      <div style="color:#475569;font-weight:700;line-height:1.8;">
        Registros mostrados: ${escapeHtml(total)}<br>
        Entradas: ${escapeHtml(entradas)}<br>
        Salidas: ${escapeHtml(salidas)}<br>
        Último fichaje: ${escapeHtml(ultimo.tipo || "")} - ${escapeHtml(fhUltimo.fecha)} ${escapeHtml(fhUltimo.hora)}
      </div>
    `;

    lista.innerHTML = data.map((item) => {
      const fh = formatFechaHora(item.created_at);
      const color = colorTipoFichaje(item.tipo);
      const direccion = item.direccion || "Sin dirección";

      return cardBox(`
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          flex-wrap:wrap;
          margin-bottom:10px;
        ">
          <div style="
            font-size:18px;
            font-weight:800;
            color:${color};
            text-transform:capitalize;
          ">
            ${escapeHtml(item.tipo || "")}
          </div>

          <div style="
            padding:6px 10px;
            border-radius:999px;
            background:#f1f5f9;
            color:#334155;
            font-size:13px;
            font-weight:700;
          ">
            ID usuario: ${escapeHtml(item.usuario_id)}
          </div>
        </div>

        <div style="
          color:#111827;
          font-size:16px;
          font-weight:700;
          line-height:1.8;
        ">
          Fecha: ${escapeHtml(fh.fecha)}<br>
          Hora: ${escapeHtml(fh.hora)}
        </div>

        <div style="
          margin-top:10px;
          color:#64748b;
          font-size:14px;
          line-height:1.6;
        ">
          Trabajador: ${escapeHtml(item.trabajador || "")}<br>
          Dirección: ${escapeHtml(direccion)}
        </div>
      `);
    }).join("");
  } catch (error) {
    resumen.innerHTML = `
      <strong>Error</strong><br>
      ${escapeHtml(error?.message || "Error cargando fichajes")}
    `;
    lista.innerHTML = "";
  }
}

/* =========================
   AGENDA
========================= */

function renderAgenda() {
  const user = getSesion();

  if (!user) {
    renderLogin();
    return;
  }

  const hoy = hoyPorDefecto();

  app.innerHTML = pageWrap(`
    <h1 style="
      margin:0 0 12px 0;
      font-size:34px;
      color:#111827;
    ">Agenda</h1>

    <div style="
      margin-bottom:18px;
      color:#475569;
      font-size:16px;
      font-weight:700;
      line-height:1.7;
    ">
      Usuario activo: ${escapeHtml(user.nombre || user.usuario || "")}
      <br>
      ID usuario: ${escapeHtml(user.id)}
    </div>

    <div style="display:grid;gap:12px;margin-bottom:20px;">
      <input
        id="agenda_titulo"
        type="text"
        placeholder="Título del evento"
        style="${inputStyle()}"
      />

      <input
        id="agenda_fecha"
        type="date"
        value="${hoy}"
        style="${inputStyle()}"
      />

      <input
        id="agenda_hora"
        type="time"
        style="${inputStyle()}"
      />

      <textarea
        id="agenda_nota"
        placeholder="Nota"
        style="${textareaStyle()}"
      ></textarea>

      <button id="btn_guardar_evento" type="button" style="${buttonStyle("#4361ee")}">
        Guardar evento
      </button>

      <button id="btn_ver_eventos" type="button" style="${buttonStyle("#0f766e")}">
        Ver mis eventos
      </button>

      <button id="btn_ocultar_eventos" type="button" style="${buttonStyle("#334155")}">
        Ocultar eventos
      </button>

      <button id="btn_volver_inicio_2" type="button" style="${buttonStyle("#475569")}">
        Volver
      </button>
    </div>

    ${statusBox("estado_agenda", "Estado: listo.")}

    <div id="lista_agenda" style="
      margin-top:20px;
      display:none;
    "></div>
  `);

  document.getElementById("btn_guardar_evento")?.addEventListener("click", guardarEvento);
  document.getElementById("btn_ver_eventos")?.addEventListener("click", verEventos);
  document.getElementById("btn_ocultar_eventos")?.addEventListener("click", ocultarEventos);
  document.getElementById("btn_volver_inicio_2")?.addEventListener("click", renderHome);
}

async function guardarEvento() {
  const user = getSesion();
  const estado = document.getElementById("estado_agenda");
  const titulo = document.getElementById("agenda_titulo");
  const fecha = document.getElementById("agenda_fecha");
  const hora = document.getElementById("agenda_hora");
  const nota = document.getElementById("agenda_nota");

  if (!user || !estado || !titulo || !fecha || !hora || !nota) {
    renderLogin();
    return;
  }

  const tituloVal = String(titulo.value || "").trim();
  const fechaVal = String(fecha.value || "").trim();
  const horaVal = String(hora.value || "").trim();
  const notaVal = String(nota.value || "").trim();

  if (!tituloVal || !fechaVal) {
    estado.textContent = "Estado: escribe al menos título y fecha.";
    return;
  }

  estado.textContent = "Estado: guardando evento...";

  try {
    await guardarEventoAgenda({
      usuario_id: user.id,
      usuario_nombre: user.nombre || user.usuario || "Sin nombre",
      titulo: tituloVal,
      fecha: fechaVal,
      hora: horaVal,
      nota: notaVal
    });

    estado.textContent = "Estado: evento guardado correctamente.";

    titulo.value = "";
    fecha.value = hoyPorDefecto();
    hora.value = "";
    nota.value = "";
  } catch (error) {
    estado.textContent = error?.message || "Error guardando evento";
  }
}

async function verEventos() {
  const user = getSesion();
  const box = document.getElementById("lista_agenda");

  if (!user || !box) {
    renderLogin();
    return;
  }

  box.style.display = "block";
  box.innerHTML = "Cargando eventos...";

  try {
    const data = await leerEventosAgenda(user.id, 20);

    if (!Array.isArray(data) || data.length === 0) {
      box.innerHTML = cardBox(`
        <div style="color:#111827;line-height:1.8;">
          No hay eventos para este usuario.
        </div>
      `);
      return;
    }

    box.innerHTML = data.map((item) => {
      return cardBox(`
        <div style="
          font-size:18px;
          font-weight:800;
          color:#111827;
          margin-bottom:10px;
        ">
          ${escapeHtml(item.titulo || "")}
        </div>

        <div style="
          color:#334155;
          font-size:15px;
          line-height:1.8;
          font-weight:700;
        ">
          Fecha: ${escapeHtml(item.fecha || "")}<br>
          Hora: ${escapeHtml(item.hora || "")}
        </div>

        <div style="
          margin-top:10px;
          color:#64748b;
          font-size:14px;
          line-height:1.6;
        ">
          Nota: ${escapeHtml(item.nota || "")}
        </div>
      `);
    }).join("");
  } catch (error) {
    box.innerHTML = cardBox(`
      <div style="color:#991b1b;line-height:1.8;">
        ${escapeHtml(error?.message || "Error cargando eventos")}
      </div>
    `);
  }
}

function ocultarEventos() {
  const box = document.getElementById("lista_agenda");
  if (!box) return;
  box.style.display = "none";
  box.innerHTML = "";
}

/* =========================
   PERSONAL
========================= */

function renderPersonal() {
  const user = getSesion();

  if (!user) {
    renderLogin();
    return;
  }

  app.innerHTML = pageWrap(`
    <h1 style="
      margin:0 0 12px 0;
      font-size:34px;
      color:#111827;
    ">Personal</h1>

    <div style="
      padding:16px;
      border:1px solid #dbe4ee;
      border-radius:16px;
      background:#f8fafc;
      color:#111827;
      line-height:1.8;
      margin-bottom:16px;
    ">
      Nombre: ${escapeHtml(user.nombre || "")}
      <br>
      Usuario: ${escapeHtml(user.usuario || "")}
      <br>
      Rol: ${escapeHtml(user.rol || "")}
      <br>
      ID: ${escapeHtml(user.id)}
    </div>

    <button id="btn_volver_inicio_3" type="button" style="${buttonStyle("#475569")}">
      Volver
    </button>
  `);

  document.getElementById("btn_volver_inicio_3")?.addEventListener("click", renderHome);
}

/* =========================
   ARRANQUE
========================= */

function boot() {
  try {
    if (!app) return;

    const user = getSesion();

    if (user) {
      renderHome();
    } else {
      renderLogin();
    }
  } catch (error) {
    document.body.innerHTML = `
      <div style="
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#f3f4f6;
        padding:24px;
        box-sizing:border-box;
        font-family:Arial,sans-serif;
      ">
        <div style="
          width:100%;
          max-width:720px;
          background:#ffffff;
          border:1px solid #fecaca;
          border-radius:20px;
          padding:24px;
          box-sizing:border-box;
        ">
          <h1 style="margin:0 0 12px 0;color:#991b1b;">Error cargando app</h1>
          <div style="
            padding:16px;
            border:1px solid #fecaca;
            border-radius:14px;
            background:#fef2f2;
            color:#991b1b;
            white-space:pre-wrap;
            word-break:break-word;
          ">${escapeHtml(error?.message || String(error))}</div>
        </div>
      </div>
    `;
  }
}

boot();