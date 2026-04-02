export function renderAgenda() {
  return `
    <div class="panel-card">
      <h3>Agenda</h3>
      <p>Gestión de tareas y trabajos.</p>

      <div style="margin-top:15px;">
        <button onclick="alert('Nueva tarea (próximamente)')">
          + Nueva tarea
        </button>
      </div>

      <div style="margin-top:20px;">
        <ul>
          <li>📌 Instalación aerotermia - Cliente Juan</li>
          <li>📌 Mantenimiento suelo radiante - Cliente María</li>
        </ul>
      </div>
    </div>
  `;
}
