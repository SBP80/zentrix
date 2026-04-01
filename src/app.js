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
      <div class="auth-container">

        <section class="auth-hero">
          <div class="auth-hero-badge">Z</div>
          <div class="auth-hero-text">
            <h1>Zentryx</h1>
            <p>Gestión profesional de instalaciones</p>
          </div>
        </section>

        <section class="auth-card">
          <div class="auth-card-head">
            <div>
              <h2>Acceso</h2>
              <p>Base inicial del sistema</p>
            </div>
          </div>

          <div class="field-group">
            <label for="email">Usuario</label>
            <input id="email" type="text" placeholder="admin" autocomplete="username" />
          </div>

          <div class="field-group">
            <label for="password">Contraseña</label>
            <input id="password" type="password" placeholder="1234" autocomplete="current-password" />
          </div>

          <button id="loginBtn" class="btn btn-primary btn-full">Entrar</button>

          <p id="loginMessage" class="form-message"></p>

          <div class="auth-demo">
            <span><strong>Usuario:</strong> admin</span>
            <span><strong>Clave:</strong> 1234</span>
          </div>
        </section>
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

function getViewSubtitle() {
  const subtitles = {
    inicio: "Resumen general del sistema.",
    clientes: "Gestión de fichas y datos de cliente.",
    obras: "Seguimiento general de trabajos.",
    suelo: "Zona reservada para cálculo y planos.",
    material: "Control de almacén y consumos.",
    vehiculos: "Gestión de flota y mantenimiento.",
    ajustes: "Configuración general del sistema.",
  };

  return subtitles[state.currentView] || "";
}

function getViewContent() {
  const content = {
    inicio: `
      <section class="stats-grid">
        <article class="stat-card">
          <span class="stat-label">Clientes</span>
          <strong class="stat-value">0</strong>
          <p class="stat-note">Pendiente de conectar datos reales.</p>
        </article>

        <article class="stat-card">
          <span class="stat-label">Obras activas</span>
          <strong class="stat-value">0</strong>
          <p class="stat-note">Base visual preparada.</p>
        </article>

        <article class="stat-card">
          <span class="stat-label">Avisos</span>
          <strong class="stat-value">0</strong>
          <p class="stat-note">Zona para alertas del sistema.</p>
        </article>
      </section>

      <section class="modules-grid">
        <button class="module-card" data-view="clientes">
          <div class="module-icon">👤</div>
          <div class="module-text">
            <h3>Clientes</h3>
            <p>Ficha, contacto, dirección y documentación.</p>
          </div>
        </button>

        <button class="module-card" data-view="obras">
          <div class="module-icon">🏗️</div>
          <div class="module-text">
            <h3>Obras</h3>
            <p>Control de instalaciones, estados y fechas.</p>
          </div>
        </button>

        <button class="module-card" data-view="suelo">
          <div class="module-icon">📐</div>
          <div class="module-text">
            <h3>Suelo radiante</h3>
            <p>Cálculo, planos y circuitos.</p>
          </div>
        </button>

        <button class="module-card" data-view="material">
          <div class="module-icon">📦</div>
          <div class="module-text">
            <h3>Material</h3>
            <p>Stock, pedidos y consumo de obra.</p>
          </div>
        </button>

        <button class="module-card" data-view="vehiculos">
          <div class="module-icon">🚐</div>
          <div class="module-text">
            <h3>Vehículos</h3>
            <p>ITV, mantenimiento y seguimiento.</p>
          </div>
        </button>

        <button class="module-card" data-view="ajustes">
          <div class="module-icon">⚙️</div>
          <div class="module-text">
            <h3>Ajustes</h3>
            <p>Configuración general del sistema.</p>
          </div>
        </button>
      </section>
    `,
    clientes: `
      <section class="panel-box">
        <div class="panel-box-head">
          <h3>Módulo de clientes</h3>
          <button class="btn btn-secondary">Nuevo cliente</button>
        </div>
        <p>Aquí irá la lista, búsqueda y ficha completa de cliente.</p>
      </section>
    `,
    obras: `
      <section class="panel-box">
        <div class="panel-box-head">
          <h3>Módulo de obras</h3>
          <button class="btn btn-secondary">Nueva obra</button>
        </div>
        <p>Aquí irá el control de instalaciones, estados, fechas y técnicos.</p>
      </section>
    `,
    suelo: `
      <section class="panel-box">
        <div class="panel-box-head">
          <h3>Módulo de suelo radiante</h3>
          <button class="btn btn-secondary">Nuevo proyecto</button>
        </div>
        <p>Aquí construiremos el editor de estancias, cálculo y planos.</p>
      </section>
    `,
    material: `
      <section class="panel-box">
        <div class="panel-box-head">
          <h3>Módulo de material</h3>
          <button class="btn btn-secondary">Nuevo material</button>
        </div>
        <p>Aquí irá el control de almacén, entradas, salidas y pedidos.</p>
      </section>
    `,
    vehiculos: `
      <section class="panel-box">
        <div class="panel-box-head">
          <h3>Módulo de vehículos</h3>
          <button class="btn btn-secondary">Nuevo aviso</button>
        </div>
        <p>Aquí irá mantenimiento, ITV, kilometraje y estado de flota.</p>
      </section>
    `,
    ajustes: `
      <section class="panel-box">
        <div class="panel-box-head">
          <h3>Ajustes</h3>
          <button class="btn btn-secondary">Guardar cambios</button>
        </div>
        <p>Aquí irá la configuración general del sistema y de cada módulo.</p>
      </section>
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
          <div class="sidebar-brand-text">
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

        <div class="sidebar-footer">
          <button id="logoutBtn" class="btn btn-danger btn-full">Cerrar sesión</button>
        </div>
      </aside>

      <div class="app-overlay ${state.menuOpen ? "show" : ""}" id="appOverlay"></div>

      <main class="main-area">
        <header class="topbar">
          <div class="topbar-left">
            <button id="menuBtn" class="icon-btn" aria-label="Abrir menú">☰</button>
            <div class="topbar-title-block">
              <h1>${getViewTitle()}</h1>
              <p>${getViewSubtitle()}</p>
            </div>
          </div>

          <div class="topbar-right">
            <button class="btn btn-secondary">Buscar</button>
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

  document.querySelectorAll(".module-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.currentView = card.dataset.view;
      render();
    });
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    state.loggedIn = false;
    state.currentView = "inicio";
    state.menuOpen = false;
    render();
  });

  document.getElementById("menuBtn").addEventListener("click", () => {
    state.menuOpen = !state.menuOpen;
    render();
  });

  document.getElementById("appOverlay").addEventListener("click", () => {
    state.menuOpen = false;
    render();
  });
}

render();