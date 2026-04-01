const app = document.getElementById("app");

// ---------- LOGIN ----------
function renderLogin() {
  app.innerHTML = `
    <div class="login-page">
      <div class="login-card">
        <h1>Zentryx</h1>
        <h2>Acceso</h2>

        <input id="email" placeholder="admin">
        <input id="password" type="password" placeholder="1234">

        <button id="loginBtn">Entrar</button>
        <div id="loginMessage"></div>
      </div>
    </div>
  `;

  document.getElementById("loginBtn").onclick = () => {
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;

    if (email === "admin" && pass === "1234") {
      localStorage.setItem("auth", "ok");

      if (!localStorage.getItem("empresa")) {
        renderSetup();
      } else {
        renderApp();
      }
    } else {
      document.getElementById("loginMessage").innerText = "Datos incorrectos";
    }
  };
}

// ---------- SETUP ----------
function renderSetup() {
  app.innerHTML = `
    <div class="setup-shell">
      <div class="setup-card">
        <h1>Configuración inicial</h1>

        <input id="empresa" placeholder="Nombre empresa">

        <button id="saveSetup">Continuar</button>
      </div>
    </div>
  `;

  document.getElementById("saveSetup").onclick = () => {
    const empresa = document.getElementById("empresa").value;

    if (!empresa) return;

    localStorage.setItem("empresa", empresa);
    renderApp();
  };
}

// ---------- APP PRINCIPAL ----------
function renderApp() {
  const empresa = localStorage.getItem("empresa");

  app.innerHTML = `
    <div class="app-layout">
      
      <aside class="sidebar">
        <h2>${empresa}</h2>

        <button onclick="navigate('inicio')">Inicio</button>
        <button onclick="navigate('clientes')">Clientes</button>
        <button onclick="navigate('obras')">Obras</button>
        <button onclick="navigate('material')">Material</button>
        <button onclick="navigate('vehiculos')">Vehículos</button>
        <button onclick="navigate('config')">Configuración</button>

        <button onclick="logout()" class="logout">Cerrar sesión</button>
      </aside>

      <main id="content"></main>

    </div>
  `;

  navigate("inicio");
}

// ---------- NAVEGACIÓN ----------
function navigate(view) {
  const content = document.getElementById("content");

  if (view === "inicio") {
    content.innerHTML = `<h1>Inicio</h1><p>Panel principal profesional</p>`;
  }

  if (view === "clientes") {
    content.innerHTML = `<h1>Clientes</h1><p>Aquí irá el CRM</p>`;
  }

  if (view === "obras") {
    content.innerHTML = `<h1>Obras</h1>`;
  }

  if (view === "material") {
    content.innerHTML = `<h1>Material</h1>`;
  }

  if (view === "vehiculos") {
    content.innerHTML = `<h1>Vehículos</h1>`;
  }

  if (view === "config") {
    content.innerHTML = `<h1>Configuración</h1>`;
  }
}

// ---------- LOGOUT ----------
function logout() {
  localStorage.clear();
  renderLogin();
}

// ---------- INIT ----------
if (localStorage.getItem("auth") === "ok") {
  if (!localStorage.getItem("empresa")) {
    renderSetup();
  } else {
    renderApp();
  }
} else {
  renderLogin();
}