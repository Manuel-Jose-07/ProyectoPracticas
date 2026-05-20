let listaStaffGlobal = [];
let listaEquiposGlobal = [];

(function initSesion() {
  const rol = sessionStorage.getItem('rol');
  if (!rol) { window.location.href = 'login.html'; return; }
  if (rol !== 'admin') { window.location.href = 'equipo.html'; return; }
  document.body.classList.add('is-admin');
  renderNavUser(rol, sessionStorage.getItem('usuario') || '');
})();

function renderNavUser(rol, nombre) {
  const right = document.querySelector('.nav-right');
  if (!right) return;
  right.innerHTML = `<span class="nav-role-badge ${rol}"><span class="dot"></span>${nombre} · Administrador</span>
    <button class="nav-logout" onclick="logout()">
      <svg viewBox="0 0 24 24" style="width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
      </svg>Salir</button>`;
}

function logout() { sessionStorage.clear(); window.location.href = 'login.html'; }

function showToast(msg, type='') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  cargarCatalogosIniciales();
  
  document.querySelectorAll('.modal-close, .btn-outline').forEach(b => {
    b.addEventListener('click', cerrarModales);
  });
});

async function cargarCatalogosIniciales() {
  try {
    listaStaffGlobal = await fetch('http://localhost:8080/busquedaStaffs').then(r => r.json());
    listaEquiposGlobal = await fetch('http://localhost:8080/busquedaEquipos').then(r => r.json());
    
    // Lanzamos la búsqueda inicial una vez cargados los catálogos
    buscarRelaciones();
  } catch(e) {
    console.error("Error cargando catálogos secundarios", e);
    showToast('Error al cargar catálogos de staff/equipos', 'error');
    listaStaffGlobal = [];
    listaEquiposGlobal = [];
  }
}

async function buscarRelaciones() {
  const nombreFiltro = document.getElementById('busStaff').value.trim().toLowerCase();
  const equipoFiltro = document.getElementById('busEquipo').value.trim().toLowerCase();
  
  let idStaffParam = null;
  let idEquipoParam = null;

  // CORRECCIÓN: Usamos 'nombre_staff' que es como te viene del backend según tu consola
  if (nombreFiltro && Array.isArray(listaStaffGlobal)) {
    const enc = listaStaffGlobal.find(s => s && s.nombre_staff && s.nombre_staff.toLowerCase().includes(nombreFiltro));
    idStaffParam = enc ? enc.id_staff : -1;
  }
  
  if (equipoFiltro && Array.isArray(listaEquiposGlobal)) {
    const enc = listaEquiposGlobal.find(e => 
      e && (
        (e.categoria && e.categoria.toLowerCase().includes(equipoFiltro)) || 
        (e.grupo && e.grupo.toLowerCase().includes(equipoFiltro))
      )
    );
    idEquipoParam = enc ? enc.id_equipo : -1;
  }

  let url = 'http://localhost:8080/busquedaStaffEquipo';
  const params = [];
  if (idStaffParam !== null) params.push(`STAFF_id_staff=${idStaffParam}`);
  if (idEquipoParam !== null) params.push(`EQUIPO_id_equipo=${idEquipoParam}`);
  if (params.length > 0) url += '?' + params.join('&');

  const tbody = document.getElementById('tabla');
  tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="icon">⏳</div><p>Cargando...</p></div></td></tr>`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(await resp.text());
    const relaciones = await resp.json();
    renderTabla(relaciones);
  } catch(e) {
    showToast('Error: ' + e.message, 'error');
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="icon">⚠️</div><p>Error al cargar datos</p></div></td></tr>`;
  }
}

function renderTabla(relaciones) {
  const tbody = document.getElementById('tabla');
  if (relaciones.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="icon">🧑‍💼</div><p>No se encontraron relaciones registradas</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = relaciones.map(rel => {
    const idStaff = rel.STAFF_id_staff;
    const idEquipo = rel.EQUIPO_id_equipo;

    // CORRECCIÓN: Aquí también usamos 's.nombre_staff' para pintar correctamente el nombre en la tabla
    const staffObj = listaStaffGlobal.find(s => s.id_staff === idStaff) || {};
    const equipoObj = listaEquiposGlobal.find(e => e.id_equipo === idEquipo) || {};

    const textoEquipo = equipoObj.categoria ? `${equipoObj.categoria} - ${equipoObj.grupo}` : 'Desconocido';

    return `
      <tr>
        <td>${idStaff}</td>
        <td>${staffObj.nombre_staff || 'Desconocido'}</td>
        <td>${idEquipo}</td>
        <td>${textoEquipo}</td>
        <td>
          <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" 
                  onclick="eliminarRelacion(${idStaff}, ${idEquipo})">
            Eliminar
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function abrirModalCrear() {
  document.getElementById('cStaff').value = '';
  document.getElementById('cEquipo').value = '';
  document.getElementById('modalCrear').classList.add('open');
}

async function crearRelacion() {
  const s = document.getElementById('cStaff').value.trim();
  const eq = document.getElementById('cEquipo').value.trim();
  if (!s || !eq) { showToast('Rellena los campos obligatorios', 'error'); return; }
  try {
    const resp = await fetch(`http://localhost:8080/crearStaffEquipo?STAFF_id_staff=${s}&EQUIPO_id_equipo=${eq}`);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Relación creada correctamente', 'success');
    cerrarModales();
    buscarRelaciones();
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function eliminarRelacion(s, eq) {
  if (!confirm(`¿Eliminar la relación Staff ${s} — Equipo ${eq}?`)) return;
  try {
    const resp = await fetch(`http://localhost:8080/eliminarStaffEquipo?STAFF_id_staff=${s}&EQUIPO_id_equipo=${eq}`);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Relación eliminada', 'success');
    buscarRelaciones();
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

function limpiarFiltros() {
  document.getElementById('busStaff').value = '';
  document.getElementById('busEquipo').value = '';
  buscarRelaciones();
}

function cerrarModales() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) cerrarModales();
});