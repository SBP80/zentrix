const AUSENCIAS_KEY = "zentrix_ausencias_v1";

function ensureAusencias() {
  try {
    const data = JSON.parse(localStorage.getItem(AUSENCIAS_KEY) || "[]");
    if (Array.isArray(data)) return data;
  } catch (error) {
    // nada
  }

  localStorage.setItem(AUSENCIAS_KEY, JSON.stringify([]));
  return [];
}

export function getAusencias() {
  return ensureAusencias();
}

export function saveAusencias(lista) {
  localStorage.setItem(AUSENCIAS_KEY, JSON.stringify(Array.isArray(lista) ? lista : []));
}

export function getAusenciasByTrabajador(trabajadorId) {
  return getAusencias().filter((item) => String(item.trabajadorId) === String(trabajadorId));
}

export function addAusencia(ausencia) {
  const lista = getAusencias();

  lista.push({
    id: "a_" + Date.now(),
    trabajadorId: String(ausencia.trabajadorId || ""),
    tipo: String(ausencia.tipo || "vacaciones").trim(), // vacaciones | moscoso | baja | permiso
    fechaInicio: String(ausencia.fechaInicio || "").trim(),
    fechaFin: String(ausencia.fechaFin || "").trim(),
    estado: String(ausencia.estado || "aprobada").trim(), // pendiente | aprobada | rechazada
    comentario: String(ausencia.comentario || "").trim()
  });

  saveAusencias(lista);
}

export function deleteAusencia(id) {
  const lista = getAusencias().filter((item) => String(item.id) !== String(id));
  saveAusencias(lista);
}

export function updateAusencia(id, cambios) {
  const lista = getAusencias().map((item) => {
    if (String(item.id) !== String(id)) return item;
    return { ...item, ...cambios };
  });

  saveAusencias(lista);
}
