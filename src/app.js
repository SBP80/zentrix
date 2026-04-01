const app = document.getElementById("app");

function renderLogin() {
  app.innerHTML = `
    <div class="login-page">
      <div class="login-card">
        <div class="brand-block">
          <div class="brand-mark">Z</div>
          <div class="brand-text">
            <h1>Zentryx</h1>
            <p>Sistema modular de gestión</p>
          </div>
        </div>

        <div class="login-form">
          <h2>Acceso</h2>

          <label>Correo</label>
          <input id="email" type="email" placeholder="correo@empresa.com" />

          <label>Contraseña</label>
          <input id="password" type="password" placeholder="••••••••" />

          <button id="loginBtn" class="primary-btn">Entrar</button>

          <div id="loginMessage" class="login-message"></div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("loginBtn").addEventListener("click", () => {
    renderDashboard();
  });
}

function renderDashboard() {
  app.innerHTML = `
    <div style="padding:20px;">
      <h1>Panel principal</h1>
      <p>Esto es la base de la app.</p>

      <button id="logoutBtn">Cerrar sesión</button>
    </div>
  `;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    renderLogin();
  });
}

// Inicio
renderLogin();