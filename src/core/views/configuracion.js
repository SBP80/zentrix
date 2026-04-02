export function renderConfiguracion() {
  const usuarios = getUsuarios();

  setTimeout(() => {
    const btnCrear = document.getElementById("btnCrearUsuario");
    if (btnCrear) {
      btnCrear.onclick = crearUsuario;
    }

    document.querySelectorAll(".btn-eliminar-usuario").forEach((btn) => {
      btn.onclick = () => {
        eliminarUsuario(Number(btn.dataset.id));
      };
    });
  }, 0);

  return `
    <div style="max-width:900px; width:100%;">
      <div class="panel-card">
        <h3 style="margin-top:0;">Configuración</h3>
        <p style="color:#64748b; margin-bottom:20px;">
          Gestión básica de usuarios y roles.
        </p>

        <div style="
          display:grid;
          grid-template-columns:2fr 1fr auto;
          gap:10px;
          margin-bottom:20px;
        ">
          <input
            id="nuevoNombre"
            placeholder="Nombre usuario"
            style="
              height:46px;
              padding:0 12px;
              border:1px solid #cbd5e1;
              border-radius:12px;
            "
          />

          <select
            id="nuevoRol"
            style="
              height:46px;
              padding:0 12px;
              border:1px solid #cbd5e1;
              border-radius:12px;
            "
          >
            <option value="admin">Administrador</option>
            <option value="encargado">Encargado</option>
            <option value="operario">Operario</option>
          </select>

          <button
            id="btnCrearUsuario"
            type="button"
            style="
              height:46px;
              padding:0 16px;
              border:none;
              border-radius:12px;
              background:#2563eb;
              color:#fff;
              font-weight:700;
              cursor:pointer;
            "
          >
            + Crear
          </button>
        </div>

        <div style="display:grid; gap:12px;">
          ${usuarios.map((u) => `
            <div style="
              padding:14px;
              border:1px solid #d8e1eb;
              border-radius:12px;
              background:#fff;
              display:flex;
              justify-content:space-between;
              align-items:center;
              gap:12px;
            ">
              <div>
                <div style="font-weight:700; color:#0f172a;">${escapeHtml(u.nombre)}</div>
                <div style="font-size:14px; color:#64748b;">${escapeHtml(u.rol)}</div>
              </div>

              <button
                type="button"
                class="btn-eliminar-usuario"
                data-id="${u.id}"
                style="
                  width:42px;
                  height:42px;
                  border:none;
                  border-radius:12px;
                  background:#dc2626;
                  color:#fff;
                  font-size:18px;
                  font-weight:700;
                  cursor:pointer;
                "
              >
                ✕
              </button>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function getUsuarios() {
  let usuarios = [];

  try {
    usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
  } catch (error) {
    usuarios = [];
  }

  if (!Array.isArray(usuarios) || !usuarios.length) {
    usuarios = [
      { id: 1, nombre: "Admin", rol: "admin" },
      { id: 2, nombre: "Encargado", rol: "encargado" },
      { id: 3, nombre: "Operario 1", rol: "operario" }
    ];
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }

  return usuarios;
}

function crearUsuario() {
  const nombre = document.getElementById("nuevoNombre")?.value.trim() || "";
  const rol = document.getElementById("nuevoRol")?.value || "operario";

  if (!nombre) return;

  const usuarios = getUsuarios();
  usuarios.push({
    id: Date.now(),
    nombre,
    rol
  });

  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  refrescarConfiguracion();
}

function eliminarUsuario(id) {
  const usuarios = getUsuarios().filter((u) => u.id !== id);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  refrescarConfiguracion();
}

function refrescarConfiguracion() {
  const container = document.getElementById("viewContainer");
  if (!container) return;
  container.innerHTML = renderConfiguracion();
}

function escapeHtml(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}