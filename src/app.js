const app = document.getElementById("app");

const state = {
  logged: false,
  view: "inicio",
};

// ---------- LOGIN ----------
function renderLogin() {
  app.innerHTML = `
    <div class="center">
      <div class="card">
        <h1>Zentryx</h1>
        <input id="user" placeholder="admin">
        <input id="pass" type="password" placeholder="1234">
        <button id="login">Entrar</button>
      </div>
    </div>
  `;

  document.getElementById("login").onclick = () => {
    if (
      document.getElementById("user").value === "admin" &&
      document.getElementById("pass").value === "1234"
    ) {
      state.logged = true;
      render();
    }
  };
}

// ---------- APP ----------
function renderApp() {
  app.innerHTML = `
    <div class="layout">
      
      <aside class="sidebar">
        <h2>Zentryx</h2>

        <button onclick="go('inicio')">Inicio</button>
        <button onclick="go('clientes')">Clientes</button>
        <button onclick="go('obras')">Obras</button>
        <button onclick="go('instalaciones')">Instalaciones</button>
        <button onclick="go('material')">Material</button>
        <button onclick="go('vehiculos')">Vehículos</button>
        <button onclick="go('personal')">Personal</button>
        <button onclick="go('tareas')">Tareas</button>
        <button onclick="go('agenda')">Agenda</button>
        <button onclick="go('documentos')">Documentación</button>
        <button onclick="go('config')">Configuración</button>

        <button class="logout" onclick="logout()">Salir</button>
      </aside>

      <main class="main">
        <div id="content"></div>
      </main>

    </div>
  `;

  go(state.view);
}

// ---------- VISTAS ----------
function go(view) {
  state.view = view;

  const c = document.getElementById("content");

  if (view === "inicio") {
    c.innerHTML = `
      <div class="top">
        <h1 id="clock"></h1>
        <p id="date"></p>
      </div>

      <div class="grid">
        ${["Clientes","Obras","Instalaciones","Material","Personal","Tareas"]
          .map(m => `<div class="box">${m}</div>`).join("")}
      </div>

      <h2>Notas rápidas</h2>
      <div id="notes"></div>

      <button onclick="addNote()">+ Añadir nota</button>
    `;

    startClock();
    loadNotes();
  }

  if (view !== "inicio") {
    c.innerHTML = `<h1>${view.toUpperCase()}</h1>`;
  }
}

// ---------- RELOJ ----------
function startClock() {
  function update() {
    const now = new Date();

    document.getElementById("clock").innerText =
      now.toLocaleTimeString();

    document.getElementById("date").innerText =
      now.toLocaleDateString();
  }

  update();
  setInterval(update, 1000);
}

// ---------- NOTAS ----------
function loadNotes() {
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");

  const container = document.getElementById("notes");
  container.innerHTML = "";

  notes.forEach((n, i) => {
    const div = document.createElement("div");
    div.className = "note";
    div.innerText = n;
    div.onclick = () => removeNote(i);
    container.appendChild(div);
  });
}

function addNote() {
  const text = prompt("Nueva nota:");
  if (!text) return;

  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  notes.push(text);
  localStorage.setItem("notes", JSON.stringify(notes));

  loadNotes();
}

function removeNote(i) {
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  notes.splice(i, 1);
  localStorage.setItem("notes", JSON.stringify(notes));
  loadNotes();
}

// ---------- OTROS ----------
function logout() {
  state.logged = false;
  render();
}

// ---------- INIT ----------
function render() {
  if (!state.logged) renderLogin();
  else renderApp();
}

render();