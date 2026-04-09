const app = document.getElementById("app");

if (app) {
  app.innerHTML = `
    <div style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#f1f5f9;
      font-family:Arial,sans-serif;
      padding:20px;
      box-sizing:border-box;
    ">
      <div style="
        width:100%;
        max-width:600px;
        background:#ffffff;
        border:1px solid #dbe4ee;
        border-radius:16px;
        padding:24px;
        box-sizing:border-box;
        text-align:center;
      ">
        <h1 style="margin:0 0 12px 0;color:#0f172a;">Zentryx</h1>
        <div style="font-size:18px;color:#334155;">APP MÍNIMA CARGADA</div>
      </div>
    </div>
  `;
}