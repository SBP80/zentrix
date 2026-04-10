export function estaDisponible(usuarioId, fecha) {
  const personal = getPersonal();

  const user = personal.find(u => String(u.id) === String(usuarioId));
  if (!user) return { ok: false, motivo: "Usuario no encontrado" };

  const f = normalizarFecha(fecha);

  const ausencias = user.ausencias || [];

  const tieneAusencia = ausencias.find(a => {
    const inicio = normalizarFecha(a.desde);
    const fin = normalizarFecha(a.hasta);
    return f >= inicio && f <= fin;
  });

  if (tieneAusencia) {
    return {
      ok: false,
      motivo: `No disponible (${tieneAusencia.tipo})`
    };
  }

  const dia = new Date(f).getDay();

  if (dia === 0 || dia === 6) {
    return {
      ok: "warning",
      motivo: "Día no laborable"
    };
  }

  return { ok: true };
}

function getPersonal() {
  try {
    return JSON.parse(localStorage.getItem("zentrix_personal_v2") || "[]");
  } catch {
    return [];
  }
}

function normalizarFecha(f) {
  if (!f) return "";
  return new Date(f).toISOString().split("T")[0];
}