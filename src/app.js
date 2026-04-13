import {
  loginUsuario,
  guardarFichaje,
  leerUltimosFichajes,
  guardarEventoAgenda,
  leerEventosAgenda
} from "./data.js";

const app = document.getElementById("app");

/* =========================
   SESIÓN
========================= */

function getSesion() {
  try {
    return JSON.parse(localStorage.getItem("usuario"));
  } catch {
    return null;
  }
}

function setSesion(user) {
  localStorage.setItem("usuario", JSON.stringify(user));
}

function clearSesion() {
  localStorage.removeItem("usuario");
}

/* =========================
   UTILIDADES
========================= */

function escapeHtml(texto) {
  return String(texto || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   LOGIN
========================= */

function renderLogin() {
  app.innerHTML = `
    <div class="card">
      <h1>Login</h1>

      <input id="nombre" placeholder="Nombre" />
      <button id="btnLogin">Entrar</button>
    </div>
  `;

  document.getElementById("btnLogin").onclick = async () => {
    const nombre = document.getElementById("nombre").value;

    if (!nombre) return;

    const user = await loginUsuario(nombre);
    setSesion(user);
    renderHome();
  };
}

/* =========================
   HOME
========================= */

function renderHome() {
  const user = getSesion();

  app.innerHTML = `
    <div class="card">
      <h1>Inicio</h1>

      <p><b>${escapeHtml(user.nombre)}</b></p>

      <button id="btnFichajes">Fichajes</button>
      <button id="btnAgenda">Agenda</button>
      <button id="btnSalir">Salir</button>
    </div>
  `;

  document.getElementById("btnFichajes").onclick = renderFichajes;
  document.getElementById("btnAgenda").onclick = renderAgenda;
  document.getElementById("btnSalir").onclick = () => {
    clearSesion();
    renderLogin();
  };
}

/* =========================
   FICHAJES
========================= */

function renderFichajes() {
  const user = getSesion();

  app.innerHTML = `
    <div class="card">
      <h1>Fichajes</h1>

      <p>Usuario: ${escapeHtml(user.nombre)}</p>

      <button id="entrada">Entrada</button>
      <button id="salida">Salida</button>
      <button id="ver">Ver últimos</button>
      <button id="volver">Volver</button>

      <div id="resultado"></div>
    </div>
  `;

  document.getElementById("entrada").onclick = () => fichar("entrada");
  document.getElementById("salida").onclick = () => fichar("salida");
  document.getElementById("ver").onclick = verFichajes;
  document.getElementById("volver").onclick = renderHome;
}

async function fichar(tipo) {
  const user = getSesion();

  try {
    await guardarFichaje({
      usuario_id: user.id,
      trabajador: user.nombre,
      tipo
    });

    document.getElementById("resultado").innerText =
      tipo + " guardado correctamente";
  } catch (e) {
    document.getElementById("resultado").innerText =
      "Error guardando fichaje";
  }
}

async function verFichajes() {
  const user = getSesion();
  const lista = await leerUltimosFichajes(user.id);

  document.getElementById("resultado").innerHTML = lista
    .map(
      (f) => `
      <div>
        ${f.tipo} - ${new Date(f.created_at).toLocaleString()}
      </div>
    `
    )
    .join("");
}

/* =========================
   AGENDA
========================= */

function renderAgenda() {
  const user = getSesion();

  app.innerHTML = `
    <div class="card">
      <h1>Agenda</h1>

      <input type="date" id="fecha" />
      <input type="time" id="hora" />
      <textarea id="nota" placeholder="Nota"></textarea>

      <button id="guardar">Guardar evento</button>
      <button id="verEventos">Ver eventos</button>
      <button id="volver">Volver</button>

      <div id="resultado"></div>
    </div>
  `;

  document.getElementById("guardar").onclick = guardarEvento;
  document.getElementById("verEventos").onclick = verEventos;
  document.getElementById("volver").onclick = renderHome;
}

async function guardarEvento() {
  const user = getSesion();

  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;
  const nota = document.getElementById("nota").value;

  try {
    await guardarEventoAgenda({
      usuario_id: user.id,
      fecha,
      hora,
      nota
    });

    document.getElementById("resultado").innerText =
      "Evento guardado correctamente";
  } catch (e) {
    document.getElementById("resultado").innerText =
      "Error guardando evento";
  }
}

async function verEventos() {
  const user = getSesion();
  const lista = await leerEventosAgenda(user.id);

  document.getElementById("resultado").innerHTML = lista
    .map(
      (e) => `
      <div>
        ${e.fecha} ${e.hora} - ${escapeHtml(e.nota)}
      </div>
    `
    )
    .join("");
}

/* =========================
   ARRANQUE
========================= */

function boot() {
  const user = getSesion();

  if (user) {
    renderHome();
  } else {
    renderLogin();
  }
}

boot();