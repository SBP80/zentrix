import { supabase } from "../config/supabase.js";

export function initLogin() {
  const form = document.getElementById("loginForm");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supabase
      .from("personal")
      .select("*")
      .eq("usuario", usuario)
      .eq("password", password)
      .eq("activo", true)
      .single();

    if (error || !data) {
      alert("Usuario o contraseña incorrectos");
      return;
    }

    localStorage.setItem("usuario", JSON.stringify(data));

    window.location.href = "index.html";
  });
}
