const app = document.getElementById("app");

if (app) {
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
        border:1px solid #dbe4ee;
        border-radius:20px;
        padding:24px;
        box-sizing:border-box;
        text-align:center;
      ">
        <h1 style="
          margin:0 0 12px 0;
          font-size:34px;
          color:#111827;
        ">Zentryx</h1>

        <div style="
          font-size:20px;
          color:#16a34a;
          font-weight:800;
        ">
          APP MINIMA OK
        </div>
      </div>
    </div>
  `;
}