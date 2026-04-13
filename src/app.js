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
            style="
              height:50px;
              border:none;
              border-radius:14px;
              background:#4361ee;
              color:#ffffff;
              font-size:18px;
              font-weight:800;
              cursor:pointer;
            "
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

  app.innerHTML = `
    <div style="
      min-height:100vh;
      background:#f3f4f6;
      padding:24px;
      box-sizing:border-box;
      font-family:Arial,sans-serif;
    ">
      <div style="
        max-width:800px;
        margin:0 auto;
        background:#ffffff;
        border:1px solid #dbe4ee;
        border-radius:20px;
        padding:24px;
        box-sizing:border-box;
      ">
        <h1 style="
          margin:0 0 12px 0;
          font-size:34px;
          color:#111827;
        ">Bienvenido ${escapeHtml(user.nombre || user.usuario || "")}</h1>

        <div style="
          margin-bottom:18px;
          color:#475569;
          font-size:16px;
          font-weight:700;
        ">
          Rol: ${escapeHtml(user.rol || "")}
        </div>

        <button
          id="btn_logout"
          type="button"
          style="
            height:48px;
            border:none;
            border-radius:12px;
            background:#dc2626;
            color:#ffffff;
            font-size:16px;
            font-weight:800;
            padding:0 16px;
            cursor:pointer;
          "
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  `;

  document.getElementById("btn_logout")?.addEventListener("click", () => {
    clearSesion();
    renderLogin();
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