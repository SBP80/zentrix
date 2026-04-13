const SUPABASE_URL = "https://fxxfgbxnqhtlrwiyyafu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_1RbCV4I_yhpFwZl4wK7e2Q_a6FSyoxC";

function headers(extra = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: "Bearer " + SUPABASE_ANON_KEY,
    ...extra
  };
}

function restUrl(path = "") {
  return `${SUPABASE_URL}/rest/v1/${path}`;
}

async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function loginUsuario(usuario, password) {
  const url = restUrl(
    `personal?select=*&usuario=eq.${encodeURIComponent(usuario)}&password=eq.${encodeURIComponent(password)}&activo=eq.true`
  );

  const res = await fetch(url, {
    method: "GET",
    headers: headers({ Accept: "application/json" })
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(data?.message || "Error consultando usuarios");
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Usuario o contraseña incorrectos");
  }

  return data[0];
}

export async function guardarFichaje({ usuario_id, trabajador, tipo, nota = "" }) {
  const res = await fetch(restUrl("fichajes"), {
    method: "POST",
    headers: headers({
      "Content-Type": "application/json",
      Prefer: "return=representation"
    }),
    body: JSON.stringify({
      usuario_id,
      trabajador,
      tipo,
      nota
    })
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Error guardando fichaje");
  }

  return Array.isArray(data) ? data[0] : data;
}

export async function leerUltimosFichajes(usuarioId, limit = 10) {
  const url = restUrl(
    `fichajes?select=*&usuario_id=eq.${encodeURIComponent(usuarioId)}&order=created_at.desc&limit=${encodeURIComponent(limit)}`
  );

  const res = await fetch(url, {
    method: "GET",
    headers: headers({ Accept: "application/json" })
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(data?.message || "Error cargando fichajes");
  }

  return Array.isArray(data) ? data : [];
}

export async function guardarEventoAgenda({
  usuario_id,
  usuario_nombre,
  titulo,
  fecha,
  hora,
  nota
}) {
  const res = await fetch(restUrl("Agenda"), {
    method: "POST",
    headers: headers({
      "Content-Type": "application/json",
      Prefer: "return=representation"
    }),
    body: JSON.stringify({
      usuario_id,
      usuario_nombre,
      titulo,
      fecha,
      hora,
      nota
    })
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Error guardando evento");
  }

  return Array.isArray(data) ? data[0] : data;
}

export async function leerEventosAgenda(usuarioId, limit = 20) {
  const url = restUrl(
    `Agenda?select=*&usuario_id=eq.${encodeURIComponent(usuarioId)}&order=fecha.asc&order=hora.asc&limit=${encodeURIComponent(limit)}`
  );

  const res = await fetch(url, {
    method: "GET",
    headers: headers({ Accept: "application/json" })
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(data?.message || "Error cargando eventos");
  }

  return Array.isArray(data) ? data : [];
}