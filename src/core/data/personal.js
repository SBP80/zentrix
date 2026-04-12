import { getSupabaseHeaders, getSupabaseRestUrl } from "../../config/supabase.js";

export async function loginUsuario(usuario, password) {
  const url = getSupabaseRestUrl(
    `personal?select=*&usuario=eq.${encodeURIComponent(usuario)}&activo=eq.true`
  );

  const res = await fetch(url, {
    method: "GET",
    headers: getSupabaseHeaders({
      Accept: "application/json"
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error("Error consultando usuarios");
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Usuario no encontrado");
  }

  const user = data[0];

  if (String(user.password) !== String(password)) {
    throw new Error("Contraseña incorrecta");
  }

  return {
    id: user.id,
    usuario: user.usuario,
    nombre: user.nombre,
    rol: user.rol
  };
}