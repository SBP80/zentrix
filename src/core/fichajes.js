<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Fichajes</title>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<style>
body {
  font-family: Arial;
  background: #f3f4f6;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.card {
  background: white;
  padding: 20px;
  border-radius: 15px;
  width: 300px;
  text-align: center;
}
button {
  width: 100%;
  padding: 15px;
  margin-top: 10px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
}
.entrada { background: green; color: white; }
.salida { background: red; color: white; }
.volver { background: gray; color: white; }
</style>

</head>
<body>

<div class="card">
  <h2>Fichajes</h2>
  <p id="usuario"></p>

  <button class="entrada" onclick="fichar('entrada')">Entrada</button>
  <button class="salida" onclick="fichar('salida')">Salida</button>
  <button class="volver" onclick="window.location.href='index.html'">Volver</button>

  <p id="estado"></p>
</div>

<script>

// 🔴 AQUÍ YA ESTÁ TODO RELLENO
const SUPABASE_URL = "https://fxxfgbxnqhtlrwiyyafu.supabase.co";
const SUPABASE_KEY = "sb_publishable_1RbCV4I_yhpFwZl4wK7e2Q_a6FSyoxC";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 👇 Usuario desde login
const user = JSON.parse(localStorage.getItem("usuario"));

if (!user) {
  alert("No hay sesión");
  window.location.href = "index.html";
}

document.getElementById("usuario").innerText = "Usuario: " + user.nombre;

// 🚀 FUNCIÓN FICHAR
async function fichar(tipo) {

  document.getElementById("estado").innerText = "Guardando...";

  const { error } = await supabase
    .from("fichajes")
    .insert([
      {
        usuario_id: user.id,
        tipo: tipo,
        fecha: new Date().toISOString()
      }
    ]);

  if (error) {
    document.getElementById("estado").innerText = "Error: " + error.message;
    console.error(error);
  } else {
    document.getElementById("estado").innerText = "Fichaje guardado ✔";
  }
}

</script>

</body>
</html>