const PERSONAL_KEY = "zentrix_personal_v2";

const PERSONAL_DEMO = [
  {
    id: "p_1",
    nombre: "Sergio Barro Parejo",
    usuario: "sergio",
    password: "1234",
    activo: true,
    puesto: "Administrador",
    telefono: "648681134",
    email: "barritos25@hotmail.com",
    direccion: {
      tipoVia: "Calle",
      via: "Nueva",
      numero: "23",
      portal: "",
      piso: "",
      puerta: "",
      cp: "28805",
      poblacion: "Pozuelo del Rey",
      provincia: "Madrid"
    },
    dni: "12345678A",
    nss: "78495663743859968974836",
    fechaAlta: "2026-01-10",
    vacaciones: {
      disponibles: 30,
      usadas: 4
    },
    moscosos: {
      disponibles: 2,
      usados: 0
    },
    permisosModulos: {
      inicio: true,
      agenda: true,
      personal: true,
      configuracion: true,
      vehiculos: true,
      herramientas: true,
      clientes: true,
      obras: true
    },
    permisosAcciones: {
      verTodo: true,
      crear: true,
      editar: true,
      borrar: true,
      aprobar: true
    },
    documentos: [
      { id: "d1", nombre: "Contrato", fecha: "2026-01-10", tipo: "laboral" },
      { id: "d2", nombre: "PRL", fecha: "2026-01-15", tipo: "formacion" },
      { id: "d3", nombre: "Carnet conducir", fecha: "2026-01-20", tipo: "carnet" }
    ],
    notas: "Acceso total."
  }
];

function ensurePersonal() {
  try {
    const actual = JSON.parse(localStorage.getItem(PERSONAL_KEY) || "[]");
    if (Array.isArray(actual) && actual.length) return actual;
  } catch (error) {
    // nada
  }

  localStorage.setItem(PERSONAL_KEY, JSON.stringify(PERSONAL_DEMO));
  return PERSONAL_DEMO;
}

export function getPersonal() {
  ensurePersonal();

  try {
    const data = JSON.parse(localStorage.getItem(PERSONAL_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

export function getTrabajadorById(id) {
  const idTxt = String(id);
  return getPersonal().find((item) => String(item.id) === idTxt) || null;
}

export function savePersonal(lista) {
  localStorage.setItem(PERSONAL_KEY, JSON.stringify(lista));
}

export function addTrabajador(trabajador) {
  const lista = getPersonal();

  lista.push({
    id: "p_" + Date.now(),
    nombre: String(trabajador.nombre || "").trim(),
    usuario: String(trabajador.usuario || "").trim(),
    password: String(trabajador.password || "").trim(),
    activo: trabajador.activo !== false,
    puesto: String(trabajador.puesto || "").trim(),
    telefono: String(trabajador.telefono || "").trim(),
    email: String(trabajador.email || "").trim(),
    direccion: {
      tipoVia: String(trabajador.direccion?.tipoVia || "").trim(),
      via: String(trabajador.direccion?.via || "").trim(),
      numero: String(trabajador.direccion?.numero || "").trim(),
      portal: String(trabajador.direccion?.portal || "").trim(),
      piso: String(trabajador.direccion?.piso || "").trim(),
      puerta: String(trabajador.direccion?.puerta || "").trim(),
      cp: String(trabajador.direccion?.cp || "").trim(),
      poblacion: String(trabajador.direccion?.poblacion || "").trim(),
      provincia: String(trabajador.direccion?.provincia || "").trim()
    },
    dni: String(trabajador.dni || "").trim(),
    nss: String(trabajador.nss || "").trim(),
    fechaAlta: trabajador.fechaAlta || "",
    vacaciones: trabajador.vacaciones || { disponibles: 30, usadas: 0 },
    moscosos: trabajador.moscosos || { disponibles: 2, usados: 0 },
    permisosModulos: trabajador.permisosModulos || {
      inicio: true,
      agenda: true,
      personal: false,
      configuracion: false,
      vehiculos: false,
      herramientas: false,
      clientes: false,
      obras: false
    },
    permisosAcciones: trabajador.permisosAcciones || {
      verTodo: false,
      crear: false,
      editar: false,
      borrar: false,
      aprobar: false
    },
    documentos: Array.isArray(trabajador.documentos) ? trabajador.documentos : [],
    notas: String(trabajador.notas || "").trim()
  });

  savePersonal(lista);
}

export function updateTrabajador(id, cambios) {
  const idTxt = String(id);

  const lista = getPersonal().map((item) => {
    if (String(item.id) !== idTxt) return item;
    return { ...item, ...cambios };
  });

  savePersonal(lista);
}

export function deleteTrabajador(id) {
  const idTxt = String(id);
  const lista = getPersonal().filter((item) => String(item.id) !== idTxt);
  savePersonal(lista);
}

export function getDireccionTexto(direccion) {
  if (!direccion) return "";

  return [
    [direccion.tipoVia, direccion.via].filter(Boolean).join(" "),
    direccion.numero ? "Nº " + direccion.numero : "",
    direccion.portal ? "Portal " + direccion.portal : "",
    direccion.piso ? "Piso " + direccion.piso : "",
    direccion.puerta ? "Puerta " + direccion.puerta : "",
    direccion.cp,
    direccion.poblacion,
    direccion.provincia
  ]
    .filter(Boolean)
    .join(", ");
}
