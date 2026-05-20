// Catálogos globales para la traducción en el Frontend
let listaJugadoresGlobal = [];
let listaPartidosGlobal = [];

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
    listaJugadoresGlobal = await fetch('http://localhost:8080/busquedaJugadores').then(r => r.json());
    listaPartidosGlobal = await fetch('http://localhost:8080/busquedaPartidos').then(r => r.json());
    buscarRelaciones();
  } catch(e) {
    console.error("Error cargando catálogos secundarios", e);
    showToast('Error al cargar catálogos de jugadores/partidos', 'error');
  }
}

async function buscarRelaciones() {
  const nombreFiltro = document.getElementById('busJugador').value.trim().toLowerCase();
  const rivalFiltro = document.getElementById('busPartido').value.trim().toLowerCase();
  
  let idJugadorParam = null;
  let idPartidoParam = null;

  if (nombreFiltro) {
    const enc = listaJugadoresGlobal.find(j => j.nombre.toLowerCase().includes(nombreFiltro));
    idJugadorParam = enc ? enc.id_jugador : -1;
  }
  
  if (rivalFiltro) {
    const enc = listaPartidosGlobal.find(p => p.rival.toLowerCase().includes(rivalFiltro));
    idPartidoParam = enc ? enc.id_partido : -1;
  }

  let url = 'http://localhost:8080/busquedaJugadorPartido';
  const params = [];
  if (idJugadorParam !== null) params.push(`JUGADOR_id_jugador=${idJugadorParam}`);
  if (idPartidoParam !== null) params.push(`PARTIDO_id_partido=${idPartidoParam}`);
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
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="icon">⚽</div><p>No se encontraron relaciones registradas</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = relaciones.map(rel => {
    // CORRECCIÓN AQUÍ: Se usan las propiedades en MAYÚSCULAS tal y como vienen del JSON
    const idJugador = rel.JUGADOR_id_jugador;
    const idPartido = rel.PARTIDO_id_partido;

    const jugadorObj = listaJugadoresGlobal.find(j => j.id_jugador === idJugador) || {};
    const partidoObj = listaPartidosGlobal.find(p => p.id_partido === idPartido) || {};

    return `
      <tr>
        <td>${idJugador}</td>
        <td>${jugadorObj.nombre || 'Desconocido'}</td>
        <td>${idPartido}</td>
        <td>${partidoObj.rival || 'Desconocido'}</td>
        <td>
          <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" 
                  onclick="eliminarRelacion(${idJugador}, ${idPartido})">
            Eliminar
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function abrirModalCrear() {
  document.getElementById('cJugador').value = '';
  document.getElementById('cPartido').value = '';
  document.getElementById('modalCrear').classList.add('open');
}

async function crearRelacion() {
  const j = document.getElementById('cJugador').value.trim();
  const p = document.getElementById('cPartido').value.trim();
  if (!j || !p) { showToast('Rellena los campos obligatorios', 'error'); return; }
  try {
    const resp = await fetch(`http://localhost:8080/crearJugadorPartido?JUGADOR_id_jugador=${j}&PARTIDO_id_partido=${p}`);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Relación creada correctamente', 'success');
    cerrarModales();
    buscarRelaciones();
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function eliminarRelacion(j, p) {
  if (!confirm(`¿Eliminar la relación Jugador ${j} — Partido ${p}?`)) return;
  try {
    const resp = await fetch(`http://localhost:8080/eliminarJugadorPartido?JUGADOR_id_jugador=${j}&PARTIDO_id_partido=${p}`);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Relación eliminada', 'success');
    buscarRelaciones();
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

function limpiarFiltros() {
  document.getElementById('busJugador').value = '';
  document.getElementById('busPartido').value = '';
  buscarRelaciones();
}

function cerrarModales() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) cerrarModales();
});