const SESSION_KEY = "zentryx_session_v1";

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;

    if (!data.user || typeof data.user !== "object") return null;

    return data;
  } catch {
    return null;
  }
}

export function setSession(sessionData) {
  if (!sessionData || typeof sessionData !== "object") {
    throw new Error("Sesión no válida");
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn() {
  return !!getSession();
}

export function getCurrentUser() {
  const session = getSession();
  return session?.user || null;
}

export function hasRole(role) {
  const user = getCurrentUser();
  return String(user?.rol || "").toLowerCase() === String(role || "").toLowerCase();
}