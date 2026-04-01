const app = document.getElementById("app");

// LOGIN
function renderLogin() {
  app.innerHTML = `
    <div class="login-page">
      <div class="login-card">
        <h1>Zentryx</h1>
        <p>Sistema modular de gestión</p>

        <h2>Acceso</h2>

        <input id="email" placeholder="correo@empresa.com" />
        <input id="password" type="password" placeholder="Contraseña" />

        <button id="loginBtn">Entrar</button>

        <p id="loginMessage" style="color:red;"></p>
      </div>
    </div>
  `;

  document.getElementById("loginBtn").onclick = () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (email === "admin" && password === "1234") {
      renderDashboard();
    } else {
      document.getElementById("loginMessage").innerText = "Datos incorrectos";
    }
  };
}

// PANEL
function renderDashboard() {
  app.innerHTML = `
    <div class="dashboard-layout">

      <aside class="sidebar">
        <h2>Zentryx</h2>
        <ul>
          <li>Panel</li>
          <li>Clientes</li>
          <li>Obras</li>
          <li>Material</li>
          <li>Agenda</li>
        </ul>
      </aside>

      <main class="main-content">
        <header class="topbar">
          <button id="logoutBtn">Cerrar sesión</button>
        </header>

        <section class="content">
          <h1>Panel principal</h1>
          <p>Base profesional de la app</p>
        </section>
      </main>

    </div>
  `;

  document.getElementById("logoutBtn").onclick = renderLogin;
}

// ARRANQUE
renderLogin();