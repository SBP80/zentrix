const app = document.getElementById("app");

const state = {
  logged: false,
  view: "inicio",
  menuOpen: false,
};

const defaultConfig = {
  empresa: "Zentryx",
  tema: "claro",
  mostrarSegundos: true,
  formato24h: true,
};

function getConfig() {
  const saved = localStorage.getItem("zentryx_config");
  if (!saved) return { ...defaultConfig };

  try {
    return { ...defaultConfig, ...JSON.parse(saved) };
  } catch {
    return { ...defaultConfig };
  }
}

function saveConfig(config) {
  localStorage.setItem("zentryx_config", JSON.stringify(config));
}

function getNotes() {
  try {
    return JSON.parse(localStorage.getItem("zentryx_notes") || "[]");
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  localStorage.setItem("zentryx_notes", JSON.stringify(notes));
}

function render() {
  if (!state.logged) {
    renderLogin();
    return;
  }

  renderApp();
}

function renderLogin() {
  const config = getConfig();

  app.innerHTML = `
    <div class="login-shell">
      <div class="login-wrap">
        <div class="login-brand">
          <div class="login-logo">Z</div>
          <div class="login-brand-text">
            <h1>${escapeHtml(config.empresa)}</h1>
            <p>Gestión profesional de empresa instaladora</p>
          </div>
        </div>

        <div class="login-card">
          <h2>Acceso</h2>

          <label class="field-label" for="user">Usuario</label>
          <input id="user" class="field-input" placeholder="admin" autocomplete="username" />

          <label class="field-label" for="pass">Contraseña</label>
          <input id="pass" class="field-input" type="password" placeholder="1234" autocomplete="current-password" />

          <button id="loginBtn" class="primary-btn">Entrar</button>

          <p id="loginMsg" class="login-msg"></p>
        </div>
      </div>
    </div>
  `;

  document.getElementById("loginBtn").addEventListener("click", () => {
    const user = document.getElementById("user").value.trim();
    const pass = document.getElementById("pass").value.trim();

    if (user === "admin" && pass === "1234") {
      state.logged = true;
      render();
      return;
    }

    document.getElementById("loginMsg").textContent = "Usuario o contraseña incorrectos.";
  });
}

function renderApp() {
  const config = getConfig();

  app.innerHTML = `
    <div class="app-shell theme-${config.tema}">
      <div class="mobile-topbar">
        <button id="menuToggle" class="icon-btn" aria-label="Abrir menú">☰</button>
        <div class="mobile-topbar-title">${escapeHtml(config.empresa)}</div>
      </div>

      <div id="appOverlay" class="app-overlay ${state.menuOpen ? "show" : ""}"></div>

      <aside id="sidebar" class="sidebar ${state.menuOpen ? "open" : ""}">
        <div class="sidebar-head">
          <div class="sidebar-logo">Z</div>
          <div class="sidebar-brand">
            <h2>${escapeHtml(config.empresa)}</h2>
            <p>Panel general</p>
          </div>
        </div>

        <nav class="sidebar-nav">
          <button class="nav-btn ${state.view === "inicio" ? "active" : ""}" data-view="inicio">Inicio</button>
          <button class="nav-btn ${state.view === "clientes" ? "active" : ""}" data-view="clientes">Clientes</button>
          <button class="nav-btn ${state.view === "obras" ? "active" : ""}" data-view="obras">Obras</button>
          <button class="nav-btn ${state.view === "instalaciones" ? "active" : ""}" data-view="instalaciones">Instalaciones</button>
          <button class="nav-btn ${state.view === "material" ? "active" : ""}" data-view="material">Material</button>
          <button class="nav-btn ${state.view === "vehiculos" ? "active" : ""}" data-view="vehiculos">Vehículos</button>
          <button class="nav-btn ${state.view === "personal" ? "active" : ""}" data-view="personal">Personal</button>
          <button class="nav-btn ${state.view === "tareas" ? "active" : ""}" data-view="tareas">Tareas</button>
          <button class="nav-btn ${state.view === "agenda" ? "active" : ""}" data-view="agenda">Agenda</button>
          <button class="nav-btn ${state.view === "documentacion" ? "active" : ""}" data-view="documentacion">Documentación</button>
          <button class="nav-btn ${state.view === "configuracion" ? "active" : ""}" data-view="configuracion">Configuración</button>
        </nav>

        <button id="logoutBtn" class="logout-btn">Cerrar sesión</button>
      </aside>

      <main class="main-content">
        <header class="desktop-header">
          <div>
            <h1>${getViewTitle()}</h1>
            <p>${getViewSubtitle()}</p>
          </div>
        </header>

        <section id="viewContainer" class="view-container"></section>
      </main>
    </div>
  `;

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.view = btn.dataset.view;
      state.menuOpen = false;
      renderApp();
    });
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    state.logged = false;
    state.menuOpen = false;
    render();
  });

  document.getElementById("menuToggle").addEventListener("click", () => {
    state.menuOpen = !state.menuOpen;
    renderApp();
  });

  document.getElementById("appOverlay").addEventListener("click", () => {
    state.menuOpen = false;
    renderApp();
  });

  renderView();
}

function renderView() {
  const container = document.getElementById("viewContainer");
  if (!container) return;

  if (state.view === "inicio") {
    renderInicio(container);
    return;
  }

  if (state.view === "configuracion") {
    renderConfiguracion(container);
    return;
  }

  container.innerHTML = `
    <div class="panel-card">
      <h3>${getViewTitle()}</h3>
      <p>Base preparada para desarrollar este módulo.</p>
    </div>
  `;
}

function renderInicio(container) {
  container.innerHTML = `
    <section class="home-top">
      <div class="clock-card">
        <div class="clock-time" id="clockTime">--:--</div>
        <div class="clock-date" id="clockDate">--/--/----</div>
      </div>

      <button id="addNoteBtn" class="quick-note-btn">+ Nota rápida</button>
    </section>

    <section class="module-grid">
      <button class="module-card" data-view="clientes">Clientes</button>
      <button class="module-card" data-view="obras">Obras</button>
      <button class="module-card" data-view="instalaciones">Instalaciones</button>
      <button class="module-card" data-view="material">Material</button>
      <button class="module-card" data-view="vehiculos">Vehículos</button>
      <button class="module-card" data-view="personal">Personal</button>
      <button class="module-card" data-view="tareas">Tareas</button>
      <button class="module-card" data-view="agenda">Agenda</button>
      <button class="module-card" data-view="documentacion">Documentación</button>
      <button class="module-card" data-view="configuracion">Configuración</button>
    </section>

    <section class="notes-section">
      <div class="section-head">
        <h3>Notas rápidas</h3>
      </div>
      <div id="notesGrid" class="notes-grid"></div>
    </section>
  `;

  document.querySelectorAll(".module-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.view = card.dataset.view;
      renderApp();
    });
  });

  document.getElementById("addNoteBtn").addEventListener("click", () => {
    const text = prompt("Escribe la nota");
    if (!text || !text.trim()) return;

    const notes = getNotes();
    notes.unshift(text.trim());
    saveNotes(notes);
    renderNotes();
  });

  startClock();
  renderNotes();
}

function renderNotes() {
  const notesGrid = document.getElementById("notesGrid");
  if (!notesGrid) return;

  const notes = getNotes();

  if (!notes.length) {
    notesGrid.innerHTML = `<div class="empty-box">No hay notas rápidas.</div>`;
    return;
  }

  notesGrid.innerHTML = "";

  notes.forEach((note, index) => {
    const item = document.createElement("article");
    item.className = "note-card";
    item.innerHTML = `
      <p>${escapeHtml(note)}</p>
      <button class="note-delete" data-index="${index}">Eliminar</button>
    `;
    notesGrid.appendChild(item);
  });

  document.querySelectorAll(".note-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.index);
      const notes = getNotes();
      notes.splice(index, 1);
      saveNotes(notes);
      renderNotes();
    });
  });
}

function renderConfiguracion(container) {
  const config = getConfig();

  container.innerHTML = `
    <section class="config-grid">
      <div class="panel-card">
        <h3>Datos generales</h3>

        <label class="field-label" for="empresaInput">Nombre de empresa</label>
        <input id="empresaInput" class="field-input" value="${escapeAttr(config.empresa)}" />

        <label class="field-label" for="temaSelect">Tema</label>
        <select id="temaSelect" class="field-input">
          <option value="claro" ${config.tema === "claro" ? "selected" : ""}>Claro</option>
          <option value="oscuro" ${config.tema === "oscuro" ? "selected" : ""}>Oscuro</option>
        </select>

        <label class="check-row">
          <input id="segundosCheck" type="checkbox" ${config.mostrarSegundos ? "checked" : ""} />
          <span>Mostrar segundos en la hora</span>
        </label>

        <label class="check-row">
          <input id="formatoCheck" type="checkbox" ${config.formato24h ? "checked" : ""} />
          <span>Usar formato 24 horas</span>
        </label>

        <div class="config-actions">
          <button id="saveConfigBtn" class="primary-btn">Guardar cambios</button>
          <button id="resetConfigBtn" class="secondary-btn">Restablecer</button>
        </div>
      </div>

      <div class="panel-card">
        <h3>Sistema</h3>
        <p>Esta zona será la base para ajustar usuarios, permisos, avisos, módulos visibles, copias, parámetros técnicos y comportamiento general del programa.</p>
      </div>
    </section>
  `;

  document.getElementById("saveConfigBtn").addEventListener("click", () => {
    const nextConfig = {
      empresa: document.getElementById("empresaInput").value.trim() || "Zentryx",
      tema: document.getElementById("temaSelect").value,
      mostrarSegundos: document.getElementById("segundosCheck").checked,
      formato24h: document.getElementById("formatoCheck").checked,
    };

    saveConfig(nextConfig);
    renderApp();
  });

  document.getElementById("resetConfigBtn").addEventListener("click", () => {
    saveConfig({ ...defaultConfig });
    renderApp();
  });
}

function getViewTitle() {
  const titles = {
    inicio: "Inicio",
    clientes: "Clientes",
    obras: "Obras",
    instalaciones: "Instalaciones",
    material: "Material",
    vehiculos: "Vehículos",
    personal: "Personal",
    tareas: "Tareas",
    agenda: "Agenda",
    documentacion: "Documentación",
    configuracion: "Configuración",
  };

  return titles[state.view] || "Inicio";
}

function getViewSubtitle() {
  const subtitles = {
    inicio: "Resumen general, reloj, fecha y notas rápidas.",
    clientes: "Gestión de fichas y datos de cliente.",
    obras: "Control de obras y seguimiento.",
    instalaciones: "Áreas técnicas y especialidades.",
    material: "Control de material y almacén.",
    vehiculos: "Gestión de flota y mantenimiento.",
    personal: "Empleados, permisos y vacaciones.",
    tareas: "Organización de trabajo pendiente.",
    agenda: "Citas, avisos y planificación.",
    documentacion: "Fotos, vídeos, planos y archivos.",
    configuracion: "Ajustes generales del sistema.",
  };

  return subtitles[state.view] || "";
}

let clockTimer = null;

function startClock() {
  if (clockTimer) {
    clearInterval(clockTimer);
    clockTimer = null;
  }

  const updateClock = () => {
    const config = getConfig();
    const now = new Date();

    const timeOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: config.mostrarSegundos ? "2-digit" : undefined,
      hour12: !config.formato24h,
    };

    const dateOptions = {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    };

    const timeEl = document.getElementById("clockTime");
    const dateEl = document.getElementById("clockDate");

    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString("es-ES", timeOptions);
    }

    if (dateEl) {
      let text = now.toLocaleDateString("es-ES", dateOptions);
      text = text.charAt(0).toUpperCase() + text.slice(1);
      dateEl.textContent = text;
    }
  };

  updateClock();
  clockTimer = setInterval(updateClock, 1000);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(text) {
  return escapeHtml(text);
}

saveConfig(getConfig());
render();