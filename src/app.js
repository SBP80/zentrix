import {
  guardarFichaje,
  leerUltimosFichajes,
  guardarEventoAgenda,
  leerEventosAgenda
} from "./data.js";

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

function cerrarSesion() {
  localStorage.removeItem("usuario");
  location.reload();
}

function escapeHtml(texto) {
  return String(texto || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   APP PRINCIPAL
========================= */

const app = document.getElementById("app");
const usuario = getSesion();

if (!usuario) {
  app.innerHTML = "<p>No hay sesión activa</p>";
  throw new Error("Sin sesión");
}

renderInicio();

/* =========================
   PANTALLA INICIO
========================= */

function renderInicio() {
  app.innerHTML = `
    <h1>Inicio</h1>
    <p><strong>${escapeHtml(usuario.usuario || usuario.trabajador)}</strong></p>

    <div style="margin-top:20px;">
      <button onclick="irFichajes()">Fichajes</button>
      <button onclick="irAgenda()">Agenda</button>
      <button onclick="cerrarSesion()">Salir</button>
    </div>
  `;
}

/* =========================
   FICHAJES
========================= */

window.irFichajes = function () {
  app.innerHTML = `
    <h2>Fichajes</h2>

    <button onclick="fichar('entrada')" style="background:green;color:white;">Entrada</button>
    <button onclick="fichar('salida')" style="background:red;color:white;">Salida</button>

    <br><br>

    <button onclick="cargarHistorial()">Ver historial</button>
    <button onclick="renderInicio()">Volver</button>

    <div id="estado"></div>
    <div id="historial"></div>
  `;
};

window.fichar = async function (tipo) {
  const estado = document.getElementById("estado");

  try {
    await guardarFichaje({
      usuario_id: usuario.id,
      trabajador: usuario.usuario || usuario.trabajador,
      tipo
    });

    estado.innerHTML = `<p>✔ ${tipo} guardada</p>`;
  } catch (e) {
    estado.innerHTML = `<p style="color:red;">${e.message}</p>`;
  }
};

window.cargarHistorial = async function () {
  const cont = document.getElementById("historial");

  try {
    const datos = await leerUltimosFichajes(usuario.id);

    if (!datos.length) {
      cont.innerHTML = "<p>No hay fichajes</p>";
      return;
    }

    cont.innerHTML = datos
      .map(
        (f) => `
        <div style="border:1px solid #ccc;margin:5px;padding:5px;">
          <b>${escapeHtml(f.tipo)}</b><br>
          ${new Date(f.created_at).toLocaleString()}
        </div>
      `
      )
      .join("");
  } catch (e) {
    cont.innerHTML = `<p style="color:red;">${e.message}</p>`;
  }
};

/* =========================
   AGENDA
========================= */

window.irAgenda = function () {
  const hoy = new Date().toISOString().slice(0, 10);

  app.innerHTML = `
    <h2>Agenda</h2>

    <input id="titulo" placeholder="Título"><br><br>
    <input type="date" id="fecha" value="${hoy}"><br><br>
    <input type="time" id="hora"><br><br>
    <textarea id="nota" placeholder="Nota"></textarea><br><br>

    <button onclick="guardarEvento()">Guardar evento</button>
    <button onclick="verEventos()">Ver eventos</button>
    <button onclick="renderInicio()">Volver</button>

    <div id="estado"></div>
    <div id="lista"></div>
  `;
};

window.guardarEvento = async function () {
  const estado = document.getElementById("estado");

  try {
    await guardarEventoAgenda({
      usuario_id: usuario.id,
      usuario_nombre: usuario.usuario || usuario.trabajador,
      titulo: document.getElementById("titulo").value,
      fecha: document.getElementById("fecha").value,
      hora: document.getElementById("hora").value,
      nota: document.getElementById("nota").value
    });

    estado.innerHTML = "<p>✔ Evento guardado</p>";
  } catch (e) {
    estado.innerHTML = `<p style="color:red;">${e.message}</p>`;
  }
};

window.verEventos = async function () {
  const lista = document.getElementById("lista");

  try {
    const datos = await leerEventosAgenda(usuario.id);

    if (!datos.length) {
      lista.innerHTML = "<p>No hay eventos</p>";
      return;
    }

    lista.innerHTML = datos
      .map(
        (e) => `
        <div style="border:1px solid #ccc;margin:5px;padding:5px;">
          <b>${escapeHtml(e.titulo)}</b><br>
          ${e.fecha} ${e.hora}<br>
          ${escapeHtml(e.nota || "")}
        </div>
      `
      )
      .join("");
  } catch (e) {
    lista.innerHTML = `<p style="color:red;">${e.message}</p>`;
  }
};

/* =========================
   EXPONER FUNCIONES
========================= */

window.renderInicio = renderInicio;
window.cerrarSesion = cerrarSesion;