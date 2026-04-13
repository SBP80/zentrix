import { getSupabaseRestUrl, getSupabaseHeaders } from "../config/supabase.js";

export function renderLoginView() {
  setTimeout(() => {
    initLogin();
  }, 0);

  return `
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
          ">LOGIN OK</div>

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
}

function initLogin() {
  const btn = document.getElementById("btn_login");
  const userEl = document.getElementById("user");
  const passEl = document.getElementById("pass");
  const msg = document.getElementById("msg");

  if (!btn || !userEl || !passEl || !msg) return;

  async function entrar() {
    const usuario = String(userEl.value || "").trim();
    const password = String(passEl.value || "").trim();

    if (!usuario || !password) {
      msg.style.color = "#b91c1c";
      msg.textContent = "Escribe usuario y contraseña";
      return;
    }

    msg.style.color = "#111827";
    msg.textContent = "Comprobando...";

    try {
      const url = getSupabaseRestUrl(
        `personal?select=*&usuario=eq.${encodeURIComponent(usuario)}&password=eq.${encodeURIComponent(password)}&activo=eq.true`
      );

      const res = await fetch(url, {
        method: "GET",
        headers: getSupabaseHeaders({
          Accept: "application/json"
        })
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

      localStorage.setItem("usuario", JSON.stringify(data[0]));
      location.reload();
    } catch (error) {
      msg.style.color = "#b91c1c";
      msg.textContent = "Error de conexión";
    }
  }

  btn.addEventListener("click", entrar);

  passEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") entrar();
  });
}