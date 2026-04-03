// Base de datos de trabajadores

const PERSONAL_KEY = "zentryx_personal";

export function getPersonal() {
    return JSON.parse(localStorage.getItem(PERSONAL_KEY)) || [];
}

export function savePersonal(data) {
    localStorage.setItem(PERSONAL_KEY, JSON.stringify(data));
}

// Crear trabajador
export function addTrabajador(trabajador) {
    const lista = getPersonal();
    lista.push({
        id: Date.now(),
        nombre: trabajador.nombre || "",
        telefono: trabajador.telefono || "",
        email: trabajador.email || "",
        direccion: trabajador.direccion || "",
        seguridadSocial: trabajador.seguridadSocial || "",
        rol: trabajador.rol || "operario",
        permisos: trabajador.permisos || [],
        vacaciones: [],
        documentos: [],
        creado: new Date().toISOString()
    });
    savePersonal(lista);
}

// Eliminar trabajador
export function deleteTrabajador(id) {
    const lista = getPersonal().filter(t => t.id !== id);
    savePersonal(lista);
}

// Actualizar trabajador
export function updateTrabajador(id, datos) {
    const lista = getPersonal().map(t => {
        if (t.id === id) {
            return { ...t, ...datos };
        }
        return t;
    });
    savePersonal(lista);
}
