import { renderLoginView } from "./auth/login-view.js";

const app = document.getElementById("app");

function boot() {
  if (!app) {
    document.body.innerHTML = `
      <div style="
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#f3f4f6;
        font-family:Arial,sans-serif;
        padding:24px;
        box-sizing:border-box;
      ">
        <div style="
          width:100%;
          max-width:700px;
          background:#ffffff;
          border:1px solid #fecaca;
          border-radius:20px;
          padding:24px;
          box-sizing:border-box;
          color:#991b1b;
          font-size:20px;
          font-weight:800;
          text-align:center;
        ">
          Error: no existe el div con id "app"
        </div>
      </div>
    `;
    return;
  }

  try {
    app.innerHTML = renderLoginView();
  } catch (error) {
    app.innerHTML = `
      <div style="
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#f3f4f6;
        font-family:Arial,sans-serif;
        padding:24px;
        box-sizing:border-box;
      ">
        <div style="
          width:100%;
          max-width:700px;
          background:#ffffff;
          border:1px solid #fecaca;
          border-radius:20px;
          padding:24px;
          box-sizing:border-box;
        ">
          <h1 style="
            margin:0 0 12px 0;
            font-size:32px;
            color:#991b1b;
          ">Error cargando app.js</h1>

          <div style="
            padding:16px;
            border:1px solid #fecaca;
            border-radius:14px;
            background:#fef2f2;
            color:#991b1b;
            white-space:pre-wrap;
            word-break:break-word;
            font-size:15px;
          ">${String(error?.message || error)}</div>
        </div>
      </div>
    `;
  }
}

boot();