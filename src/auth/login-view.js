import { initLogin } from "./login.js";

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

      <p style="margin-bottom:20px;color:#6b7280;">
        Acceso al sistema
      </p>

      <form id="loginForm">

        <input 
          id="usuario"
          placeholder="Usuario"
          style="
            width:100%;
            height:50px;
            margin-bottom:12px;
            border-radius:12px;
            border:1px solid #dbe4ee;
            padding:0 12px;
          "
        />

        <input 
          id="password"
          type="password"
          placeholder="Contraseña"
          style="
            width:100%;
            height:50px;
            margin-bottom:16px;
            border-radius:12px;
            border:1px solid #dbe4ee;
            padding:0 12px;
          "
        />

        <button type="submit" style="
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
          Entrar
        </button>

      </form>

    </div>
  </div>
  `;
}