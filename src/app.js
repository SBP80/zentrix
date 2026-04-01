const app = document.getElementById("app");

const state = {
  logged: false,
  view: "inicio",
  menuOpen: false,
  weekOffset: 0,
};

const defaultConfig = {
  empresa: "Zentryx",
  tema: "claro",
  mostrarSegundos: true,
  formato24h: true,
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function getConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem("zentryx_config") || "{}");
    return { ...defaultConfig, ...saved };
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

function getEvents() {
  try {
    return JSON.parse(localStorage.getItem("zentryx_events") || "[]");
  } catch {
    return [];
  }
}

function saveEvents(events) {
  localStorage.setItem("zentryx_events", JSON.stringify(events));
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
    <div class="login-shell theme-${config.tema}">
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

      <aside class="sidebar ${state.menuOpen ? "open" : ""}">
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

  if (state.view === "agenda") {
    renderAgenda(container);
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
  const notes = getNotes();
  const events = getEvents();
  const reminderCount = notes.filter((n) => n.remindAt).length;
  const todayCount = countTodayEvents(events);

  container.innerHTML = `
    <section class="home-top">
      <div class="clock-card">
        <div class="clock-time" id="clockTime">--:--</div>
        <div class="clock-date" id="clockDate">--/--/----</div>
      </div>

      <div class="quick-stack">
        <button id="addNoteBtn" class="quick-note-btn">+ Nota rápida</button>
        <button id="goAgendaBtn" class="secondary-btn big-btn">Abrir agenda</button>
      </div>
    </section>

    <section class="stats-grid">
      <article class="stat-card">
        <span class="stat-label">Notas con recuerdo</span>
        <strong class="stat-value">${reminderCount}</strong>
      </article>
      <article class="stat-card">
        <span class="stat-label">Eventos de hoy</span>
        <strong class="stat-value">${todayCount}</strong>
      </article>
      <article class="stat-card">
        <span class="stat-label">Empresa</span>
        <strong class="stat-value stat-text">${escapeHtml(getConfig().empresa)}</strong>
      </article>
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
    openNoteModal();
  });

  document.getElementById("goAgendaBtn").addEventListener("click", () => {
    state.view = "agenda";
    renderApp();
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

  notesGrid.innerHTML = notes
    .map((note, index) => {
      const overdue = note.remindAt && new Date(note.remindAt).getTime() < Date.now();
      const remindText = note.remindAt ? formatDateTime(note.remindAt) : "Sin recuerdo";
      return `
        <article class="note-card ${overdue ? "note-overdue" : ""}">
          <div class="note-head">
            <strong>${escapeHtml(note.title || "Nota")}</strong>
            ${note.remindAt ? `<span class="note-badge">${overdue ? "Vencida" : "Aviso"}</span>` : ""}
          </div>
          <p>${escapeHtml(note.text || "")}</p>
          <div class="note-meta">${escapeHtml(remindText)}</div>
          <div class="note-actions">
            <button class="note-action" data-edit="${index}">Editar</button>
            <button class="note-action danger" data-delete="${index}">Eliminar</button>
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const notes = getNotes();
      const index = Number(btn.dataset.delete);
      notes.splice(index, 1);
      saveNotes(notes);
      renderNotes();
    });
  });

  document.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const notes = getNotes();
      openNoteModal(notes[Number(btn.dataset.edit)], Number(btn.dataset.edit));
    });
  });
}

function openNoteModal(existing = null, index = null) {
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-head">
        <h3>${existing ? "Editar nota" : "Nueva nota"}</h3>
        <button class="modal-close" type="button">✕</button>
      </div>

      <label class="field-label" for="noteTitle">Título</label>
      <input id="noteTitle" class="field-input" value="${escapeAttr(existing?.title || "")}" placeholder="Ej: Llamar a cliente" />

      <label class="field-label" for="noteText">Texto</label>
      <textarea id="noteText" class="field-textarea" placeholder="Escribe aquí">${escapeHtml(existing?.text || "")}</textarea>

      <label class="field-label" for="noteRemind">Fecha y hora de recuerdo</label>
      <input id="noteRemind" class="field-input" type="datetime-local" value="${escapeAttr(existing?.remindAt || "")}" />

      <div class="modal-actions">
        <button class="secondary-btn modal-cancel" type="button">Cancelar</button>
        <button class="primary-btn modal-save" type="button">Guardar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();

  modal.querySelector(".modal-close").addEventListener("click", close);
  modal.querySelector(".modal-cancel").addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });

  modal.querySelector(".modal-save").addEventListener("click", () => {
    const notes = getNotes();
    const next = {
      id: existing?.id || uid(),
      title: document.getElementById("noteTitle").value.trim() || "Nota",
      text: document.getElementById("noteText").value.trim(),
      remindAt: document.getElementById("noteRemind").value || "",
    };

    if (index === null) {
      notes.unshift(next);
    } else {
      notes[index] = next;
    }

    saveNotes(notes);
    close();
    renderNotes();
  });
}

function renderAgenda(container) {
  const weekDays = getWeekDays(state.weekOffset);
  const events = getEvents();

  container.innerHTML = `
    <section class="agenda-tools">
      <div class="agenda-nav">
        <button id="prevWeekBtn" class="secondary-btn small-btn">← Semana anterior</button>
        <button id="todayWeekBtn" class="secondary-btn small-btn">Esta semana</button>
        <button id="nextWeekBtn" class="secondary-btn small-btn">Semana siguiente →</button>
      </div>
      <button id="addEventBtn" class="primary-btn agenda-add-btn">+ Nuevo evento</button>
    </section>

    <section class="agenda-board">
      ${weekDays
        .map((day) => {
          const dayEvents = eventsForDate(events, day.key);
          return `
            <article class="day-column">
              <header class="day-head">
                <strong>${escapeHtml(day.label)}</strong>
                <span>${escapeHtml(day.key)}</span>
              </header>
              <div class="day-body">
                ${
                  dayEvents.length
                    ? dayEvents
                        .map(
                          (event) => `
                    <div class="agenda-item cat-${escapeHtml(event.category)}">
                      <div class="agenda-item-top">
                        <strong>${escapeHtml(event.title)}</strong>
                        <span>${escapeHtml(event.time || "--:--")}</span>
                      </div>
                      <p>${escapeHtml(event.categoryLabel || categoryLabel(event.category))}</p>
                      <div class="agenda-item-actions">
                        <button class="mini-btn" data-edit-event="${escapeHtml(event.id)}">Editar</button>
                        <button class="mini-btn danger" data-delete-event="${escapeHtml(event.id)}">Eliminar</button>
                      </div>
                    </div>
                  `
                        )
                        .join("")
                    : `<div class="agenda-empty">Sin eventos</div>`
                }
              </div>
            </article>
          `;
        })
        .join("")}
    </section>

    <section class="panel-card">
      <h3>Vista general</h3>
      <p>En esta agenda debes meter trabajos, vacaciones, revisiones, herramienta, vehículos, citas y cualquier evento importante de la empresa.</p>
    </section>
  `;

  document.getElementById("prevWeekBtn").addEventListener("click", () => {
    state.weekOffset -= 1;
    renderApp();
  });

  document.getElementById("todayWeekBtn").addEventListener("click", () => {
    state.weekOffset = 0;
    renderApp();
  });

  document.getElementById("nextWeekBtn").addEventListener("click", () => {
    state.weekOffset += 1;
    renderApp();
  });

  document.getElementById("addEventBtn").addEventListener("click", () => {
    openEventModal();
  });

  document.querySelectorAll("[data-delete-event]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.deleteEvent;
      const next = getEvents().filter((event) => event.id !== id);
      saveEvents(next);
      renderApp();
    });
  });

  document.querySelectorAll("[data-edit-event]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.editEvent;
      const event = getEvents().find((item) => item.id === id);
      openEventModal(event);
    });
  });
}

function openEventModal(existing = null) {
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-head">
        <h3>${existing ? "Editar evento" : "Nuevo evento"}</h3>
        <button class="modal-close" type="button">✕</button>
      </div>

      <label class="field-label" for="eventTitle">Título</label>
      <input id="eventTitle" class="field-input" value="${escapeAttr(existing?.title || "")}" placeholder="Ej: Mantenimiento furgoneta" />

      <label class="field-label" for="eventCategory">Tipo</label>
      <select id="eventCategory" class="field-input">
        ${[
          "trabajo",
          "vacaciones",
          "herramienta",
          "vehiculo",
          "revision",
          "cita",
          "tarea",
          "otro",
        ]
          .map(
            (cat) =>
              `<option value="${cat}" ${existing?.category === cat ? "selected" : ""}>${categoryLabel(cat)}</option>`
          )
          .join("")}
      </select>

      <label class="field-label" for="eventDate">Fecha</label>
      <input id="eventDate" class="field-input" type="date" value="${escapeAttr(existing?.date || todayDate())}" />

      <label class="field-label" for="eventTime">Hora</label>
      <input id="eventTime" class="field-input" type="time" value="${escapeAttr(existing?.time || "")}" />

      <div class="modal-actions">
        <button class="secondary-btn modal-cancel" type="button">Cancelar</button>
        <button class="primary-btn modal-save" type="button">Guardar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();

  modal.querySelector(".modal-close").addEventListener("click", close);
  modal.querySelector(".modal-cancel").addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });

  modal.querySelector(".modal-save").addEventListener("click", () => {
    const events = getEvents();
    const next = {
      id: existing?.id || uid(),
      title: document.getElementById("eventTitle").value.trim() || "Evento",
      category: document.getElementById("eventCategory").value,
      categoryLabel: categoryLabel(document.getElementById("eventCategory").value),
      date: document.getElementById("eventDate").value || todayDate(),
      time: document.getElementById("eventTime").value || "",
    };

    const index = events.findIndex((item) => item.id === next.id);
    if (index === -1) {
      events.push(next);
    } else {
      events[index] = next;
    }

    saveEvents(sortEvents(events));
    close();
    renderApp();
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
        <h3>Base preparada</h3>
        <p>Desde aquí seguiremos con usuarios, permisos, vacaciones, avisos, parámetros de módulos y demás zonas del programa.</p>
      </div>
    </section>
  `;

  document.getElementById("saveConfigBtn").addEventListener("click", () => {
    saveConfig({
      empresa: document.getElementById("empresaInput").value.trim() || "Zentryx",
      tema: document.getElementById("temaSelect").value,
      mostrarSegundos: document.getElementById("segundosCheck").checked,
      formato24h: document.getElementById("formatoCheck").checked,
    });
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
    inicio: "Hora, fecha, notas rápidas y accesos.",
    clientes: "Gestión de fichas y datos de cliente.",
    obras: "Control de obras y seguimiento.",
    instalaciones: "Zonas técnicas y especialidades.",
    material: "Control de material y almacén.",
    vehiculos: "Gestión de flota y mantenimiento.",
    personal: "Empleados, permisos y vacaciones.",
    tareas: "Trabajo pendiente de la empresa.",
    agenda: "Cuadrante general de eventos.",
    documentacion: "Fotos, vídeos, planos y archivos.",
    configuracion: "Ajustes generales del sistema.",
  };
  return subtitles[state.view] || "";
}

let clockTimer = null;

function startClock() {
  if (clockTimer) {
    clearInterval(clockTimer);
  }

  const update = () => {
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

  update();
  clockTimer = setInterval(update, 1000);
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function todayDate() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function getWeekDays(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  const mondayDistance = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + mondayDistance + offset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);

    return {
      date: current,
      key: `${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}`,
      label: current.toLocaleDateString("es-ES", { weekday: "short", day: "2-digit", month: "2-digit" }),
    };
  });
}

function eventsForDate(events, dateKey) {
  return sortEvents(events.filter((event) => event.date === dateKey));
}

function sortEvents(events) {
  return [...events].sort((a, b) => {
    const dateA = `${a.date} ${a.time || "99:99"}`;
    const dateB = `${b.date} ${b.time || "99:99"}`;
    return dateA.localeCompare(dateB);
  });
}

function categoryLabel(category) {
  const labels = {
    trabajo: "Trabajo",
    vacaciones: "Vacaciones",
    herramienta: "Herramienta",
    vehiculo: "Vehículo",
    revision: "Revisión",
    cita: "Cita",
    tarea: "Tarea",
    otro: "Otro",
  };
  return labels[category] || "Otro";
}

function countTodayEvents(events) {
  const today = todayDate();
  return events.filter((event) => event.date === today).length;
}

function escapeAttr(text) {
  return escapeHtml(text);
}

saveConfig(getConfig());
render();