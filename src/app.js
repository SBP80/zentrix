const app = document.getElementById("app");

app.innerHTML = `
  <div class="login-page">
    <div class="login-card">
      <div class="brand-block">
        <div class="brand-mark">Z</div>
        <div class="brand-text">
          <h1>Zentryx</h1>
          <p>Sistema modular de gestión</p>
        </div>
      </div>

      <div class="login-form">
        <h2>Acceso</h2>

        <label for="email">Correo</label>
        <input id="email" type="email" placeholder="correo@empresa.com" />

        <label for="password">Contraseña</label>
        <input id="password" type="password" placeholder="••••••••" />

        <button id="loginBtn" class="primary-btn">Entrar</button>

        <div id="loginMessage" class="login-message"></div>
      </div>
    </div>
  </div>
`;

const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");

loginBtn.addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    loginMessage.textContent = "Introduce correo y contraseña.";
    loginMessage.className = "login-message error";
    return;
  }

  loginMessage.textContent = "Pantalla base de acceso lista.";
  loginMessage.className = "login-message success";
});