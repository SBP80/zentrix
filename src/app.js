import {
  loginUsuario,
  guardarFichaje,
  leerUltimosFichajes
} from "./data.js";

const app = document.getElementById("app");

// ===== SESIÓN =====
function getUser() {
  return JSON.parse(localStorage.getItem("user") || "null");
}

function setUser(u) {
  localStorage.setItem("user", JSON.stringify(u));
}

function logout() {
  localStorage.removeItem("user");
  renderLogin();
}

// ===== LOGIN =====
function renderLogin() {
  app.innerHTML = `
    <h1>Login</h1>
    <input id="user" placeholder="Usuario">
    <button onclick="login()">Entrar</button>
  `;
}

window.login = async () => {
  const nombre = document.getElementById("user").value;

  if (!nombre) return;

  const user = await loginUsuario(nombre);
  setUser(user);
  renderHome();
};

// ===== HOME =====
function renderHome() {
  const user = getUser();

  app.innerHTML = `
    <h1>Inicio</h1>
    <p>${user.nombre}</p>

    <button onclick="fichajes()">Fichajes</button>
    <button onclick="logout()">Salir</button>
  `;
}

// ===== UBICACIÓN =====
function getLocation() {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => resolve(null)
    );
  });
}

async function getAddress(lat, lng) {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`
    );

    const data = await res.json();

    return `${data.city || data.locality || ""}, ${data.principalSubdivision || ""}`;
  } catch {
    return `Lat ${lat}, Lng ${lng}`;
  }
}

// ===== FICHAJES =====
window.fichajes = () => {
  app.innerHTML = `
    <h2>Fichajes</h2>

    <button onclick="fichar('entrada')">Entrada</button>
    <button onclick="fichar('salida')">Salida</button>

    <div id="estado"></div>

    <button onclick="ver()">Ver historial</button>
    <button onclick="renderHome()">Volver</button>
  `;
};

window.fichar = async (tipo) => {
  const user = getUser();
  const estado = document.getElementById("estado");

  estado.innerHTML = "Obteniendo ubicación...";

  const loc = await getLocation();

  let direccion = "Sin ubicación";

  if (loc) {
    direccion = await getAddress(loc.lat, loc.lng);
  }

  await guardarFichaje({
    usuario_id: user.id,
    tipo,
    lat: loc?.lat,
    lng: loc?.lng,
    direccion
  });

  estado.innerHTML = `${tipo} guardada<br>${direccion}`;
};

// ===== HISTORIAL =====
window.ver = async () => {
  const user = getUser();
  const data = await leerUltimosFichajes(user.id);

  let html = "<h2>Historial</h2>";

  data.forEach(f => {
    html += `
      <div>
        ${f.tipo} - ${new Date(f.created_at).toLocaleString()}<br>
        ${f.direccion || ""}
      </div><br>
    `;
  });

  html += `<button onclick="fichajes()">Volver</button>`;

  app.innerHTML = html;
};

// ===== INIT =====
function init() {
  const user = getUser();
  user ? renderHome() : renderLogin();
}

init();