import {
  loginUsuario,
  guardarFichaje,
  leerUltimosFichajes
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
  const d = new Date(fecha);
  return d.toLocaleDateString("es-ES");
}

function formatHora(fecha) {
  const d = new Date(fecha);
  return d.toLocaleTimeString("es-ES");
}
function colorTipoFichaje(tipo) {
  if (tipo === "entrada") return "#16a34a";
  if (tipo === "salida") return "#dc2626";
  return "#475569";
}

/* =========================
   UBICACIÓN
========================= */

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
  const latTxt = Number(lat);
  const lngTxt = Number(lng);

  // 1) Intento de dirección detallada
  try {
    const url1 =
      `https://nominatim.openstreetmap.org/reverse` +
      `?format=jsonv2` +
      `&lat=${encodeURIComponent(latTxt)}` +
      `&lon=${encodeURIComponent(lngTxt)}` +
      `&addressdetails=1` +
      `&accept-language=es`;

    const res1 = await fetch(url1, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });

    if (res1.ok) {
      const data1 = await res1.json();

      const a = data1.address || {};

      const partesNominatim = [
        [a.road, a.house_number].filter(Boolean).join(" ").trim(),
        a.hamlet,
        a.village,
        a.town,
        a.city,
        a.state,
        a.postcode,
        a.country
      ]
        .map(v => String(v || "").trim())
        .filter(v => v !== "");

      if (partesNominatim.length > 0) {
        return [...new Set(partesNominatim)].join(", ");
      }

      if (data1.display_name) {
        return String(data1.display_name).trim();
      }
    }
  } catch {
    // seguimos al siguiente intento
  }

  // 2) Fallback a BigDataCloud
  try {
    const url2 =
      `https://api.bigdatacloud.net/data/reverse-geocode-client` +
      `?latitude=${encodeURIComponent(latTxt)}` +
      `&longitude=${encodeURIComponent(lngTxt)}` +
      `&localityLanguage=es`;

    const res2 = await fetch(url2, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });

    if (res2.ok) {
      const data2 = await res2.json();

      const partesBigData = [
        data2.locality,
        data2.city,
        data2.principalSubdivision,
        data2.countryName
      ]
        .map(v => String(v || "").trim())
        .filter(v => v !== "");

      if (partesBigData.length > 0) {
        return [...new Set(partesBigData)].join(", ");
      }
    }
  } catch {
    // seguimos al último fallback
  }

  // 3) Último fallback
  return `Lat ${latTxt}, Lng ${lngTxt}`;
}
/* =========================
   LOGIN
========================= */

function renderLogin() {
  app.innerHTML = `
    <div style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:24px;
      box-sizing:border-box;
      background:#f3f4f6;
      font-family:Arial,sans-serif;
    ">
      <div style="
        width:100%;
        max-width:420px;
        background:#ffffff;
        border:1px solid #dbe4ee;
        border-radius:24px;
        padding:24px;
        box-sizing:border-box;
        box-shadow:0 10px 30px rgba(15,23,42,0.08);
      ">
        <h1 style="
          margin:0 0 10px 0;
          font-size:34px;
          line-height:1.1;
          color:#111827;
        ">Zentryx</h1>

        <p style="
          margin:0 0 24px 0;
          color:#6b7280;
          font-size:16px;
        ">Acceso al sistema</p>

        <div style="display:grid;gap:14px;">
          <div>
            <label for="user" style="
              display:block;
              margin-bottom:6px;
              font-weight:700;
              color:#111827;
            ">Usuario</label>

            <input
              id="user"
              type="text"
              placeholder="Usuario"
              style="
                width:100%;
                height:50px;
                border:1px solid #cbd5e1;
                border-radius:14px;
                padding:0 14px;
                box-sizing:border-box;
                font-size:16px;
                background:#ffffff;
                color:#111827;
              "
            />
          </div>

          <div>
            <label for="pass" style="
              display:block;
              margin-bottom:6px;
              font-weight:700;
              color:#111827;
            ">Contraseña</label>

            <input
              id="pass"
              type="password"
              placeholder="Contraseña"
              style="
                width:100%;
                height:50px;
                border:1px solid #cbd5e1;
                border-radius:14px;
                padding:0 14px;
                box-sizing:border-box;
                font-size:16px;
                background:#ffffff;
                color:#111827;
              "
            />
          </div>

          <div id="msg" style="
            min-height:20px;
            color:#16a34a;
            font-size:14px;
            font-weight:700;
          ">Listo</div>

          <button id="btn_login" type="button" style="
            width:100%;
            height:56px;
            border:none;
            border-radius:16px;
            background:#4361ee;
            color:#ffffff;
            font-size:18px;
            font-weight:800;
            cursor:pointer;
          ">
            Entrar
          </button>
        </div>
      </div>
    </div>
  `;

  const btn = document.getElementById("btn_login");
  const userEl = document.getElementById("user");
  const passEl = document.getElementById("pass");
  const msg = document.getElementById("msg");

  async function entrar() {
    const usuario = String(userEl?.value || "").trim();
    const password = String(passEl?.value || "").trim();

    if (!usuario || !password) {
      msg.style.color = "#b91c1c";
      msg.textContent = "Escribe usuario y contraseña";
      return;
    }

    msg.style.color = "#111827";
    msg.textContent = "Comprobando...";

    try {
      const user = await loginUsuario(usuario, password);
      setUser(user);
      renderHome();
    } catch (error) {
      msg.style.color = "#b91c1c";
      msg.textContent = error?.message || "Error de conexión";
    }
  }

  btn?.addEventListener("click", entrar);

  passEl?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") entrar();
  });
}

/* =========================
   INICIO
========================= */

function renderHome() {
  const user = getUser();

  if (!user) {
    renderLogin();
    return;
  }

  app.innerHTML = `
    <div style="
      min-height:100vh;
      background:#f3f4f6;
      padding:24px;
      box-sizing:border-box;
      font-family:Arial,sans-serif;
    ">
      <div style="
        width:100%;
        max-width:820px;
        margin:0 auto;
        background:#ffffff;
        border:1px solid #dbe4ee;
        border-radius:24px;
        padding:24px;
        box-sizing:border-box;
        box-shadow:0 10px 30px rgba(15,23,42,0.08);
      ">
        <h1 style="
          margin:0 0 12px 0;
          font-size:34px;
          color:#111827;
        ">Zentryx</h1>

        <div style="
          margin-bottom:18px;
          color:#475569;
          font-size:16px;
          font-weight:700;
          line-height:1.7;
        ">
          Usuario: ${user.nombre || user.usuario || ""}
          <br>
          Rol: ${user.rol || ""}
          <br>
          ID usuario: ${user.id}
        </div>

        <div style="display:grid;gap:12px;">
          <button id="btn_ir_fichajes" type="button" style="
            width:100%;
            height:56px;
            border:none;
            border-radius:16px;
            background:#4361ee;
            color:#ffffff;
            font-size:18px;
            font-weight:800;
            cursor:pointer;
          ">
            Ir a fichajes
          </button>

          <button id="btn_logout" type="button" style="
            width:100%;
            height:56px;
            border:none;
            border-radius:16px;
            background:#dc2626;
            color:#ffffff;
            font-size:18px;
            font-weight:800;
            cursor:pointer;
          ">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("btn_ir_fichajes")?.addEventListener("click", renderFichajes);
  document.getElementById("btn_logout")?.addEventListener("click", logout);
}
/* =========================
   FICHAJES
========================= */

function renderFichajes() {
  const user = getUser();

  if (!user) {
    renderLogin();
    return;
  }

  app.innerHTML = `
    <div style="
      min-height:100vh;
      background:#f3f4f6;
      padding:24px;
      box-sizing:border-box;
      font-family:Arial,sans-serif;
    ">
      <div style="
        width:100%;
        max-width:820px;
        margin:0 auto;
        background:#ffffff;
        border:1px solid #dbe4ee;
        border-radius:24px;
        padding:24px;
        box-sizing:border-box;
        box-shadow:0 10px 30px rgba(15,23,42,0.08);
      ">
        <h1 style="
          margin:0 0 12px 0;
          font-size:34px;
          color:#111827;
        ">Fichajes</h1>

        <div style="
          margin-bottom:18px;
          color:#475569;
          font-size:16px;
          font-weight:700;
          line-height:1.7;
        ">
          Usuario activo: ${user.nombre || user.usuario || ""}
          <br>
          ID usuario: ${user.id}
        </div>

        <div style="display:grid;gap:12px;">
          <button id="btn_entrada" type="button" style="
            width:100%;
            height:56px;
            border:none;
            border-radius:16px;
            background:#16a34a;
            color:#ffffff;
            font-size:18px;
            font-weight:800;
            cursor:pointer;
          ">
            Entrada
          </button>

          <button id="btn_salida" type="button" style="
            width:100%;
            height:56px;
            border:none;
            border-radius:16px;
            background:#dc2626;
            color:#ffffff;
            font-size:18px;
            font-weight:800;
            cursor:pointer;
          ">
            Salida
          </button>

          <button id="btn_historial" type="button" style="
            width:100%;
            height:56px;
            border:none;
            border-radius:16px;
            background:#0f766e;
            color:#ffffff;
            font-size:18px;
            font-weight:800;
            cursor:pointer;
          ">
            Ver historial
          </button>

          <button id="btn_volver" type="button" style="
            width:100%;
            height:56px;
            border:none;
            border-radius:16px;
            background:#475569;
            color:#ffffff;
            font-size:18px;
            font-weight:800;
            cursor:pointer;
          ">
            Volver
          </button>
        </div>

        <div id="estado" style="
          margin-top:20px;
          padding:16px;
          border:1px solid #dbe4ee;
          border-radius:16px;
          background:#f8fafc;
          color:#111827;
          line-height:1.7;
          white-space:pre-wrap;
          word-break:break-word;
        ">Estado: listo para fichar.</div>

        <div id="lista" style="margin-top:20px; display:none;"></div>
      </div>
    </div>
  `;

  document.getElementById("btn_entrada")?.addEventListener("click", () => fichar("entrada"));
  document.getElementById("btn_salida")?.addEventListener("click", () => fichar("salida"));
  document.getElementById("btn_historial")?.addEventListener("click", verHistorial);
  document.getElementById("btn_volver")?.addEventListener("click", renderHome);
}

async function getUltimoFichaje(usuarioId) {
  const data = await leerUltimosFichajes(usuarioId, 1);

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  return data[0];
}

async function fichar(tipo) {
  const user = getUser();
  const estado = document.getElementById("estado");
  const lista = document.getElementById("lista");

  if (!user || !estado) {
    renderLogin();
    return;
  }

  estado.textContent = "Estado: comprobando...";

  try {
    const ultimo = await getUltimoFichaje(user.id);

    if (tipo === "entrada" && ultimo?.tipo === "entrada") {
      estado.textContent = "Estado: no se puede registrar otra entrada seguida.";
      return;
    }

    if (tipo === "salida" && !ultimo) {
      estado.textContent = "Estado: no se puede registrar salida sin entrada previa.";
      return;
    }

    if (tipo === "salida" && ultimo?.tipo === "salida") {
      estado.textContent = "Estado: no se puede registrar otra salida seguida.";
      return;
    }

    estado.textContent = "Estado: obteniendo ubicación...";

    const loc = await getLocation();

    let lat = null;
    let lng = null;
    let direccion = "Sin ubicación";

    if (loc) {
      lat = loc.lat;
      lng = loc.lng;
      direccion = await getAddress(lat, lng);
    }

    estado.textContent = "Estado: guardando...";

    await guardarFichaje({
      usuario_id: user.id,
      trabajador: user.nombre || user.usuario || "",
      tipo,
      nota: "",
      lat,
      lng,
      direccion
    });

    estado.textContent = `Estado: ${tipo} guardada correctamente.\nUbicación: ${direccion}`;

    if (lista) {
      await verHistorial();
    }
  } catch (error) {
    estado.textContent = `Estado: ${error?.message || "Error guardando fichaje"}`;
  }
}

async function verHistorial() {
  const user = getUser();
  const lista = document.getElementById("lista");

  if (!user || !lista) {
    renderLogin();
    return;
  }

  lista.style.display = "block";
  lista.innerHTML = `
    <div style="
      padding:16px;
      border:1px solid #dbe4ee;
      border-radius:16px;
      background:#f8fafc;
      color:#111827;
    ">Cargando historial...</div>
  `;

  try {
    const data = await leerUltimosFichajes(user.id, 10);

    if (!Array.isArray(data) || data.length === 0) {
      lista.innerHTML = `
        <div style="
          padding:16px;
          border:1px solid #dbe4ee;
          border-radius:16px;
          background:#f8fafc;
          color:#111827;
        ">No hay fichajes para este usuario.</div>
      `;
      return;
    }

    lista.innerHTML = data.map((item) => {
      const color = colorTipoFichaje(item.tipo);
      const fh = formatFecha(item.created_at);
      const hh = formatHora(item.created_at);

      return `
        <div style="
          margin-top:12px;
          padding:16px;
          border:1px solid #dbe4ee;
          border-radius:16px;
          background:#ffffff;
          box-shadow:0 1px 2px rgba(0,0,0,0.04);
        ">
          <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:12px;
            flex-wrap:wrap;
            margin-bottom:10px;
          ">
            <div style="
              font-size:18px;
              font-weight:800;
              color:${color};
              text-transform:capitalize;
            ">
              ${item.tipo || ""}
            </div>

            <div style="
              padding:6px 10px;
              border-radius:999px;
              background:#f1f5f9;
              color:#334155;
              font-size:13px;
              font-weight:700;
            ">
              ID usuario: ${item.usuario_id}
            </div>
          </div>

          <div style="
            color:#111827;
            font-size:16px;
            font-weight:700;
            line-height:1.8;
          ">
            Fecha: ${fh}<br>
            Hora: ${hh}
          </div>

          <div style="
            margin-top:10px;
            color:#64748b;
            font-size:14px;
            line-height:1.6;
          ">
            Trabajador: ${item.trabajador || ""}<br>
            Dirección: ${item.direccion || "Sin dirección"}
          </div>
        </div>
      `;
    }).join("");
  } catch (error) {
    lista.innerHTML = `
      <div style="
        padding:16px;
        border:1px solid #fecaca;
        border-radius:16px;
        background:#fef2f2;
        color:#991b1b;
        white-space:pre-wrap;
      ">${error?.message || "Error cargando historial"}</div>
    `;
  }
}

/* =========================
   ARRANQUE
========================= */

function init() {
  const user = getUser();

  if (user) {
    renderHome();
  } else {
    renderLogin();
  }
}

init();
