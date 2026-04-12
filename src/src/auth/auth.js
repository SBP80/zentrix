import { setSession, clearSession } from "./session.js";

const USERS = [
  {
    id: "admin-1",
    usuario: "admin",
    password: "1234",
    nombre: "Administrador",
    rol: "admin"
  },
  {
    id: "sergio-1",
    usuario: "sergio",
    password: "1234",
    nombre: "Sergio",
    rol: "admin"
  }
];

export function login(usuario, password) {
  const user = USERS.find(
    (u) =>
      String(u.usuario).toLowerCase() === String(usuario || "").trim().toLowerCase() &&
      String(u.password) === String(password || "")
  );

  if (!user) {
    throw new Error("Usuario o contraseña incorrectos");
  }

  const sessionData = {
    loggedAt: new Date().toISOString(),
    user: {
      id: user.id,
      usuario: user.usuario,
      nombre: user.nombre,
      rol: user.rol
    }
  };

  setSession(sessionData);
  return sessionData;
}

export function logout() {
  clearSession();
}