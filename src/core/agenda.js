import { db } from "./db.js";

const AGENDA_KEY = "zentrix_agenda_eventos_v1";
const FESTIVOS_EMPRESA_KEY = "zentrix_festivos_empresa_v1";

/*
  Calendario laboral base.
  Más adelante añadiremos nacionales, autonómicos, locales y festivos propios.
*/
const CALENDARIO_LABORAL_BASE = {
  2026: [
    "2026-01-01",
    "2026-01-06",
    "2026-04-03",
    "2026-05-01",
    "2026-08-15",
    "2026-10-12",
    "2026-12-08",
    "2026-12-25"
  ]
};

export function getEventos() {
  const manuales = leerEventosManuales();
  const ausencias = generarEventosDesdeAusencias();

  const mapa = new Map();

  [...manuales, ...ausencias].forEach((evento) => {
    mapa.set(String(evento.id), evento);
  });

  return Array.from(mapa.values()).sort(ordenarEventos);
}

export function addEvento(data) {
  const lista = leerEventosManuales();

  const nuevo = {
    id: "ev_" + Date.now(),
    titulo: String(data.titulo || "").trim(),
    fecha: data.fecha || "",
    hora: data.hora || "",
    tipo: String(data.tipo || "Trabajo").trim(),
    prioridad: String(data.prioridad || "Media").trim(),
    usuario: String(data.usuario || "").trim(),
    extra: String(data.extra || "").trim(),
    done: false,
    origen: "manual",
    createdAt: new Date().toISOString()
  };

  lista.push(nuevo);
  guardarEventosManuales(lista);
  return nuevo;
}

export function toggleEvento(id) {
  const idTxt = String(id);
  const lista = leerEventosManuales().map((item) => {
    if (String(item.id) !== idTxt) return item;
    return { ...item, done: !item.done };
  });

  guardarEventosManuales(lista);
}

export function deleteEvento(id) {
  const idTxt = String(id);
  const lista = leerEventosManuales().filter((item) => String(item.id) !== idTxt);
  guardarEventosManuales(lista);
}

export function getAgendaContexto() {
  const personal = db.personal.getAll();

  return {
    tipos: [
      "Trabajo",
      "Revisión herramienta",
      "Revisión vehículo",
      "Vacaciones",
      "Reunión",
      "Aviso"
    ],
    prioridades: ["Alta", "Media", "Baja"],
    usuarios: personal.length
      ? personal.map((p) => p.nombre || p.usuario || "Trabajador")
      : ["Operario 1"]
  };
}

/*
  Resultado:
  {
    ok: true/false,
    tipo: "none" | "fin_semana" | "festivo" | "ausencia",
    mensaje: ""
  }

  ok=false aquí significa:
  - mostrar aviso
  - permitir al usuario decidir si quiere continuar
*/
export function validarAsignacionAgenda({ usuario, fecha, tipo }) {
  const tipoEvento = String(tipo || "").trim().toLowerCase();

  // Si el propio evento ya es de ausencia, no avisamos
  if (
    tipoEvento === "vacaciones" ||
    tipoEvento === "baja" ||
    tipoEvento === "moscoso" ||
    tipoEvento === "permiso"
  ) {
    return { ok: true, tipo: "none", mensaje: "" };
  }

  if (!usuario || !fecha) {
    return { ok: true, tipo: "none", mensaje: "" };
  }

  const trabajador = buscarTrabajadorPorNombreOUsuario(usuario);

  if (!trabajador) {
    return { ok: true, tipo: "none", mensaje: "" };
  }

  if (esDomingo(fecha)) {
    return {
      ok: false,
      tipo: "fin_semana",
      mensaje: `${trabajador.nombre || trabajador.usuario || "Este trabajador"} tiene una cita en domingo (${formatFecha(fecha)}). ¿Seguro que quieres adjudicársela?`
    };
  }

  if (esSabado(fecha)) {
    return {
      ok: false,
      tipo: "fin_semana",
      mensaje: `${trabajador.nombre || trabajador.usuario || "Este trabajador"} tiene una cita en sábado (${formatFecha(fecha)}). ¿Seguro que quieres adjudicársela?`
    };
  }

  if (esFestivoEmpresa(fecha)) {
    return {
      ok: false,
      tipo: "festivo",
      mensaje: `${formatFecha(fecha)} es festivo según el calendario laboral. ¿Seguro que quieres adjudicar esta cita a ${trabajador.nombre || trabajador.usuario || "este trabajador"}?`
    };
  }

  const ausencia = obtenerAusenciaActiva(trabajador.id, fecha);

  if (ausencia) {
    return {
      ok: false,
      tipo: "ausencia",
      mensaje: `${trabajador.nombre || trabajador.usuario || "Este trabajador"} está de ${capitaliza(ausencia.tipo)} el ${formatFecha(fecha)}. ¿Seguro que quieres adjudicarle esta cita?`
    };
  }

  return { ok: true, tipo: "none", mensaje: "" };
}

export function getCalendarioLaboral() {
  return mezclarCalendarioLaboral();
}

export function getFestivosEmpresa() {
  try {
    const data = JSON.parse(localStorage.getItem(FESTIVOS_EMPRESA_KEY) || "{}");
    return esObjetoPlano(data) ? data : {};
  } catch {
    return {};
  }
}

function leerEventosManuales() {
  try {
    const data = JSON.parse(localStorage.getItem(AGENDA_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function guardarEventosManuales(lista) {
  localStorage.setItem(AGENDA_KEY, JSON.stringify(Array.isArray(lista) ? lista : []));
}

function generarEventosDesdeAusencias() {
  const personal = db.personal.getAll();
  const ausencias = db.ausencias.getAll();

  return ausencias
    .filter((a) => String(a.estado || "") === "aprobada")
    .map((a) => {
      const trabajador = personal.find((p) => String(p.id) === String(a.trabajadorId));
      const nombre = trabajador?.nombre || trabajador?.usuario || "Trabajador";
      const fecha = a.fechaInicio || "";
      const fin = a.fechaFin || a.fechaInicio || "";

      return {
        id: "aus_" + String(a.id),
        titulo: tituloAusencia(a.tipo, nombre),
        fecha,
        hora: "",
        tipo: tipoAgendaDesdeAusencia(a.tipo),
        prioridad: "Alta",
        usuario: nombre,
        extra: fecha !== fin ? `Hasta ${formatFecha(fin)}` : (a.comentario || ""),
        done: false,
        origen: "ausencia"
      };
    });
}

function buscarTrabajadorPorNombreOUsuario(texto) {
  const txt = normalizeText(texto);
  const personal = db.personal.getAll();

  return (
    personal.find((p) => normalizeText(p.nombre) === txt) ||
    personal.find((p) => normalizeText(p.usuario) === txt) ||
    null
  );
}

function obtenerAusenciaActiva(trabajadorId, fecha) {
  const ausencias = db.ausencias.getByTrabajador(trabajadorId);

  return (
    ausencias.find((a) => {
      if (String(a.estado || "") === "rechazada") return false;
      return fecha >= String(a.fechaInicio || "") && fecha <= String(a.fechaFin || "");
    }) || null
  );
}

function esSabado(fecha) {
  const d = new Date(fecha + "T12:00:00");
  return d.getDay() === 6;
}

function esDomingo(fecha) {
  const d = new Date(fecha + "T12:00:00");
  return d.getDay() === 0;
}

function esFestivoEmpresa(fecha) {
  const d = new Date(fecha + "T12:00:00");
  const year = String(d.getFullYear());
  const calendario = mezclarCalendarioLaboral();
  const festivos = calendario[year] || [];
  return festivos.includes(fecha);
}

function mezclarCalendarioLaboral() {
  const extra = getFestivosEmpresa();
  const years = new Set([
    ...Object.keys(CALENDARIO_LABORAL_BASE),
    ...Object.keys(extra)
  ]);

  const salida = {};

  years.forEach((year) => {
    const base = Array.isArray(CALENDARIO_LABORAL_BASE[year]) ? CALENDARIO_LABORAL_BASE[year] : [];
    const add = Array.isArray(extra[year]) ? extra[year] : [];
    salida[year] = Array.from(new Set([...base, ...add])).sort();
  });

  return salida;
}

function esObjetoPlano(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function tituloAusencia(tipo, nombre) {
  if (tipo === "vacaciones") return `Vacaciones · ${nombre}`;
  if (tipo === "moscoso") return `Moscoso · ${nombre}`;
  if (tipo === "baja") return `Baja · ${nombre}`;
  if (tipo === "permiso") return `Permiso · ${nombre}`;
  return `Ausencia · ${nombre}`;
}

function tipoAgendaDesdeAusencia(tipo) {
  if (tipo === "vacaciones") return "Vacaciones";
  if (tipo === "baja") return "Aviso";
  if (tipo === "moscoso") return "Aviso";
  if (tipo === "permiso") return "Aviso";
  return "Aviso";
}

function ordenarEventos(a, b) {
  const fechaA = `${a.fecha || ""} ${a.hora || ""}`.trim();
  const fechaB = `${b.fecha || ""} ${b.hora || ""}`.trim();
  return fechaA.localeCompare(fechaB);
}

function formatFecha(fecha) {
  if (!fecha) return "";
  const d = new Date(fecha + "T12:00:00");
  if (Number.isNaN(d.getTime())) return fecha;

  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const anio = String(d.getFullYear());
  return `${dia}/${mes}/${anio}`;
}

function capitaliza(texto) {
  const t = String(texto || "");
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}