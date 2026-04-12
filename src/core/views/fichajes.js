import { renderMenu, activarMenu } from "../../components/menu.js";
import { getCurrentUser } from "../../auth/session.js";
import { getSupabaseHeaders, getSupabaseRestUrl } from "../../config/supabase.js";

export function renderFichajes() {
  const app = document.getElementById("app");
  if (!app) return;

  const user = getCurrentUser();

  app.innerHTML = `
    <div style="
      min-height:100vh;
      background:#f3f4f6;
      padding:24px 24px 110px 24px;
      box-sizing:border-box;
      font-family:Arial,sans-serif;
    ">
      <div style="
        max-width:980px;
        margin:0 auto;
        background:#ffffff;
        border:1px solid #dbe4ee;
        border-radius:20px;
        padding:24px;
        box-sizing:border-box;
      ">
        <h1 style="
          margin:0 0 10px 0;
          font-size:34px;
          color:#111827;
        ">Fichajes</h1>

        <div style="
          margin-bottom:18px;
          color:#475569;
          font-size:16px;
          font-weight:700;
        ">
          Usuario activo: ${escapeHtml(user?.nombre || user?.usuario || "Sin usuario")}
        </div>

        <div style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:14px;
          margin-bottom:18px;
        ">
          <button id="btn_entrada" type="button" style="
            height:56px;
            border:none;
            border-radius:14px;
            background:#16a34a;
            color:#fff;
            font-size:20px;
            font-weight:800;
            cursor:pointer;
          ">
            Entrada
          </button>

          <button id="btn_salida" type="button" style="
            height:56px;
            border:none;
            border-radius:14px;
            background:#dc2626;
            color:#fff;
            font-size:20px;
            font-weight:800;
            cursor:pointer;
          ">
            Salida
          </button>
        </div>

        <div id="estado_fichaje" style="
          margin-bottom:18px;
          padding:14px;
          border:1px solid #dbe4ee;
          border-radius:14px;
          background:#f8fafc;
          color:#111827;
          font-size:16px;
          line-height:1.5;
          white-space:pre-wrap;
          word-break:break-word;
        ">
          Estado: listo para fichar.
        </div>

        <div style="
          overflow:auto;
          border:1px solid #dbe4ee;
          border-radius:16px;
        ">
          <table style="
            width:100%;
            border-collapse:collapse;
            min-width:760px;
          ">
            <thead>
              <tr style="background:#f8fafc;">
                <th style="${thStyle}">Fecha</th>
                <th style="${thStyle}">Trabajador</th>
                <th style="${thStyle}">Tipo</th>
                <th style="${thStyle}">Dirección</th>
              </tr>
            </thead>
            <tbody id="tabla_fichajes_body">
              <tr>
                <td colspan="4" style="
                  padding:16px;
                  border-bottom:1px solid #e5e7eb;
                  color:#64748b;
                ">
                  Cargando fichajes...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      ${renderMenu("fichajes")}
    </div>
  `;

  activarMenu();

  document.getElementById("btn_entrada")?.addEventListener("click", () => fichar("entrada"));
  document.getElementById("btn_salida")?.addEventListener("click", () => fichar("salida"));

  cargarUltimosFichajes();
}

const thStyle = `
  padding:14px;
  text-align:left;
  border-bottom:1px solid #e5e7eb;
  color:#111827;
  font-size:15px;
  font-weight:800;
`;

function setEstado(texto) {
  const el = document.getElementById("estado_fichaje");
  if (el) {
    el.textContent = "Estado: " + texto;
  }
}

async function fichar(tipo) {
  const user = getCurrentUser();

  if (!user) {
    setEstado("no hay usuario activo.");
    return;
  }

  try {
    setEstado("obteniendo ubicación...");

    const posicion = await getCurrentPositionSafe();
    const lat = posicion?.coords?.latitude ?? null;
    const lng = posicion?.coords?.longitude ?? null;

    let direccion = "Ubicación no disponible";

    if (lat !== null && lng !== null) {
      setEstado("obteniendo dirección...");
      direccion = await getDireccionDesdeCoords(lat, lng);
    }

    setEstado("guardando fichaje...");

    const payload = {
      trabajador: user.nombre || user.usuario || "Sin nombre",
      tipo,
      nota: "",
      lat,
      lng,
      direccion
    };

    const res = await fetch(getSupabaseRestUrl("fichajes"), {
      method: "POST",
      headers: getSupabaseHeaders({
        "Content-Type": "application/json",
        Prefer: "return=representation"
      }),
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const msg = data?.message || text || `HTTP ${res.status}`;
      setEstado("error guardando fichaje: " + msg);
      return;
    }

    setEstado(
      `${tipo === "entrada" ? "entrada" : "salida"} guardada correctamente.\n${direccion}`
    );

    await cargarUltimosFichajes();
  } catch (error) {
    setEstado("error general: " + (error?.message || String(error)));
  }
}

async function cargarUltimosFichajes() {
  const tbody = document.getElementById("tabla_fichajes_body");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="4" style="
        padding:16px;
        border-bottom:1px solid #e5e7eb;
        color:#64748b;
      ">
        Cargando fichajes...
      </td>
    </tr>
  `;

  try {
    const user = getCurrentUser();
    const nombre = user?.nombre || user?.usuario || "";

    let url = getSupabaseRestUrl(
      `fichajes?select=*&order=created_at.desc&limit=20`
    );

    if (nombre) {
      url = getSupabaseRestUrl(
        `fichajes?select=*&trabajador=eq.${encodeURIComponent(nombre)}&order=created_at.desc&limit=20`
      );
    }

    const res = await fetch(url, {
      method: "GET",
      headers: getSupabaseHeaders({
        Accept: "application/json"
      })
    });

    const text = await res.text();
    let data = [];

    try {
      data = text ? JSON.parse(text) : [];
    } catch {
      data = [];
    }

    if (!res.ok) {
      const msg = data?.message || text || `HTTP ${res.status}`;
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="
            padding:16px;
            border-bottom:1px solid #e5e7eb;
            color:#b91c1c;
          ">
            Error cargando fichajes: ${escapeHtml(msg)}
          </td>
        </tr>
      `;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="
            padding:16px;
            border-bottom:1px solid #e5e7eb;
            color:#64748b;
          ">
            No hay fichajes todavía.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = data.map((item) => {
      const fecha = item.created_at
        ? new Date(item.created_at).toLocaleString("es-ES")
        : "";

      const tipoTexto = item.tipo === "entrada" ? "Entrada" : "Salida";

      return `
        <tr>
          <td style="${tdStyle}">${escapeHtml(fecha)}</td>
          <td style="${tdStyle}">${escapeHtml(item.trabajador)}</td>
          <td style="${tdStyle}">${escapeHtml(tipoTexto)}</td>
          <td style="${tdStyle}">${escapeHtml(item.direccion || "")}</td>
        </tr>
      `;
    }).join("");
  } catch (error) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="
          padding:16px;
          border-bottom:1px solid #e5e7eb;
          color:#b91c1c;
        ">
          Error general cargando fichajes: ${escapeHtml(error?.message || String(error))}
        </td>
      </tr>
    `;
  }
}

const tdStyle = `
  padding:14px;
  text-align:left;
  border-bottom:1px solid #e5e7eb;
  color:#111827;
  font-size:15px;
  vertical-align:top;
`;

function getCurrentPositionSafe() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("geolocalización no disponible"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  });
}

async function getDireccionDesdeCoords(lat, lng) {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!res.ok) {
      return `Lat ${lat}, Lng ${lng}`;
    }

    const data = await res.json();

    return data?.display_name || `Lat ${lat}, Lng ${lng}`;
  } catch {
    return `Lat ${lat}, Lng ${lng}`;
  }
}

function escapeHtml(texto) {
  return String(texto || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}