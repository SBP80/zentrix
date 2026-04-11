const KEY = "zentrix_fichajes_v1";

export function getFichajes() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addFichaje(data) {
  const lista = getFichajes();

  const nuevo = {
    id: "fic_" + Date.now(),
    trabajador: data.trabajador || "",
    tipo: data.tipo || "entrada", // entrada / salida
    fecha: new Date().toISOString(),
  };

  lista.push(nuevo);
  localStorage.setItem(KEY, JSON.stringify(lista));
}

export function getFichajesPorTrabajador(nombre) {
  return getFichajes().filter(f => f.trabajador === nombre);
}