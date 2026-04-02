let tareas = JSON.parse(localStorage.getItem("tareas")) || [];

export function renderAgenda() {
  return `
    <div class="card">
      <h2>Agenda</h2>

      <input id="titulo" placeholder="Nueva tarea..." />

      <input id="fecha" type="date" />
      <input id="hora" type="time" />

      <select id="tipo">
        <option value="trabajo">Trabajo</option>
        <option value="herramienta">Revisión herramienta</option>
        <option value="vehiculo">Revisión vehículo</option>
        <option value="vacaciones">Vacaciones</option>
        <option value="reunion">Reunión</option>
        <option value="aviso">Aviso</option>
      </select>

      <select id="prioridad">
        <option value="alta">Alta</option>
        <option value="media">Media</option>
        <option value="baja">Baja</option>
      </select>

      <select id="usuario">
        <option>Operario 1</option>
        <option>Operario 2</option>
        <option>Encargado</option>
      </select>

      <input id="extra" placeholder="Vehículo / herramienta (opcional)" />

      <button onclick="crearTarea()">+ Añadir</button>

      <div id="lista"></div>
    </div>
  `;
}

window.crearTarea = function () {
  const titulo = document.getElementById("titulo").value;
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;
  const tipo = document.getElementById("tipo").value;
  const prioridad = document.getElementById("prioridad").value;
  const usuario = document.getElementById("usuario").value;
  const extra = document.getElementById("extra").value;

  if (!titulo || !fecha) return;

  tareas.push({
    id: Date.now(),
    titulo,
    fecha,
    hora,
    tipo,
    prioridad,
    usuario,
    extra,
    done: false
  });

  guardar();
  pintar();
};

window.toggleTarea = function (id) {
  tareas = tareas.map(t =>
    t.id === id ? { ...t, done: !t.done } : t
  );
  guardar();
  pintar();
};

window.eliminarTarea = function (id) {
  tareas = tareas.filter(t => t.id !== id);
  guardar();
  pintar();
};

function guardar() {
  localStorage.setItem("tareas", JSON.stringify(tareas));
}

function getColorTipo(tipo) {
  switch (tipo) {
    case "trabajo": return "#3b82f6";
    case "herramienta": return "#f59e0b";
    case "vehiculo": return "#8b5cf6";
    case "vacaciones": return "#10b981";
    case "reunion": return "#ec4899";
    case "aviso": return "#ef4444";
    default: return "#999";
  }
}

function pintar() {
  const cont = document.getElementById("lista");
  if (!cont) return;

  cont.innerHTML = tareas.map(t => `
    <div style="
      border-left:6px solid ${getColorTipo(t.tipo)};
      background:#fff;
      margin:10px 0;
      padding:12px;
      border-radius:10px;
      display:flex;
      justify-content:space-between;
      align-items:center;
    ">

      <div>
        <input type="checkbox" ${t.done ? "checked" : ""} onclick="toggleTarea(${t.id})" />

        <strong style="margin-left:8px">${t.titulo}</strong><br>

        <small>${t.fecha} ${t.hora || ""}</small><br>

        <small>
          ${t.usuario} · ${t.tipo} · ${t.prioridad}
          ${t.extra ? " · " + t.extra : ""}
        </small>
      </div>

      <button onclick="eliminarTarea(${t.id})" style="
        background:red;
        color:#fff;
        border:none;
        padding:6px 10px;
        border-radius:6px;
      ">X</button>
    </div>
  `).join("");
}

setTimeout(pintar, 0);
