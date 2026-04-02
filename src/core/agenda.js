const KEY = "zentryx_agenda_v3";

const USUARIOS = [
  { id: 1, nombre: "Administrador", rol: "admin" },
  { id: 2, nombre: "Encargado", rol: "encargado" },
  { id: 3, nombre: "Operario 1", rol: "operario" },
  { id: 4, nombre: "Operario 2", rol: "operario" }
];

const PERSONAL = ["Operario 1", "Operario 2", "Encargado"];
const VEHICULOS = ["Furgoneta 1", "Furgoneta 2"];
const HERRAMIENTAS = ["Taladro", "Bomba limpieza"];

const TIPOS_EVENTO = [
  "Trabajo",
  "Revisión vehículo",
  "Revisión herramienta",
  "Vacaciones",
  "Reunión"
];

const PRIORIDADES = ["Alta", "Media", "Baja"];

function load() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function getUsuarioActivoAgenda() {
  return USUARIOS[0]; // de momento admin
}

function puedeVerEvento(usuario, evento) {
  if (usuario.rol === "admin") return true;
  if (usuario.rol === "encargado") return true;

  if (usuario.rol === "operario") {
    return evento.asignado === usuario.nombre;
  }

  return false;
}

export function getAgendaContexto() {
  return {
    usuarioActivo: getUsuarioActivoAgenda(),
    usuarios: [...USUARIOS],
    personal: [...PERSONAL],
    vehiculos: [...VEHICULOS],
    herramientas: [...HERRAMIENTAS],
    tipos: [...TIPOS_EVENTO],
    prioridades: [...PRIORIDADES],
  };
}

export function getEventos() {
  const usuario = getUsuarioActivoAgenda();
  return load().filter(e => puedeVerEvento(usuario, e));
}

export function addEvento(evento) {
  const data = load();

  data.push({
    id: Date.now(),
    texto: evento.texto,
    fecha: evento.fecha,
    hora: evento.hora,
    tipo: evento.tipo,
    prioridad: evento.prioridad,
    asignado: evento.asignado,
    objeto: evento.objeto || "",
    done: false
  });

  save(data);
}

export function toggleEvento(id) {
  const data = load();
  const item = data.find(e => e.id === id);
  if (item) item.done = !item.done;
  save(data);
}

export function deleteEvento(id) {
  save(load().filter(e => e.id !== id));
}
