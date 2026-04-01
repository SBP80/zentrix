const app = document.getElementById("app");

const state = {
  loggedIn: false,
  configured: false,
  currentView: "inicio",
  menuOpen: false,
  empresa: "",
};

function render() {
  if (!state.loggedIn) {
    renderLogin();
    return;
  }

  if (!state.configured) {
    renderSetup();
    return;
  }

  renderDashboard();
}

/* LOGIN */

function renderLogin() {
  app.innerHTML = `
    <div class="auth-shell">
      <div class="auth-container">

        <section class="auth-hero">
          <div class="auth-hero-badge">Z</div>
          <div class="auth-hero-text">
            <h1>Zentryx</h1>
            <p>Gestión profesional de instalaciones</p>
          </div>
        </section>

        <section class="auth-card">
          <h2>Acceso</h2>

          <input id="email" placeholder="admin" />
          <input id="password" type="password" placeholder="1234" />

          <button id="loginBtn" class="btn btn-primary btn-full">Entrar</button>

          <p id="loginMessage" class="form-message"></p>
        </section>
      </div>
    </div>
  `;

  document.getElementById("loginBtn").onclick = () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "admin" && password === "1234") {
      state.loggedIn = true;
      render();
    } else {
      document.getElementById("loginMessage").innerText = "Datos incorrectos";
    }
  };
}

/* SETUP */

function renderSetup() {
  app.innerHTML = `
    <div class="setup-shell">
      <div class="setup-card">

        <h1>Configuración inicial</h1>
        <p>Antes de empezar, introduce los datos básicos.</p>

        <div class="field-group">
          <label>Nombre de la empresa</label>
          <input id="empresa" placeholder="Ej: Allcalor" />
        </div>

        <button id="saveSetup" class="btn btn-primary btn-full">
          Continuar
        </button>

      </div>
    </div>
  `;

  document.getElementById("saveSetup").onclick = () => {
    const empresa = document.getElementById("empresa").value.trim();

    if (!empresa) return;

    state.empresa = empresa;
    state.configured = true;

    render();
  };
}

/* DASHBOARD */

function renderDashboard() {
  app.innerHTML = `
    <div class="app-shell">

      <aside class="sidebar ${state.menuOpen ? "open" : ""}">
        <h2>${state.empresa}</h2>

        <button onclick="go('inicio')">Inicio</button>
        <button onclick="go('clientes')">Clientes</button>
        <button onclick="logout()">Cerrar sesión</button>
      </aside>

      <main class="main-area">
        <header class="topbar">
          <button onclick="toggleMenu()">☰</button>
          <h1>${state.currentView}</h1>
        </header>

        <section class="content-area">
          <p>Base lista</p>
        </section>
      </main>

    </div>
  `;
}

/* FUNCIONES */

function go(view) {
  state.currentView = view;
  render();
}

function toggleMenu() {
  state.menuOpen = !state.menuOpen;
  render();
}

function logout() {
  state.loggedIn = false;
  state.configured = false;
  render();
}

/* INICIO */

render();