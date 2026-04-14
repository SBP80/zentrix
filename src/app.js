import {
  loginUsuario,
  guardarFichaje,
  leerUltimosFichajes,
  leerHorarioUsuario
} from "./data.js";

const app = document.getElementById("app");

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

function getLocation() {
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
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

async function getAddress(lat, lng) {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&localityLanguage=es`
    );

    const data = await res.json();

    const partes = [
      data.locality,
      data.city,
      data.principalSubdivision,
      data.countryName
    ]
      .map(v => String(v || "").trim())
      .filter(v => v !== "");

    if (partes.length > 0) {
      return [...new Set(partes)].join(", ");
    }

    return `Lat ${lat}, Lng ${lng}`;
  } catch {
    return `Lat ${lat}, Lng ${lng}`;
  }
}

function renderLogin() {
  app.innerHTML = `
    <div style="max-width:420px;margin:40px auto;padding:24px;border:1px solid #ddd;border-radius:16px;font-family:Arial,sans-serif;">
      <h2 style="margin-top:0;">Zentryx</h2>
      <input id="user" placeholder="Usuario" style="width:100%;height:44px;margin-bottom:10px;padding:0 12px;box-sizing:border-box;">
      <input id="pass" type="password" placeholder="Contraseña" style="width:100%;height:44px;margin-bottom:10px;padding:0 12px;box-sizing:border-box;">
      <button id="btn_login" style="width:100%;height:48px;">Entrar</button>
      <div id="msg" style="margin-top:12px;"></div>
    </div>
  `;

  document.getElementById("btn_login").onclick = async () => {
    const usuario = document.getElementById("user").value.trim();
    const password = document.getElementById("pass").value.trim();
    const msg = document.getElementById("msg");

    if (!usuario || !password) {
      msg.innerText = "Escribe usuario y contraseña";
      return;
    }

    msg.innerText = "Comprobando...";

    try {
      const user = await loginUsuario(usuario, password);
      setUser(user);
      renderHome();
    } catch (e) {
      msg.innerText = e.message || "Error de conexión";
    }
  };
}

function renderHome() {
  const user = getUser();
  if (!user) {
    renderLogin();
    return;
  }

  app.innerHTML = `
    <div style="max-width:700px;margin:40px auto;padding:24px;border:1px solid #ddd;border-radius:16px;font-family:Arial,sans-serif;">
      <h2 style="margin-top:0;">Inicio</h2>
      <div style="margin-bottom:16px;line-height:1.7;">
        Usuario: ${user.nombre || user.usuario || ""}<br>
        Rol: ${user.rol || ""}<br>
        ID usuario: ${user.id}
      </div>
      <button id="btn_fichajes" style="width:100%;height:48px;margin-bottom:10px;">Fichajes</button>
      <button id="btn_logout" style="width:100%;height:48px;">Cerrar sesión</button>
    </div>
  `;

  document.getElementById("btn_fichajes").onclick = renderFichajes;
  document.getElementById("btn_logout").onclick = logout;
}

function getEstadoJornada(ultimo) {
  if (!ultimo) return "fuera";
  return ultimo.tipo || "fuera";
}

function validarNuevoFichaje(nuevoTipo, ultimo) {
  const estado = getEstadoJornada(ultimo);

  if (nuevoTipo === "entrada") {
    if (estado === "entrada" || estado === "inicio_descanso" || estado === "inicio_comida") {
      return "No se puede registrar otra entrada mientras la jornada sigue abierta.";
    }
    return null;
  }

  if (nuevoTipo === "salida") {
    if (estado === "fuera") return "No se puede registrar salida sin entrada previa.";
    if (estado === "inicio_descanso") return "No se puede salir con un descanso abierto.";
    if (estado === "inicio_comida") return "No se puede salir con una comida abierta.";
    if (estado === "salida") return "No se puede registrar otra salida seguida.";
    return null;
  }

  if (nuevoTipo === "inicio_descanso") {
    if (estado !== "entrada" && estado !== "fin_comida") {
      return "Solo puedes iniciar descanso estando dentro de la jornada.";
    }
    return null;
  }

  if (nuevoTipo === "fin_descanso") {
    if (estado !== "inicio_descanso") {
      return "No hay ningún descanso abierto para cerrar.";
    }
    return null;
  }

  if (nuevoTipo === "inicio_comida") {
    if (estado !== "entrada" && estado !== "fin_descanso") {
      return "Solo puedes iniciar comida estando dentro de la jornada.";
    }
    return null;
  }

  if (nuevoTipo === "fin_comida") {
    if (estado !== "inicio_comida") {
      return "No hay ninguna comida abierta para cerrar.";
    }
    return null;
  }

  return null;
}

async function renderFichajes() {
  const user = getUser();
  if (!user) {
    renderLogin();
    return;
  }

  let horario = null;
  try {
    horario = await leerHorarioUsuario(user.id);
  } catch {
    horario = null;
  }

  app.innerHTML = `
    <div style="max-width:700px;margin:40px auto;padding:24px;border:1px solid #ddd;border-radius:16px;font-family:Arial,sans-serif;">
      <h2 style="margin-top:0;">Fichajes</h2>

      <div style="margin-bottom:16px;line-height:1.7;">
        Usuario: ${user.nombre || user.usuario || ""}<br>
        ID usuario: ${user.id}
      </div>

      ${horario ? `
        <div style="background:#eef2f7;padding:12px;border-radius:10px;margin-bottom:12px;line-height:1.7;">
          <b>Horario</b><br>
          Entrada: ${horario.hora_entrada}<br>
          Salida: ${horario.hora_salida}<br>
          Descanso: ${horario.min_descanso} min<br>
          Comida: ${horario.min_comida} min
        </div>
      ` : ""}

      <button id="btn_entrada" style="width:100%;height:48px;margin-bottom:8px;">Entrada</button>
      <button id="btn_salida" style="width:100%;height:48px;margin-bottom:8px;">Salida</button>
      <button id="btn_inicio_descanso" style="width:100%;height:48px;margin-bottom:8px;">Inicio descanso</button>
      <button id="btn_fin_descanso" style="width:100%;height:48px;margin-bottom:8px;">Fin descanso</button>
      <button id="btn_inicio_comida" style="width:100%;height:48px;margin-bottom:8px;">Inicio comida</button>
      <button id="btn_fin_comida" style="width:100%;height:48px;margin-bottom:8px;">Fin comida</button>
      <button id="btn_historial" style="width:100%;height:48px;margin-bottom:8px;">Ver historial</button>
      <button id="btn_volver" style="width:100%;height:48px;">Volver</button>

      <div id="estado" style="margin-top:16px;white-space:pre-wrap;"></div>
      <div id="lista" style="margin-top:16px;"></div>
    </div>
  `;

  document.getElementById("btn_entrada").onclick = () => fichar("entrada");
  document.getElementById("btn_salida").onclick = () => fichar("salida");
  document.getElementById("btn_inicio_descanso").onclick = () => fichar("inicio_descanso");
  document.getElementById("btn_fin_descanso").onclick = () => fichar("fin_descanso");
  document.getElementById("btn_inicio_comida").onclick = () => fichar("inicio_comida");
  document.getElementById("btn_fin_comida").onclick = () => fichar("fin_comida");
  document.getElementById("btn_historial").onclick = verHistorial;
  document.getElementById("btn_volver").onclick = renderHome;
}

async function getUltimoFichaje(usuarioId) {
  const data = await leerUltimosFichajes(usuarioId, 1);
  if (!Array.isArray(data) || data.length === 0) return null;
  return data[0];
}

async function fichar(tipo) {
  const user = getUser();
  const estado = document.getElementById("estado");

  if (!user || !estado) {
    renderLogin();
    return;
  }

  estado.innerText = "Comprobando...";

  try {
    const ultimo = await getUltimoFichaje(user.id);
    const errorValidacion = validarNuevoFichaje(tipo, ultimo);

    if (errorValidacion) {
      estado.innerText = errorValidacion;
      return;
    }

    estado.innerText = "Obteniendo ubicación...";

    const loc = await getLocation();

    let lat = null;
    let lng = null;
    let direccion = "Sin ubicación";

    if (loc) {
      lat = loc.lat;
      lng = loc.lng;
      direccion = await getAddress(lat, lng);
    }

    estado.innerText = "Guardando...";

    await guardarFichaje({
      usuario_id: user.id,
      trabajador: user.nombre || user.usuario || "",
      tipo,
      nota: "",
      lat,
      lng,
      direccion
    });

    estado.innerText = `${getTextoTipo(tipo)} guardado correctamente\n${direccion}`;
    await verHistorial();
  } catch (e) {
    estado.innerText = e.message || "Error guardando fichaje";
  }
}

async function verHistorial() {
  const user = getUser();
  const lista = document.getElementById("lista");

  if (!user || !lista) {
    renderLogin();
    return;
  }

  lista.innerHTML = "Cargando historial...";

  try {
    const data = await leerUltimosFichajes(user.id, 10);

    if (!Array.isArray(data) || data.length === 0) {
      lista.innerHTML = "No hay fichajes para este usuario.";
      return;
    }

    lista.innerHTML = data.map(f => `
      <div style="margin:10px 0;padding:12px;border:1px solid #ddd;border-radius:10px;">
        <b style="color:${colorTipoFichaje(f.tipo)}">${getTextoTipo(f.tipo)}</b><br>
        ${formatFecha(f.created_at)} ${formatHora(f.created_at)}<br>
        ${f.direccion || ""}
      </div>
    `).join("");
  } catch (e) {
    lista.innerHTML = e.message || "Error cargando historial";
  }
}

function init() {
  const user = getUser();
  if (user) {
    renderHome();
  } else {
    renderLogin();
  }
}

window.logout = logout;
window.renderHome = renderHome;
window.renderFichajes = renderFichajes;
window.fichar = fichar;
window.verHistorial = verHistorial;

init();