const KEY = "zentrix_fichajes_v1";

const TIPOS = [
  "entrada",
  "salida",
  "inicio_descanso",
  "fin_descanso",
  "inicio_comida",
  "fin_comida"
];

export function getFichajes() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function addFichaje(data) {
  const lista = getFichajes();

  const tipo = TIPOS.includes(String(data.tipo || ""))
    ? String(data.tipo)
    : "entrada";

  const fechaIso = data.fechaIso || new Date().toISOString();

  const nuevo = {
    id: "fic_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    trabajador: String(data.trabajador || "").trim(),
    tipo,
    fecha: fechaIso,
    nota: String(data.nota || "").trim()
  };

  lista.push(nuevo);
  guardar(lista);
  return nuevo;
}

export function deleteFichaje(id) {
  const lista = getFichajes().filter((f) => String(f.id) !== String(id));
  guardar(lista);
}

export function getFichajesPorTrabajador(nombre) {
  return getFichajes().filter(
    (f) => String(f.trabajador || "") === String(nombre || "")
  );
}

export function getResumenHoyPorTrabajador(nombre) {
  const trabajador = String(nombre || "");
  if (!trabajador) {
    return resumenVacio();
  }

  const hoy = hoyLocalISO();
  const lista = getFichajes()
    .filter((f) => String(f.trabajador || "") === trabajador)
    .filter((f) => getFechaLocalISODesdeValor(f.fecha) === hoy)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  return calcularResumen(lista);
}

export function getResumenesHoy() {
  const todos = getFichajes();
  const hoy = hoyLocalISO();

  const porTrabajador = new Map();

  todos.forEach((f) => {
    if (getFechaLocalISODesdeValor(f.fecha) !== hoy) return;
    const nombre = String(f.trabajador || "").trim();
    if (!nombre) return;
    if (!porTrabajador.has(nombre)) porTrabajador.set(nombre, []);
    porTrabajador.get(nombre).push(f);
  });

  return Array.from(porTrabajador.entries())
    .map(([trabajador, lista]) => {
      const ordenados = lista.sort(
        (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      );
      return {
        trabajador,
        ...calcularResumen(ordenados)
      };
    })
    .sort((a, b) => a.trabajador.localeCompare(b.trabajador, "es"));
}

function calcularResumen(lista) {
  if (!Array.isArray(lista) || !lista.length) {
    return resumenVacio();
  }

  let entradaActiva = null;
  let brutoMs = 0;

  let descansoInicio = null;
  let descansoMs = 0;

  let comidaInicio = null;
  let comidaMs = 0;

  lista.forEach((f) => {
    const ts = new Date(f.fecha).getTime();
    if (!Number.isFinite(ts)) return;

    if (f.tipo === "entrada") {
      if (entradaActiva === null) {
        entradaActiva = ts;
      }
      return;
    }

    if (f.tipo === "salida") {
      if (entradaActiva !== null && ts >= entradaActiva) {
        brutoMs += ts - entradaActiva;
        entradaActiva = null;
      }
      return;
    }

    if (f.tipo === "inicio_descanso") {
      if (descansoInicio === null) {
        descansoInicio = ts;
      }
      return;
    }

    if (f.tipo === "fin_descanso") {
      if (descansoInicio !== null && ts >= descansoInicio) {
        descansoMs += ts - descansoInicio;
        descansoInicio = null;
      }
      return;
    }

    if (f.tipo === "inicio_comida") {
      if (comidaInicio === null) {
        comidaInicio = ts;
      }
      return;
    }

    if (f.tipo === "fin_comida") {
      if (comidaInicio !== null && ts >= comidaInicio) {
        comidaMs += ts - comidaInicio;
        comidaInicio = null;
      }
    }
  });

  const netoMs = Math.max(0, brutoMs - descansoMs - comidaMs);

  return {
    brutoMs,
    descansoMs,
    comidaMs,
    netoMs,
    brutoTexto: formatDuracion(brutoMs),
    descansoTexto: formatDuracion(descansoMs),
    comidaTexto: formatDuracion(comidaMs),
    netoTexto: formatDuracion(netoMs),
    abierto: entradaActiva !== null,
    cantidad: lista.length
  };
}

function resumenVacio() {
  return {
    brutoMs: 0,
    descansoMs: 0,
    comidaMs: 0,
    netoMs: 0,
    brutoTexto: "0 min",
    descansoTexto: "0 min",
    comidaTexto: "0 min",
    netoTexto: "0 min",
    abierto: false,
    cantidad: 0
  };
}

function guardar(lista) {
  localStorage.setItem(KEY, JSON.stringify(Array.isArray(lista) ? lista : []));
}

function hoyLocalISO() {
  const d = new Date();
  return getFechaLocalISODesdeDate(d);
}

function getFechaLocalISODesdeValor(valor) {
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "";
  return getFechaLocalISODesdeDate(d);
}

function getFechaLocalISODesdeDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDuracion(ms) {
  const minutosTotales = Math.floor(ms / 60000);
  const horas = Math.floor(minutosTotales / 60);
  const minutos = minutosTotales % 60;

  if (horas <= 0) return `${minutos} min`;
  if (minutos === 0) return `${horas} h`;
  return `${horas} h ${minutos} min`;
}