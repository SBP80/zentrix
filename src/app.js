const app = document.getElementById("app");

const state = {
  loggedIn: false,
  currentView: "inicio",
  menuOpen: false,
};

function render() {
  if (!state.loggedIn) {
    renderLogin();
    return;
  }

  renderDashboard();
}

function renderLogin() {
  app.innerHTML = `
    <div class="auth-shell">
      <div class="auth-panel">
        <div class="auth-top">
          <div class="auth-logo">Z</div>
          <div class="auth-brand">
            <h1>Zentryx</h1>
            <p>Gestión profesional para instalaciones</p>
          </div>
        </div>

        <div class="auth-box">
          <div class="auth-box-head">
            <h2>Acceso</h2>
            <span>Versión base</span>
          </div>

          <div class="field">
            <label for="email">Usuario</label>
            <input id="email" type="text" placeholder="admin" />
          </div>

          <div class="field">
            <label for="password">Contraseña</label>
            <input id="password" type="password" placeholder="1234" />
          </div>

          <button id="loginBtn" class="btn btn-primary btn-full">Entrar</button>

          <p id="loginMessage" class="form-message"></p>

          <div class="auth-help">
            <div><strong>Demo:</strong> admin</div>
            <div><strong>Clave:</strong> 1234</div>
          </div>
        </div>
      </div>
    </div>
  `;

  const loginBtn = document.getElementById("loginBtn");
  const loginMessage = document.getElementById("loginMessage");

  loginBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "admin" && password === "1234") {
      state.loggedIn = true;
      state.currentView = "inicio";
      state.menuOpen = false;
      render();
      return;
    }

    loginMessage.textContent = "Usuario o contraseña incorrectos.";
    loginMessage.className = "form-message error";
  });
}

function getViewTitle() {
  const titles = {
    inicio: "Inicio",
    clientes: "Clientes",
    obras: "Obras",
    suelo: "Suelo radiante",
    material: "Material",
    vehiculos: "Vehículos",
    ajustes: "Ajustes",
  };

  return titles[state.currentView] || "Inicio";
}

function getViewContent() {
  const content = {
    inicio: `
      <div class="cards-grid">
        <article class="card">
          <h3>Clientes</h3>
          <p>Fichas, direcciones, teléfonos y documentación.</p>
        </article>
        <article class="card">
          <h3>Obras</h3>
          <p>Control de trabajos, estados, fechas y técnicos.</p>
        </article>
        <article class="card">
          <h3>Suelo radiante</h3>
          <p>Zona reservada para cálculo, planos y circuitos.</p>
        </article>
        <article class="card">
          <h3>Material</h3>
          <p>Stock, pedidos, consumos y material pendiente.</p>
        </article>
      </div>
    `,
    clientes: `
      <div class="panel-box">
        <h3>Módulo de clientes</h3>
        <p>Aquí irá la lista, búsqueda y ficha completa de cliente.</p>
      </div>
    `,
    obras: `
      <div class="panel-box">
        <h3>Módulo de obras</h3>
        <p>Aquí irá la gestión de instalaciones y seguimiento.</p>
      </div>
    `,
    suelo: `
      <div class="panel-box">
        <h3>Módulo de suelo radiante</h3>
        <p>Aquí construiremos el editor y cálculo paso a paso.</p>
      </div>
    `,
    material: `
      <div class="panel-box">
        <h3>Módulo de material</h3>
        <p>Aquí irá el control de almacén y consumos.</p>
      </div>
    `,
    vehiculos: `
      <div class="panel-box">
        <h3>Módulo de vehículos</h3>
        <p>Aquí irá mantenimiento, ITV y seguimiento.</p>
      </div>
    `,
    ajustes: `
      <div class="panel-box">
        <h3>Ajustes</h3>
        <p>Aquí irá la configuración general del sistema.</p>
      </div>
    `,
  };

  return content[state.currentView] || content.inicio;
}

function renderDashboard() {
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar ${state.menuOpen ? "open" : ""}" id="sidebar">
        <div class="sidebar-head">
          <div class="sidebar-logo">Z</div>
          <div>
            <div class="sidebar-title">Zentryx</div>
            <div class="sidebar-subtitle">Panel general</div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <button class="nav-btn ${state.currentView === "inicio" ? "active" : ""}" data-view="inicio">Inicio</button>
          <button class="nav-btn ${state.currentView === "clientes" ? "active" : ""}" data-view="clientes">Clientes</button>
          <button class="nav-btn ${state.currentView === "obras" ? "active" : ""}" data-view="obras">Obras</button>
          <button class="nav-btn ${state.currentView === "suelo" ? "active" : ""}" data-view="suelo">Suelo radiante</button>
          <button class="nav-btn ${state.currentView === "material" ? "active" : ""}" data-view="material">Material</button>
          <button class="nav-btn ${state.currentView === "vehiculos" ? "active" : ""}" data-view="vehiculos">Vehículos</button>
          <button class="nav-btn ${state.currentView === "ajustes" ? "active" : ""}" data-view="ajustes">Ajustes</button>
        </nav>

        <div class="sidebar-foot">
          <button id="logoutBtn" class="btn btn-danger btn-full">Cerrar sesión</button>
        </div>
      </aside>

      <div class="overlay ${state.menuOpen ? "show" : ""}" id="overlay"></div>

      <main class="main-area">
        <header class="topbar">
          <div class="topbar-left">
            <button id="menuBtn" class="icon-btn" aria-label="Abrir menú">☰</button>
            <div>
              <h1>${getViewTitle()}</h1>
              <p>Base visual lista para seguir construyendo.</p>
            </div>
          </div>
        </header>

        <section class="content-area">
          ${getViewContent()}
        </section>
      </main>
    </div>
  `;

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.currentView = btn.dataset.view;
      state.menuOpen = false;
      render();
    });
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    state.loggedIn = false;
    state.menuOpen = false;
    render();
  });

  document.getElementById("menuBtn").addEventListener("click", () => {
    state.menuOpen = !state.menuOpen;
    render();
  });

  document.getElementById("overlay").addEventListener("click", () => {
    state.menuOpen = false;
    render();
  });
}

render();