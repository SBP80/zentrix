const app = document.getElementById("app");

function renderLogin() {
  app.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#eef3f8;padding:24px;">
      <div style="width:100%;max-width:420px;background:white;border-radius:20px;padding:24px;box-shadow:0 12px 30px rgba(0,0,0,0.08);">
        <h1 style="margin:0 0 8px 0;">Zentryx</h1>
        <p style="margin:0 0 20px 0;color:#64748b;">Versión prueba panel lateral</p>

        <input id="email" placeholder="admin" style="width:100%;height:48px;margin-bottom:12px;padding:0 14px;border:1px solid #dbe3ec;border-radius:12px;" />
        <input id="password" type="password" placeholder="1234" style="width:100%;height:48px;margin-bottom:12px;padding:0 14px;border:1px solid #dbe3ec;border-radius:12px;" />

        <button id="loginBtn" style="width:100%;height:48px;border:none;border-radius:12px;background:#2563eb;color:white;font-weight:700;">
          Entrar
        </button>

        <p id="msg" style="color:#b91c1c;"></p>
      </div>
    </div>
  `;

  document.getElementById("loginBtn").onclick = () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "admin" && password === "1234") {
      localStorage.setItem("auth", "ok");
      renderApp();
    } else {
      document.getElementById("msg").innerText = "Datos incorrectos";
    }
  };
}

function renderApp() {
  app.innerHTML = `
    <div style="min-height:100vh;display:flex;background:#eef3f8;">
      <aside style="width:260px;background:#0f172a;color:white;padding:20px;">
        <h2 style="margin-top:0;">MENÚ ZENTRYX</h2>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <button style="height:44px;border:none;border-radius:10px;background:#2563eb;color:white;">Inicio</button>
          <button style="height:44px;border:none;border-radius:10px;background:#1e293b;color:white;">Clientes</button>
          <button style="height:44px;border:none;border-radius:10px;background:#1e293b;color:white;">Obras</button>
          <button style="height:44px;border:none;border-radius:10px;background:#1e293b;color:white;">Material</button>
          <button style="height:44px;border:none;border-radius:10px;background:#dc2626;color:white;" onclick="logout()">Cerrar sesión</button>
        </div>
      </aside>

      <main style="flex:1;padding:24px;">
        <h1 style="margin-top:0;">PANEL NUEVO OK</h1>
        <p>Si ves MENÚ ZENTRYX a la izquierda, ya está actualizado.</p>
      </main>
    </div>
  `;
}

function logout() {
  localStorage.removeItem("auth");
  renderLogin();
}

if (localStorage.getItem("auth") === "ok") {
  renderApp();
} else {
  renderLogin();
}