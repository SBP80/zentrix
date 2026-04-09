import { db } from "./db.js";
import { getEventos } from "./agenda.js";

export function buscarGlobal(texto) {
  const q = normalizar(texto);
  if (!q) return [];

  const resultados = [];

  // PERSONAL
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
        titulo: p.nombre || p.usuario,
        subtitulo: `${p.puesto || ""} · ${p.telefono || ""}`,
        id: p.id
      });
    }
  });

  // AGENDA
  getEventos().forEach((e) => {
    const bolsa = [
      e.titulo,
      e.usuario,
      e.tipo,
      e.extra
    ]
      .filter(Boolean)
      .join(" ");

    if (normalizar(bolsa).includes(q)) {
      resultados.push({
        tipo: "agenda",
        titulo: e.titulo,
        subtitulo: `${e.fecha || ""} ${e.hora || ""} · ${e.usuario || ""}`,
        id: e.id
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