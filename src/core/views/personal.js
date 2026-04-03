import {
  getPersonal,
  addTrabajador,
  deleteTrabajador,
  getDireccionTexto
} from "../data/personal.js";

export function renderPersonal() {
  const lista = getPersonal();

  setTimeout(() => {
    document.getElementById("btnCrear")?.addEventListener("click", crearTrabajador);

    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.onclick = () => {
        deleteTrabajador(btn.dataset.id);
        refrescar();
      };
    });
  }, 0);

  return `
    <div class="panel-card">
      <h3>Personal</h3>
      <p>Gestión completa de trabajadores</p>

      ${formulario()}

      <div style="margin-top:20px; display:grid; gap:14px;">
        ${lista.map(renderTrabajador).join("")}
      </div>
    </div>
  `;
}

function formulario() {
  return `
    <div style="display:grid; gap:10px; margin-top:10px;">
      <input id="nombre" placeholder="Nombre completo" style="${input()}" />
      <input id="usuario" placeholder="Usuario" style="${input()}" />
      <input id="password" placeholder="Contraseña" style="${input()}" />

      <input id="telefono" placeholder="Teléfono" style="${input()}" />
      <input id="email" placeholder="Email" style="${input()}" />

      <input id="tipoVia" placeholder="Tipo vía (Calle, Av...)" style="${input()}" />
      <input id="via" placeholder="Nombre vía" style="${input()}" />
      <input id="numero" placeholder="Número" style="${input()}" />
      <input id="cp" placeholder="Código postal" style="${input()}" />
      <input id="poblacion" placeholder="Población" style="${input()}" />
      <input id="provincia" placeholder="Provincia" style="${input()}" />

      <input id="dni" placeholder="DNI" style="${input()}" />
      <input id="nss" placeholder="Seguridad Social" style="${input()}" />

      <button id="btnCrear" style="${btn()}">+ Crear trabajador</button>
    </div>
  `;
}

function renderTrabajador(t) {
  const direccion = getDireccionTexto(t.direccion);

  return `
    <div style="padding:14px; border:1px solid #ddd; border-radius:12px; background:#fff;">
      
      <div style="display:flex; justify-content:space-between;">
        <strong>${t.nombre}</strong>
        <button class="btn-delete" data-id="${t.id}" style="${btnDelete()}">X</button>
      </div>

      <div style="font-size:13px; color:#666;">Usuario: ${t.usuario}</div>

      <div style="margin-top:8px;">
        ${t.telefono ? `
          <a href="tel:${t.telefono}" style="${link()}">📞 ${t.telefono}</a>
          <a href="https://wa.me/${t.telefono}" target="_blank" style="${miniBtn("#25D366")}">WhatsApp</a>
        ` : ""}
      </div>

      <div>
        ${t.email ? `<a href="mailto:${t.email}" style="${link()}">✉ ${t.email}</a>` : ""}
      </div>

      <div style="margin-top:6px;">
        ${direccion ? `
          📍 ${direccion}
          <div style="margin-top:6px;">
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}" target="_blank" style="${miniBtn("#16a34a")}">Google</a>
            <a href="https://waze.com/ul?q=${encodeURIComponent(direccion)}" target="_blank" style="${miniBtn("#0ea5e9")}">Waze</a>
          </div>
        ` : ""}
      </div>

      <div style="font-size:12px; margin-top:6px;">
        DNI: ${t.dni || "-"} | NSS: ${t.nss || "-"}
      </div>

    </div>
  `;
}

function crearTrabajador() {
  const data = {
    nombre: val("nombre"),
    usuario: val("usuario"),
    password: val("password"),
    telefono: val("telefono"),
    email: val("email"),
    direccion: {
      tipoVia: val("tipoVia"),
      via: val("via"),
      numero: val("numero"),
      cp: val("cp"),
      poblacion: val("poblacion"),
      provincia: val("provincia")
    },
    dni: val("dni"),
    nss: val("nss")
  };

  if (!data.nombre) return;

  addTrabajador(data);
  refrescar();
}

function val(id) {
  return document.getElementById(id)?.value.trim() || "";
}

function refrescar() {
  document.getElementById("viewContainer").innerHTML = renderPersonal();
}

function input() {
  return "padding:10px;border:1px solid #ccc;border-radius:10px;";
}

function btn() {
  return "padding:12px;background:#2563eb;color:#fff;border:none;border-radius:10px;";
}

function btnDelete() {
  return "background:red;color:#fff;border:none;padding:6px;border-radius:6px;";
}

function miniBtn(color) {
  return `padding:4px 8px;background:${color};color:#fff;border-radius:6px;margin-left:6px;text-decoration:none;`;
}

function link() {
  return "color:#2563eb;display:inline-block;margin-right:10px;";
}
