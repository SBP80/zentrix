export function getSesionActual() {
  try {
    return JSON.parse(localStorage.getItem("usuario") || "null");
  } catch {
    return null;
  }
}

export function requireAuth() {
  const sesion = getSesionActual();

  if (!sesion) {
    const app = document.getElementById("app");
    if (app) {
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
            text-align:center;
          ">
            <h1 style="
              margin:0 0 12px 0;
              font-size:32px;
              color:#111827;
            ">Sesión requerida</h1>

            <p style="
              margin:0 0 20px 0;
              color:#475569;
              font-size:16px;
              line-height:1.5;
            ">
              Debes iniciar sesión para acceder a esta parte de Zentryx.
            </p>

            <button id="btn_ir_login" type="button" style="
              width:100%;
              height:50px;
              border:none;
              border-radius:14px;
              background:#4361ee;
              color:#ffffff;
              font-size:18px;
              font-weight:800;
              cursor:pointer;
            ">
              Ir al login
            </button>
          </div>
        </div>
      `;

      document.getElementById("btn_ir_login")?.addEventListener("click", () => {
        window.location.reload();
      });
    }

    return null;
  }

  return sesion;
}

export function logout() {
  localStorage.removeItem("usuario");
  window.location.reload();
}