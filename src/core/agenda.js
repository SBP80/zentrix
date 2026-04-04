import { db } from "./db.js";

const AGENDA_KEY = "zentrix_agenda_eventos_v1";

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
    origen: "manual"
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
        extra: fecha !== fin ? `Hasta ${fin}` : (a.comentario || ""),
        done: false,
        origen: "ausencia"
      };
    });
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
