import { db } from "./db.js";

const SESSION_KEY = "zentrix_session_user_v1";

export function getSessionUserId() {
  return localStorage.getItem(SESSION_KEY) || "";
}

export function setSessionUserId(userId) {
  localStorage.setItem(SESSION_KEY, String(userId || ""));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
  const id = getSessionUserId();
  if (!id) return null;

  const users = db.personal.getAll();
  return users.find((u) => String(u.id) === String(id)) || null;
}

export function loginWithCredentials(usuario, password) {
  const userTxt = String(usuario || "").trim().toLowerCase();
  const passTxt = String(password || "").trim();

  if (!userTxt || !passTxt) {
    return {
      ok: false,
      mensaje: "Introduce usuario y contraseña"
    };
  }

  const users = db.personal.getAll();

  const user = users.find((u) => {
    const usuarioDb = String(u.usuario || "").trim().toLowerCase();
    const nombreDb = String(u.nombre || "").trim().toLowerCase();
    const passwordDb = String(u.password || "").trim();

    return (
      (usuarioDb === userTxt || nombreDb === userTxt) &&
      passwordDb === passTxt &&
      u.activo !== false
    );
  });

  if (!user) {
    return {
      ok: false,
      mensaje: "Usuario o contraseña incorrectos"
    };
  }

  setSessionUserId(user.id);

  return {
    ok: true,
    user
  };
}

export function canAccessView(user, view) {
  if (!user) return false;

  if (isAdminUser(user)) return true;

  const permisos = user.permisosModulos || {};

  if (view === "inicio") return true;
  if (view === "agenda") return permisos.agenda !== false;
  if (view === "fichajes") return permisos.agenda !== false || permisos.fichajes === true;
  if (view === "personal") return permisos.personal === true;
  if (view === "configuracion") return permisos.configuracion === true;

  return false;
}

export function getAllowedViews(user) {
  const vistas = ["inicio", "agenda", "personal", "fichajes", "configuracion"];
  return vistas.filter((v) => canAccessView(user, v));
}

export function isAdminUser(user) {
  const puesto = String(user?.puesto || "").trim().toLowerCase();
  const usuario = String(user?.usuario || "").trim().toLowerCase();

  return (
    puesto.includes("admin") ||
    puesto.includes("administrador") ||
    usuario === "admin"
  );
}

export function getDisplayName(user) {
  if (!user) return "Usuario";
  return user.nombre || user.usuario || "Usuario";
}