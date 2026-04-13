const SUPABASE_URL = "https://fxxfgbxnqhtlrwiyyafu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_1RbCV4I_yhpFwZl4wK7e2Q_a6FSyoxC";

const app = document.getElementById("app");

function headers(extra = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: "Bearer " + SUPABASE_ANON_KEY,
    ...extra
  };
}

function restUrl(path = "") {
  return `${SUPABASE_URL}/rest/v1/${path}`;
}

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
      const url = restUrl(
        `personal?select=*&usuario=eq.${encodeURIComponent(usuario)}&password=eq.${encodeURIComponent(password)}&activo=eq.true`
      );

      const res = await fetch(url, {
        method: "GET",
        headers: headers({ Accept: "application/json" })
      });

      const data = await res.json();

      if (!res.ok) {
        msg.style.color = "#b91c1c";
        msg.textContent = data?.message || "Error consultando usuarios";
        return;
      }

      if (!Array.isArray(data) || data.length === 0) {
        msg.style.color = "#b91c1c";
        msg.textContent = "Usuario o contraseña incorrectos";
        return;
      }

      setSesion(data[0]);
      renderHome();
    } catch (error) {
      msg.style.color = "#b91c1c";
      msg.textContent = "Error de conexión";
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
    ">
      Usuario activo: ${escapeHtml(user.nombre || user.usuario || "")}
    </div>

    <div style="display:grid;gap:12px;">
      <button id="btn_fichar_entrada" type="button" style="${buttonStyle("#16a34a")}">
        Entrada
      </button>

      <button id="btn_fichar_salida" type="button" style="${buttonStyle("#dc2626")}">
        Salida
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
  `);

  document.getElementById("btn_fichar_entrada")?.addEventListener("click", () => {
    fichar("entrada");
  });

  document.getElementById("btn_fichar_salida")?.addEventListener("click", () => {
    fichar("salida");
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
    const payload = {
      trabajador: user.nombre || user.usuario || "Sin nombre",
      tipo,
      nota: ""
    };

    const res = await fetch(restUrl("fichajes"), {
      method: "POST",
      headers: headers({
        "Content-Type": "application/json",
        Prefer: "return=representation"
      }),
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      estado.textContent = "Estado: error guardando fichaje";
      return;
    }

    estado.textContent = `Estado: ${tipo} guardada correctamente.`;
  } catch (error) {
    estado.textContent = "Estado: error de conexión";
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
    ">
      Usuario activo: ${escapeHtml(user.nombre || user.usuario || "")}
    </div>

    <div style="
      padding:16px;
      border:1px solid #dbe4ee;
      border-radius:14px;
      background:#f8fafc;
      color:#111827;
      line-height:1.6;
      margin-bottom:16px;
    ">
      Agenda base operativa.
    </div>

    <button id="btn_volver_inicio_2" type="button" style="${buttonStyle("#475569")}">
      Volver
    </button>
  `);

  document.getElementById("btn_volver_inicio_2")?.addEventListener("click", () => {
    renderHome();
  });
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