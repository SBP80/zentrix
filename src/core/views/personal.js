import { getPersonal, addTrabajador, deleteTrabajador } from "../data/personal.js";

export function renderPersonal() {
    const lista = getPersonal();

    setTimeout(() => {
        const btn = document.getElementById("btnCrearTrabajador");
        if (btn) {
            btn.onclick = crearTrabajadorUI;
        }

        document.querySelectorAll(".btn-borrar-trabajador").forEach((item) => {
            item.onclick = () => {
                const id = Number(item.dataset.id);
                deleteTrabajador(id);
                refrescarPersonal();
            };
        });
    }, 0);

    return `
        <div class="panel-card">
            <h3>Personal</h3>
            <p>Fichas de trabajadores de la empresa.</p>

            <div style="
                display:grid;
                grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
                gap:10px;
                margin:18px 0;
            ">
                <input id="trabajadorNombre" placeholder="Nombre y apellidos" style="${inputStyle()}" />
                <input id="trabajadorTelefono" placeholder="Teléfono" style="${inputStyle()}" />
                <input id="trabajadorEmail" placeholder="Email" style="${inputStyle()}" />
                <input id="trabajadorDireccion" placeholder="Dirección" style="${inputStyle()}" />
                <input id="trabajadorSS" placeholder="Nº Seguridad Social" style="${inputStyle()}" />

                <select id="trabajadorRol" style="${inputStyle()}">
                    <option value="admin">Administrador</option>
                    <option value="encargado">Encargado</option>
                    <option value="operario">Operario</option>
                </select>
            </div>

            <button id="btnCrearTrabajador" type="button" style="${mainBtnStyle()}">
                + Crear trabajador
            </button>

            <div style="margin-top:20px; display:grid; gap:14px;">
                ${
                    lista.length
                        ? lista.map(renderTrabajadorCard).join("")
                        : `
                            <div style="
                                padding:14px;
                                border:1px dashed #cbd5e1;
                                border-radius:12px;
                                color:#64748b;
                                background:#f8fafc;
                            ">
                                No hay trabajadores todavía.
                            </div>
                        `
                }
            </div>
        </div>
    `;
}

function renderTrabajadorCard(trabajador) {
    return `
        <div style="
            padding:14px;
            border:1px solid #d8e1eb;
            border-radius:14px;
            background:#fff;
            box-shadow:0 4px 12px rgba(15,23,42,0.06);
        ">
            <div style="
                display:flex;
                justify-content:space-between;
                gap:12px;
                align-items:flex-start;
            ">
                <div style="flex:1; min-width:0;">
                    <div style="font-size:18px; font-weight:700; color:#0f172a;">
                        ${escapeHtml(trabajador.nombre || "-")}
                    </div>

                    <div style="margin-top:6px; font-size:14px; color:#64748b;">
                        Rol: ${escapeHtml(trabajador.rol || "-")}
                    </div>

                    <div style="margin-top:10px; display:grid; gap:6px; font-size:14px; color:#334155;">
                        ${trabajador.telefono ? `
                            <a href="tel:${encodeURIComponent(trabajador.telefono)}" style="${linkStyle()}">
                                📞 ${escapeHtml(trabajador.telefono)}
                            </a>
                        ` : ""}

                        ${trabajador.email ? `
                            <a href="mailto:${encodeURIComponent(trabajador.email)}" style="${linkStyle()}">
                                ✉ ${escapeHtml(trabajador.email)}
                            </a>
                        ` : ""}

                        ${trabajador.direccion ? `
                            <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
                                <span style="color:#334155;">📍 ${escapeHtml(trabajador.direccion)}</span>
                                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trabajador.direccion)}" target="_blank" rel="noreferrer" style="${miniBtnStyle("#16a34a")}">Google Maps</a>
                                <a href="https://waze.com/ul?q=${encodeURIComponent(trabajador.direccion)}&navigate=yes" target="_blank" rel="noreferrer" style="${miniBtnStyle("#0ea5e9")}">Waze</a>
                            </div>
                        ` : ""}

                        ${trabajador.seguridadSocial ? `
                            <div>Nº Seguridad Social: ${escapeHtml(trabajador.seguridadSocial)}</div>
                        ` : ""}
                    </div>
                </div>

                <button
                    type="button"
                    class="btn-borrar-trabajador"
                    data-id="${trabajador.id}"
                    style="${deleteBtnStyle()}"
                >
                    ✕
                </button>
            </div>
        </div>
    `;
}

function crearTrabajadorUI() {
    const nombre = document.getElementById("trabajadorNombre")?.value.trim() || "";
    const telefono = document.getElementById("trabajadorTelefono")?.value.trim() || "";
    const email = document.getElementById("trabajadorEmail")?.value.trim() || "";
    const direccion = document.getElementById("trabajadorDireccion")?.value.trim() || "";
    const seguridadSocial = document.getElementById("trabajadorSS")?.value.trim() || "";
    const rol = document.getElementById("trabajadorRol")?.value || "operario";

    if (!nombre) return;

    addTrabajador({
        nombre,
        telefono,
        email,
        direccion,
        seguridadSocial,
        rol,
        permisos: []
    });

    refrescarPersonal();
}

function refrescarPersonal() {
    const container = document.getElementById("viewContainer");
    if (!container) return;
    container.innerHTML = renderPersonal();
}

function inputStyle() {
    return `
        width:100%;
        height:46px;
        padding:0 12px;
        border:1px solid #cbd5e1;
        border-radius:12px;
        background:#fff;
        color:#0f172a;
        font-size:15px;
    `;
}

function mainBtnStyle() {
    return `
        min-height:46px;
        padding:0 18px;
        border:none;
        border-radius:12px;
        background:#2563eb;
        color:#fff;
        font-size:15px;
        font-weight:700;
        cursor:pointer;
    `;
}

function deleteBtnStyle() {
    return `
        width:42px;
        height:42px;
        border:none;
        border-radius:12px;
        background:#dc2626;
        color:#fff;
        font-size:18px;
        font-weight:700;
        cursor:pointer;
        flex:0 0 auto;
    `;
}

function miniBtnStyle(color) {
    return `
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-height:30px;
        padding:0 10px;
        border-radius:10px;
        background:${color};
        color:#fff;
        font-size:12px;
        font-weight:700;
        text-decoration:none;
    `;
}

function linkStyle() {
    return `
        color:#2563eb;
        text-decoration:none;
        font-weight:700;
    `;
}

function escapeHtml(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
