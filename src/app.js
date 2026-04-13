import {
  loginUsuario,
  guardarFichaje,
  leerUltimosFichajes,
  guardarEventoAgenda,
  leerEventosAgenda
} from "./data.js";

const app = document.getElementById("app");

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

function escapeHtml(texto) {
  return String(texto || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buttonStyle(bg) {
  return `
    width:100%;
    height:52px;
    border:none;
    border-radius:14px;
    background:${bg};
    color:#ffffff;
    font-size:18px;
    font-weight:800;
    cursor:pointer;
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
        max-width:820px;
        margin:0 auto;
        background:#ffffff;
        border:1px solid #dbe4ee;
        border-radius:20px;
        padding:24px;
        box-sizing:border-box;
      ">
        ${content}
      </div>
    </div>
  `;
}

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
        border-radius:20px;
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
        ">
          Acceso al sistema
        </p>

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
              style="
                width:100%;
                height:48px;
                border:1px solid #cbd5e1;
                border-radius:12px;
                padding:0 14px;
                box-sizing:border-box;
                font-size:16px;
              "
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
              style="
                width:100%;
                height:48px;
                border:1px solid #cbd5e1;
                border-radius:12px;
                padding:0 14px;
                box-sizing:border-box;
                font-size:16px;
              "
            />
          </div>

          <div id="msg" style="
            min-height:20px;
            color:#16a34a;
            font-size:14px;
            font-weight:700;
          ">Listo</div>

          <button
            id="btn_login"
            type="button"
            style="${buttonStyle("#4361ee")}"
          >
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
      line-height:1.6;
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
    </div>

    <button
      id="btn_logout"
      type="button"
      style="
        margin-top:20px;
        ${buttonStyle("#dc2626")}
      "
    >
      Cerrar sesión
    </button>
  `);

  document.getElementById("btn_ir_fichajes")?.addEventListener("click", () => {
    renderFichajes();
  });

  document.getElementById("btn_ir_agenda")?.addEventListener("click", () => {
    renderAgenda();
  });

  document.getElementById("btn_ir_personal")?.addEventListener("click", () => {
    renderPersonal();
  });

  document.getElementById("btn_logout")?.addEventListener("click", () => {
    clearSesion();
    renderLogin();
  });
}

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
      line-height:1.6;
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

      <button id="btn_volver_inicio_1" type="button" style="${buttonStyle("#475569")}">
        Volver
      </button>
    </div>

    <div id="estado_fichaje" style="
      margin-top:20px;
      padding:16px;
      border:1px solid #dbe4ee;
      border-radius:14px;
      background:#f8fafc;
      color:#111827;
      line-height:1.6;
      white-space:pre-wrap;
      word-break:break-word;
    ">
      Estado: listo para fichar.
    </div>

    <div id="lista_fichajes" style="
      margin-top:20px;
      padding:16px;
      border:1px solid #dbe4ee;
      border-radius:14px;
      background:#ffffff;
      color:#111827;
      line-height:1.6;
      white-space:pre-wrap;
      word-break:break-word;
      display:none;
    "></div>
  `);

  document.getElementById("btn_fichar_entrada")?.addEventListener("click", () => {
    fichar("entrada");
  });

  document.getElementById("btn_fichar_salida")?.addEventListener("click", () => {
    fichar("salida");
  });

  document.getElementById("btn_ver_fichajes")?.addEventListener("click", () => {
    verUltimosFichajes();
  });

  document.getElementById("btn_volver_inicio_1")?.addEventListener("click", () => {
    renderHome();
  });
}

async function fichar(tipo) {
  const user = getSesion();
  const estado = document.getElementById("estado_fichaje");

  if (!user || !estado) {
    renderLogin();
    return;
  }

  estado.textContent = "Estado: guardando...";

  try {
    await guardarFichaje({
      usuario_id: user.id,
      trabajador: user.nombre || user.usuario || "Sin nombre",
      tipo,
      nota: ""
    });

    estado.textContent = `Estado: ${tipo} guardada correctamente.`;
  } catch (error) {
    estado.textContent = `Estado: ${error?.message || "error guardando fichaje"}`;
  }
}

async function verUltimosFichajes() {
  const user = getSesion();
  const box = document.getElementById("lista_fichajes");

  if (!user || !box) {
    renderLogin();
    return;
  }

  box.style.display = "block";
  box.textContent = "Cargando fichajes...";

  try {
    const data = await leerUltimosFichajes(user.id, 10);

    if (!Array.isArray(data) || data.length === 0) {
      box.textContent = "No hay fichajes para este usuario.";
      return;
    }

    box.innerHTML = data.map((item) => {
      const fecha = item.created_at
        ? new Date(item.created_at).toLocaleString("es-ES")
        : "";
      return `
        <div style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
          <strong>${escapeHtml(item.tipo || "")}</strong><br>
          ${escapeHtml(fecha)}<br>
          usuario_id: ${escapeHtml(item.usuario_id)}
        </div>
      `;
    }).join("");
  } catch (error) {
    box.textContent = error?.message || "Error cargando fichajes";
  }
}

function renderAgenda() {
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
    ">Agenda</h1>

    <div style="
      margin-bottom:18px;
      color:#475569;
      font-size:16px;
      font-weight:700;
      line-height:1.6;
    ">
      Usuario activo: ${escapeHtml(user.nombre || user.usuario || "")}
      <br>
      ID usuario: ${escapeHtml(user.id)}
    </div>

    <div style="
      display:grid;
      gap:12px;
      margin-bottom:20px;
    ">
      <input
        id="agenda_titulo"
        type="text"
        placeholder="Título del evento"
        style="
          width:100%;
          height:48px;
          border:1px solid #cbd5e1;
          border-radius:12px;
          padding:0 14px;
          box-sizing:border-box;
          font-size:16px;
        "
      />

      <input
        id="agenda_fecha"
        type="date"
        style="
          width:100%;
          height:48px;
          border:1px solid #cbd5e1;
          border-radius:12px;
          padding:0 14px;
          box-sizing:border-box;
          font-size:16px;
        "
      />

      <input
        id="agenda_hora"
        type="time"
        style="
          width:100%;
          height:48px;
          border:1px solid #cbd5e1;
          border-radius:12px;
          padding:0 14px;
          box-sizing:border-box;
          font-size:16px;
        "
      />

      <textarea
        id="agenda_nota"
        placeholder="Nota"
        style="
          width:100%;
          min-height:100px;
          border:1px solid #cbd5e1;
          border-radius:12px;
          padding:14px;
          box-sizing:border-box;
          font-size:16px;
          resize:vertical;
        "
      ></textarea>

      <button id="btn_guardar_evento" type="button" style="${buttonStyle("#4361ee")}">
        Guardar evento
      </button>

      <button id="btn_ver_eventos" type="button" style="${buttonStyle("#0f766e")}">
        Ver mis eventos
      </button>

      <button id="btn_volver_inicio_2" type="button" style="${buttonStyle("#475569")}">
        Volver
      </button>
    </div>

    <div id="estado_agenda" style="
      padding:16px;
      border:1px solid #dbe4ee;
      border-radius:14px;
      background:#f8fafc;
      color:#111827;
      line-height:1.6;
      white-space:pre-wrap;
      word-break:break-word;
    ">
      Estado: listo.
    </div>

    <div id="lista_agenda" style="
      margin-top:20px;
      padding:16px;
      border:1px solid #dbe4ee;
      border-radius:14px;
      background:#ffffff;
      color:#111827;
      line-height:1.6;
      white-space:pre-wrap;
      word-break:break-word;
      display:none;
    "></div>
  `);

  document.getElementById("btn_guardar_evento")?.addEventListener("click", () => {
    guardarEvento();
  });

  document.getElementById("btn_ver_eventos")?.addEventListener("click", () => {
    verEventos();
  });

  document.getElementById("btn_volver_inicio_2")?.addEventListener("click", () => {
    renderHome();
  });
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
    fecha.value = "";
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
  box.textContent = "Cargando eventos...";

  try {
    const data = await leerEventosAgenda(user.id, 20);

    if (!Array.isArray(data) || data.length === 0) {
      box.textContent = "No hay eventos para este usuario.";
      return;
    }

    box.innerHTML = data.map((item) => {
      return `
        <div style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
          <strong>${escapeHtml(item.titulo || "")}</strong><br>
          Fecha: ${escapeHtml(item.fecha || "")}<br>
          Hora: ${escapeHtml(item.hora || "")}<br>
          Nota: ${escapeHtml(item.nota || "")}
        </div>
      `;
    }).join("");
  } catch (error) {
    box.textContent = error?.message || "Error cargando eventos";
  }
}

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
      border-radius:14px;
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

  document.getElementById("btn_volver_inicio_3")?.addEventListener("click", () => {
    renderHome();
  });
}

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