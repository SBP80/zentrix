function renderApp() {
  let content = "";

  if (state.view === "inicio") content = renderInicio();
  if (state.view === "agenda") content = renderAgenda();
  if (state.view === "configuracion") content = renderConfiguracion();
  if (state.view === "personal") content = renderPersonal();

  app.innerHTML = `
    <div style="display:flex;">
      <div style="width:220px;background:#1e293b;color:#fff;min-height:100vh;padding:20px;">
        <div style="margin-bottom:20px;">
          <b>Zentryx</b>
        </div>

        <button onclick="setView('inicio')">Inicio</button><br><br>
        <button onclick="setView('agenda')">Agenda</button><br><br>
        <button onclick="setView('personal')">Personal</button><br><br>
        <button onclick="setView('configuracion')">Configuración</button>
      </div>

      <div style="flex:1;padding:20px;">
        ${content}
      </div>
    </div>
  `;
}
