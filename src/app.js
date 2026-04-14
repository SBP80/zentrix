import {
  loginUsuario,
  guardarFichaje,
  leerUltimosFichajes
} from "./data.js";

const app = document.getElementById("app");

// =========================
// SESIÓN
// =========================
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

// =========================
// UBICACIÓN GPS
// =========================
function obtenerUbicacion() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });
}

// =========================
// DIRECCIÓN REAL
// =========================
async function obtenerDireccion(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data && data.display_name) {
      return data.display_name;
    }

    return `Lat ${lat}, Lng ${lng}`;
  } catch {
    return `Lat ${lat}, Lng ${lng}`;
  }
}

// =========================
// LOGIN
// =========================
function renderLogin() {
  app.innerHTML = `
    <h1>Inicio</h1>

    <input id="user" placeholder="Usuario" />
    <button onclick="login()">Entrar</button>
  `;
}

window.login = () => {
  const nombre = document.getElementById("user").value;

  if (!nombre) return;

  const user = loginUsuario(nombre);
  setSesion(user);
  renderInicio();
};

// =========================
// INICIO
// =========================
function renderInicio() {
  const user = getSesion();

  app.innerHTML = `
    <h1>Inicio</h1>
    <p>${user.nombre}</p>

    <button onclick="irFichajes()">Fichajes</button>
    <button onclick="salir()">Salir</button>
  `;
}

window.salir = () => {
  clearSesion();
  renderLogin();
};

// =========================
// FICHAJES
// =========================
window.irFichajes = () => {
  const user = getSesion();

  app.innerHTML = `
    <h2>Fichajes</h2>

    <button onclick="fichar('entrada')">Entrada</button>
    <button onclick="fichar('salida')">Salida</button>

    <div id="estado"></div>

    <button onclick="verHistorial()">Ver historial</button>
    <button onclick="renderInicio()">Volver</button>
  `;
};

window.fichar = async (tipo) => {
  const user = getSesion();
  const estado = document.getElementById("estado");

  estado.innerHTML = "Obteniendo ubicación...";

  const ubicacion = await obtenerUbicacion();

  let direccion = "Sin ubicación";

  if (ubicacion) {
    direccion = await obtenerDireccion(ubicacion.lat, ubicacion.lng);
  }

  const registro = {
    usuario_id: user.id,
    tipo,
    fecha: new Date().toISOString(),
    lat: ubicacion?.lat || null,
    lng: ubicacion?.lng || null,
    direccion
  };

  await guardarFichaje(registro);

  estado.innerHTML = `
    ${tipo} guardada<br>
    ${direccion}
  `;
};

// =========================
// HISTORIAL
// =========================
window.verHistorial = async () => {
  const user = getSesion();
  const datos = await leerUltimosFichajes(user.id);

  let html = `<h2>Historial</h2>`;

  datos.forEach((f) => {
    html += `
      <div style="border:1px solid #ccc;margin:10px;padding:10px;">
        <b>${f.tipo}</b><br>
        ${new Date(f.fecha).toLocaleString()}<br>
        ${f.direccion || "Sin dirección"}
      </div>
    `;
  });

  html += `<button onclick="irFichajes()">Volver</button>`;

  app.innerHTML = html;
};

// =========================
// ARRANQUE
// =========================
function init() {
  const user = getSesion();

  if (user) {
    renderInicio();
  } else {
    renderLogin();
  }
}

init();