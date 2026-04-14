const SUPABASE_URL = "https://fxxfgbxnqhtlrwiyyafu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_1RbCV4I_yhpFwZl4wK7e2Q_a6FSyoxC";

function getHeaders(extra = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...extra
  };
}

function getRestUrl(path = "") {
  return `${SUPABASE_URL}/rest/v1/${path}`;
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function buildEq(value) {
  return encodeURIComponent(String(value ?? "").trim());
}

export async function loginUsuario(usuario, password) {
  const url = getRestUrl(
    `personal?select=*&usuario=eq.${buildEq(usuario)}&password=eq.${buildEq(password)}&activo=eq.true&limit=1`
  );

  const res = await fetch(url, {
    method: "GET",
    headers: getHeaders({
      Accept: "application/json"
    })
  });

  const data = await safeJson(res);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Error consultando usuarios");
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Usuario o contraseña incorrectos");
  }

  return data[0];
}

export async function guardarFichaje({
  usuario_id,
  trabajador,
  tipo,
  nota = "",
  lat = null,
  lng = null,
  direccion = ""
}) {
  const body = {
    usuario_id,
    trabajador,
    tipo,
    nota,
    lat,
    lng,
    direccion
  };

  const res = await fetch(getRestUrl("fichajes"), {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json",
      Prefer: "return=representation"
    }),
    body: JSON.stringify(body)
  });

  const data = await safeJson(res);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Error guardando fichaje");
  }

  return Array.isArray(data) ? data[0] : data;
}

export async function leerUltimosFichajes(usuarioId, limit = 10) {
  const url = getRestUrl(
    `fichajes?select=*&usuario_id=eq.${buildEq(usuarioId)}&order=created_at.desc&limit=${encodeURIComponent(limit)}`
  );

  const res = await fetch(url, {
    method: "GET",
    headers: getHeaders({
      Accept: "application/json"
    })
  });

  const data = await safeJson(res);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Error cargando fichajes");
  }

  return Array.isArray(data) ? data : [];
}

export async function leerHorarioUsuario(usuario_id) {
  const url = getRestUrl(
    `horarios_usuario?select=*&usuario_id=eq.${buildEq(usuario_id)}&activo=eq.true&limit=1`
  );

  const res = await fetch(url, {
    method: "GET",
    headers: getHeaders({
      Accept: "application/json"
    })
  });

  const data = await safeJson(res);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Error leyendo horario");
  }

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  return data[0];
}