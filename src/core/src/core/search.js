import { db } from "./db.js";
import { getEventos } from "./agenda.js";

export function buscarGlobal(texto) {
  const q = normalizar(texto);
  if (!q) return [];

  const resultados = [];

  db.personal.getAll().forEach((p) => {
    const bolsa = [
      p.nombre,
      p.usuario,
      p.puesto,
      p.email,
      p.telefono
    ]
      .filter(Boolean)
      .join(" ");

    if (normalizar(bolsa).includes(q)) {
      resultados.push({
        tipo: "personal",
        titulo: p.nombre || p.usuario || "Trabajador",
        subtitulo: `${p.puesto || ""}${p.telefono ? " · " + p.telefono : ""}`,
        id: p.id || ""
      });
    }
  });

  getEventos().forEach((e) => {
    const bolsa = [
      e.titulo,
      e.usuario,
      e.tipo,
      e.extra,
      e.fecha,
      e.hora
    ]
      .filter(Boolean)
      .join(" ");

    if (normalizar(bolsa).includes(q)) {
      resultados.push({
        tipo: "agenda",
        titulo: e.titulo || "Evento",
        subtitulo: `${e.fecha || ""}${e.hora ? " " + e.hora : ""}${e.usuario ? " · " + e.usuario : ""}`,
        id: e.id || ""
      });
    }
  });

  return resultados;
}

function normalizar(txt) {
  return String(txt || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}