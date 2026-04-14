import {
  loginUsuario,
  guardarFichaje,
  leerUltimosFichajes,
  leerHorarioUsuario
} from "./data.js";

const app = document.getElementById("app");

/* =========================
   SESIÓN
========================= */

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function logout() {
  localStorage.removeItem("user");
  renderLogin();
}

/* =========================
   UTILIDADES
========================= */

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString("es-ES");
}

function formatHora(fecha) {
  return new Date(fecha).toLocaleTimeString("es-ES");
}

function colorTipoFichaje(tipo) {
  if (tipo === "entrada") return "#16a34a";
  if (tipo === "salida") return "#dc2626";
  if (tipo === "inicio_descanso") return "#f59e0b";
  if (tipo === "fin_descanso") return "#d97706";
  if (tipo === "inicio_comida") return "#0891b2";
  if (tipo === "fin_comida") return "#0e7490";
  return "#475569";
}

function getTextoTipo(tipo) {
  const map = {
    entrada: "Entrada",
    salida: "Salida",
    inicio_descanso: "Inicio descanso",
    fin_descanso: "Fin descanso",
    inicio_comida: "Inicio comida",
    fin_comida: "Fin comida"
  };
  return map[tipo] || tipo;
}

/* =========================
   UBICACIÓN
========================= */

function getLocation() {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      }),
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

    const partes = [
      data.locality,
      data.city,
      data.principalSubdivision,
      data.countryName
    ].filter(Boolean);

    return partes.join(", ") || `Lat ${lat}, Lng ${lng}`;
  } catch {
    return `Lat ${lat}, Lng ${lng}`;
  }
}

/* =========================
   LOGIN
========================= */

function renderLogin() {
  app.innerHTML = `
    <h2>Login</h2>
    <input id="user" placeholder="Usuario"><br><br>
    <input id="pass" type="password" placeholder="Contraseña"><br><br>
    <button id="btn_login">Entrar</button>
    <div id="msg"></div>
  `;

  document.getElementById("btn_login").onclick = async () => {
    const u = document.getElementById("user").value;
    const p = document.getElementById("pass").value;

    try {
      const user = await loginUsuario(u, p);
      setUser(user);
      renderHome();
    } catch (e) {
      document.getElementById("msg").innerText = "Error login";
    }
  };
}

/* =========================
   HOME
========================= */

function renderHome() {
  const user = getUser();
  if (!user) return renderLogin();

  app.innerHTML = `
    <h2>Inicio</h2>
    <p>${user.nombre}</p>
    <button onclick="renderFichajes()">Fichajes</button>
    <button onclick="logout()">Salir</button>
  `;
}

window.logout = logout;
window.renderFichajes = renderFichajes;

/* =========================
   FICHAJES
========================= */

async function renderFichajes() {
  const user = getUser();
  if (!user) return renderLogin();

  const horario = await leerHorarioUsuario(user.id);

  app.innerHTML = `
    <h2>Fichajes</h2>

    ${horario ? `
      <div>
        <b>Horario:</b><br>
        ${horario.hora_entrada} - ${horario.hora_salida}<br>
        Descanso: ${horario.min_descanso} min<br>
        Comida: ${horario.min_comida} min
      </div><br>
    ` : ""}

    <button onclick="fichar('entrada')">Entrada</button>
    <button onclick="fichar('salida')">Salida</button>
    <button onclick="fichar('inicio_descanso')">Inicio descanso</button>
    <button onclick="fichar('fin_descanso')">Fin descanso</button>
    <button onclick="fichar('inicio_comida')">Inicio comida</button>
    <button onclick="fichar('fin_comida')">Fin comida</button>

    <br><br>
    <button onclick="verHistorial()">Ver historial</button>
    <button onclick="renderHome()">Volver</button>

    <div id="estado"></div>
    <div id="lista"></div>
  `;
}

window.fichar = fichar;
window.verHistorial = verHistorial;

async function fichar(tipo) {
  const user = getUser();
  const estado = document.getElementById("estado");

  estado.innerText = "Guardando...";

  const loc = await getLocation();

  let direccion = "Sin ubicación";
  if (loc) {
    direccion = await getAddress(loc.lat, loc.lng);
  }

  await guardarFichaje({
    usuario_id: user.id,
    trabajador: user.nombre,
    tipo,
    lat: loc?.lat,
    lng: loc?.lng,
    direccion
  });

  estado.innerText = `${getTextoTipo(tipo)} guardado\n${direccion}`;
}

/* =========================
   HISTORIAL
========================= */

async function verHistorial() {
  const user = getUser();
  const lista = document.getElementById("lista");

  const data = await leerUltimosFichajes(user.id);

  lista.innerHTML = data.map(f => `
    <div style="margin:10px 0;">
      <b style="color:${colorTipoFichaje(f.tipo)}">
        ${getTextoTipo(f.tipo)}
      </b><br>
      ${formatFecha(f.created_at)} ${formatHora(f.created_at)}<br>
      ${f.direccion || ""}
    </div>
  `).join("");
}

/* =========================
   INIT
========================= */

function init() {
  const user = getUser();
  user ? renderHome() : renderLogin();
}

init();