const KEY = "zentrix_agenda";

export function getTareas() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}

export function saveTareas(tareas) {
  localStorage.setItem(KEY, JSON.stringify(tareas));
}

export function addTarea(texto) {
  const tareas = getTareas();
  tareas.push({
    id: Date.now(),
    texto,
    done: false
  });
  saveTareas(tareas);
}

export function toggleTarea(id) {
  const tareas = getTareas().map(t =>
    t.id === id ? { ...t, done: !t.done } : t
  );
  saveTareas(tareas);
}

export function deleteTarea(id) {
  const tareas = getTareas().filter(t => t.id !== id);
  saveTareas(tareas);
}
