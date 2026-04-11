const KEY = "zentrix_fichajes_v1";

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

  const nuevo = {
    id: "fic_" + Date.now(),
    trabajador: String(data.trabajador || "").trim(),
    tipo: data.tipo === "salida" ? "salida" : "entrada",
    fecha: new Date().toISOString()
  };

  lista.push(nuevo);
  localStorage.setItem(KEY, JSON.stringify(lista));
  return nuevo;
}

export function getFichajesPorTrabajador(nombre) {
  return getFichajes().filter((f) => String(f.trabajador || "") === String(nombre || ""));
}

export function deleteFichaje(id) {
  const lista = getFichajes().filter((f) => String(f.id) !== String(id));
  localStorage.setItem(KEY, JSON.stringify(lista));
}