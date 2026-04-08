import { db } from "../db.js";

export function renderPersonal() {
  const trabajadores = db.personal.getAll();

  setTimeout(() => activarEventos(), 0);

  return `
    <div style="max-width:100%;width:100%;">
      
      <div style="
        border:1px solid #e2e8f0;
        border-radius:16px;
        background:#ffffff;
        padding:16px;
      ">

        <h2 style="margin:0 0 6px 0;">Personal</h2>
        <p style="margin:0 0 16px 0;color:#64748b;">
          Gestión de trabajadores.
        </p>

        <!-- FORMULARIO -->
        <div style="
          display:flex;
          flex-direction:column;
          gap:10px;
          margin-bottom:18px;
          padding:12px;
          border:1px solid #e2e8f0;
          border-radius:12px;
          background:#f8fafc;
        ">

          <input id="p_nombre" placeholder="Nombre completo" style="${input()}">
          <input id="p_usuario" placeholder="Usuario" style="${input()}">
          <input id="p_puesto" placeholder="Puesto" style="${input()}">
          <input id="p_telefono" placeholder="Teléfono" style="${input()}">
          <input id="p_email" placeholder="Email" style="${input()}">

          <button id="btnCrearTrabajador" style="${btn()}">
            + Crear trabajador
          </button>

        </div>

        <!-- LISTA -->
        <div style="display:grid;gap:10px;">
          ${
            trabajadores.length
              ? trabajadores.map(t => tarjeta(t)).join("")
              : `
                <div style="
                  padding:14px;
                  border:1px dashed #cbd5e1;
                  border-radius:12px;
                  color:#64748b;
                  background:#f8fafc;
                ">
                  No hay trabajadores
                </div>
              `
          }
        </div>

      </div>
    </div>
  `;
}

/* ================== FUNCIONES ================== */

function activarEventos() {
  const btn = document.getElementById("btnCrearTrabajador");

  if (btn) {
    btn.onclick = crearTrabajador;
  }

  document.querySelectorAll(".btn-borrar").forEach(btn => {
    btn.onclick = () => borrar(btn.dataset.id);
  });
}

function crearTrabajador() {
  const data = {
    nombre: value("p_nombre"),
    usuario: value("p_usuario"),
    puesto: value("p_puesto"),
    telefono: value("p_telefono"),
    email: value("p_email"),
    activo: true
  };

  if (!data.nombre) {
    alert("El nombre es obligatorio");
    return;
  }

  db.personal.create(data);
  refrescar();
}

function borrar(id) {
  const ok = confirm("¿Eliminar trabajador?");
  if (!ok) return;

  db.personal.remove(id);
  refrescar();
}

function refrescar() {
  const cont = document.getElementById("viewContainer");
  if (!cont) return;
  cont.innerHTML = renderPersonal();
}

function value(id) {
  return document.getElementById(id)?.value?.trim() || "";
}

/* ================== UI ================== */

function tarjeta(t) {
  return `
    <div style="
      border:1px solid #e2e8f0;
      border-radius:12px;
      padding:12px;
      background:#fff;
    ">
      <div style="font-weight:800;">${t.nombre || "Sin nombre"}</div>

      <div style="font-size:13px;color:#64748b;margin-top:4px;">
        ${t.usuario || "-"} · ${t.puesto || "-"}
      </div>

      <div style="font-size:13px;color:#64748b;margin-top:4px;">
        ${t.telefono || ""} ${t.email ? "· " + t.email : ""}
      </div>

      <button 
        class="btn-borrar"
        data-id="${t.id}"
        style="
          margin-top:10px;
          width:100%;
          padding:10px;
          border:none;
          border-radius:10px;
          background:#dc2626;
          color:#fff;
          font-weight:700;
        "
      >
        Eliminar
      </button>
    </div>
  `;
}

function input() {
  return `
    width:100%;
    padding:10px;
    border:1px solid #cbd5e1;
    border-radius:10px;
  `;
}

function btn() {
  return `
    padding:12px;
    border:none;
    border-radius:12px;
    background:#2563eb;
    color:#fff;
    font-weight:700;
  `;
}