const KEY = "zentrix_ausencias_v1";

// ===============================
// BASE
// ===============================
function leer() {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

function guardar(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

// ===============================
// CRUD
// ===============================
export function getAusencias() {
  return leer();
}

export function getAusenciasByTrabajador(trabajadorId) {
  return leer().filter(a => String(a.trabajadorId) === String(trabajadorId));
}

export function addAusencia(data) {
  const lista = leer();

  const nueva = {
    id: Date.now(),
    trabajadorId: data.trabajadorId,
    tipo: data.tipo || "vacaciones",
    fechaInicio: data.fechaInicio,
    fechaFin: data.fechaFin,
    comentario: data.comentario || "",
    estado: data.estado || "aprobada",
    createdAt: new Date().toISOString()
  };

  lista.push(nueva);
  guardar(lista);

  return nueva;
}

export function updateAusencia(id, cambios) {
  const lista = leer();

  const nueva = lista.map(a =>
    String(a.id) === String(id) ? { ...a, ...cambios } : a
  );

  guardar(nueva);
}

export function deleteAusencia(id) {
  const lista = leer().filter(a => String(a.id) !== String(id));
  guardar(lista);
}

// ===============================
// LÓGICA DE DÍAS
// ===============================
export function contarDiasEntreFechas(inicio, fin) {
  if (!inicio || !fin) return 0;

  const d1 = new Date(inicio);
  const d2 = new Date(fin);

  if (isNaN(d1) || isNaN(d2)) return 0;

  const diff = d2 - d1;

  if (diff < 0) return 0;

  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

// ===============================
// RESUMEN AUTOMÁTICO (CORREGIDO)
// ===============================
export function calcularResumenAusencias(trabajadorId) {
  const lista = getAusenciasByTrabajador(trabajadorId);

  let vacaciones = 0;
  let moscosos = 0;

  lista.forEach(a => {
    const dias = contarDiasEntreFechas(a.fechaInicio, a.fechaFin);

    if (a.tipo === "vacaciones") {
      vacaciones += dias;
    }

    if (a.tipo === "moscoso") {
      moscosos += dias;
    }
  });

  return {
    vacaciones,
    moscosos
  };
}
