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
    <div class="dashboard-layout">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="sidebar-brand-mark">Z</div>
          <div>
            <div class="sidebar-brand-title">Zentryx</div>
            <div class="sidebar-brand-subtitle">Panel principal</div>
          </div>
        </div>

        <nav class="sidebar-menu">
          <button class="sidebar-btn active">Inicio</button>
          <button class="sidebar-btn">Clientes</button>
          <button class="sidebar-btn">Obras</button>
          <button class="sidebar-btn">Suelo radiante</button>
          <button class="sidebar-btn">Material</button>
          <button class="sidebar-btn">Vehículos</button>
          <button class="sidebar-btn">Ajustes</button>
        </nav>

        <button id="logoutBtn" class="sidebar-logout">Cerrar sesión</button>
      </aside>

      <main class="dashboard-main">
        <header class="dashboard-header">
          <h1>Panel principal</h1>
          <p>Base visual inicial del sistema.</p>
        </header>

        <section class="dashboard-cards">
          <div class="dashboard-card">
            <h3>Clientes</h3>
            <p>Gestión de fichas, contactos y direcciones.</p>
          </div>

          <div class="dashboard-card">
            <h3>Obras</h3>
            <p>Seguimiento de instalaciones y estados.</p>
          </div>

          <div class="dashboard-card">
            <h3>Suelo radiante</h3>
            <p>Zona reservada para cálculo y planos.</p>
          </div>

          <div class="dashboard-card">
            <h3>Material</h3>
            <p>Control básico de stock y almacén.</p>
          </div>
        </section>
      </main>
    </div>
  `;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    renderLogin();
  });
}

renderLogin();