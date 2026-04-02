const KEY = "zentrix_agenda_eventos_v1";

function loadEventos() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveEventos(eventos) {
  localStorage.setItem(KEY, JSON.stringify(eventos));
}

export function getAgendaContexto() {
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
    usuarios: ["Operario 1", "Operario 2", "Encargado"]
  };
}

export function getEventos() {
  return loadEventos().sort((a, b) => {
    const fa = `${a.fecha || ""} ${a.hora || ""}`;
    const fb = `${b.fecha || ""} ${b.hora || ""}`;
    return fa.localeCompare(fb);
  });
}

export function addEvento(evento) {
  const eventos = loadEventos();

  eventos.push({
    id: Date.now(),
    titulo: String(evento.titulo || "").trim(),
    fecha: evento.fecha || "",
    hora: evento.hora || "",
    tipo: evento.tipo || "Trabajo",
    prioridad: evento.prioridad || "Media",
    usuario: evento.usuario || "Operario 1",
    extra: String(evento.extra || "").trim(),
    done: false
  });

  saveEventos(eventos);
}

export function toggleEvento(id) {
  const eventos = loadEventos().map((evento) => {
    if (evento.id === id) {
      return { ...evento, done: !evento.done };
    }
    return evento;
  });

  saveEventos(eventos);
}

export function deleteEvento(id) {
  const eventos = loadEventos().filter((evento) => evento.id !== id);
  saveEventos(eventos);
}
