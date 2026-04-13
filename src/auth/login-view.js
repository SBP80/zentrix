export function renderLoginView() {
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
            <label style="
              display:block;
              margin-bottom:6px;
              font-weight:700;
              color:#111827;
            ">Usuario</label>

            <input
              type="text"
              placeholder="Introduce tu usuario"
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
            <label style="
              display:block;
              margin-bottom:6px;
              font-weight:700;
              color:#111827;
            ">Contraseña</label>

            <input
              type="password"
              placeholder="Introduce tu contraseña"
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

          <div style="
            min-height:20px;
            color:#16a34a;
            font-size:14px;
            font-weight:700;
          ">LOGIN OK</div>

          <button
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