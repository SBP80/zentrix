const KEY = "zentryx_agenda_v3";

const USUARIOS = [
  { id: 1, nombre: "Administrador", rol: "admin" },
  { id: 2, nombre: "Encargado", rol: "encargado" },
  { id: 3, nombre: "Operario 1", rol: "operario" },
];

const PERSONAL = ["Operario 1", "Encargado"];
const TIPOS_EVENTO = ["Trabajo", "Revisión", "Vacaciones", "Reunión"];
const PRIORIDADES = ["Alta", "Media", "Baja"];

function load() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function getUsuarioActivoAgenda() {
  return USUARIOS[0];
}

function puedeVerEvento(usuario, evento) {
  if (usuario.rol === "admin") return true;
  if (usuario.rol === "encargado") return true;
  return evento.asignado === usuario.nombre;
}

export function getAgendaContexto() {
  return {
    usuarioActivo: getUsuarioActivoAgenda(),
    personal: [...PERSONAL],
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
    ...evento,
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
