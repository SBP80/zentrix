import { db } from "../db.js";
import { getDireccionTexto } from "../data/personal.js";

export function renderPersonal() {
  const trabajadores = db.personal.getAll();

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
          Equipo, roles y permisos.
        </p>

        <!-- RESUMEN -->
        <div style="
          display:grid;
          grid-template-columns:1fr;
          gap:10px;
          margin-bottom:16px;
        ">
          ${card("Total", trabajadores.length)}
          ${card("Activos", trabajadores.filter(t => t.activo !== false).length)}
          ${card("Inactivos", trabajadores.filter(t => t.activo === false).length)}
        </div>

        <!-- FILTROS (ARREGLADO MOBILE) -->
        <div style="
          display:flex;
          flex-direction:column;
          gap:10px;
          margin-bottom:16px;
        ">

          <input 
            placeholder="Buscar trabajador"
            style="
              width:100%;
              padding:10px;
              border:1px solid #cbd5e1;
              border-radius:10px;
            "
          >

          <select style="
            width:100%;
            padding:10px;
            border:1px solid #cbd5e1;
            border-radius:10px;
          ">
            <option>Todos</option>
            <option>Activos</option>
            <option>Inactivos</option>
          </select>

          <select style="
            width:100%;
            padding:10px;
            border:1px solid #cbd5e1;
            border-radius:10px;
          ">
            <option>Nombre A-Z</option>
            <option>Nombre Z-A</option>
          </select>

          <button style="
            padding:10px;
            border:none;
            border-radius:10px;
            background:#64748b;
            color:#fff;
            font-weight:700;
          ">
            Limpiar
          </button>

        </div>

        <!-- LISTA -->
        <div style="display:grid;gap:10px;">
          ${
            trabajadores.length
              ? trabajadores.map(t => renderTrabajador(t)).join("")
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

function renderTrabajador(t) {
  return `
    <div style="
      border:1px solid #e2e8f0;
      border-radius:12px;
      padding:12px;
      background:#fff;
    ">
      <div style="font-weight:800;">${t.nombre || "Sin nombre"}</div>
      <div style="font-size:13px;color:#64748b;">
        ${t.usuario || "-"} · ${t.puesto || "-"}
      </div>
    </div>
  `;
}

function card(titulo, valor) {
  return `
    <div style="
      padding:14px;
      border:1px solid #e2e8f0;
      border-radius:12px;
      background:#f8fafc;
    ">
      <div style="font-size:12px;color:#64748b;">${titulo}</div>
      <div style="font-size:28px;font-weight:800;">${valor}</div>
    </div>
  `;
}