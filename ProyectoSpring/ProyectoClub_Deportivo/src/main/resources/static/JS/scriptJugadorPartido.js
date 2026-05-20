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
  document.getElementById('toastMsg').textContent = msg;
  t.className = 'toast ' + type; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// Cachés para mostrar nombres
let cacheJugadores = {}, cachePartidos = {};

async function cargarCaches() {
  try {
    const [j, p] = await Promise.all([
      fetch('http://localhost:8080/busquedaJugadores').then(r=>r.json()),
      fetch('http://localhost:8080/busquedaPartidos').then(r=>r.json())
    ]);
    j.forEach(x => cacheJugadores[x.id_jugador] = x.nombre);
    p.forEach(x => cachePartidos[x.id_partido] = x.rival);
  } catch(_) {}
}

async function buscarRelaciones() {
  const j = document.getElementById('busJugador').value.trim();
  const p = document.getElementById('busPartido').value.trim();
  // No hay endpoint de búsqueda: cargamos todos y filtramos
  document.getElementById('tabla').innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="icon">⏳</div><p>Cargando...</p></div></td></tr>`;
  try {
    await cargarCaches();
    // Construir tabla de todas las relaciones vía jugadores/partidos conocidos
    // Como no hay busquedaJugadorPartido, mostramos los datos cruzados disponibles
    const jugadores = await fetch('http://localhost:8080/busquedaJugadores' + (j ? `?nombre=` : '')).then(r=>r.json());
    renderTabla(jugadores, j, p);
  } catch(e) {
    showToast('Error: ' + e.message, 'error');
    document.getElementById('tabla').innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="icon">⚠️</div><p>Error al cargar datos</p></div></td></tr>`;
  }
}

function renderTabla(jugadores, filtroJ, filtroP) {
  // Como no tenemos endpoint de lista de JUGADOR_PARTIDO, mostramos un formulario funcional
  // para crear/eliminar relaciones individualmente
  const tbody = document.getElementById('tabla');
  tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="icon">ℹ️</div>
    <p>Usa el formulario de arriba para añadir relaciones. Para eliminar una relación, introduce los IDs en la búsqueda.</p>
    <div style="margin-top:12px;display:flex;gap:8px;justify-content:center">
      ${filtroJ && filtroP ? `<button class="btn btn-danger" onclick="eliminarRelacion(${filtroJ},${filtroP})">Eliminar relación J:${filtroJ} — P:${filtroP}</button>` : ''}
    </div>
  </div></td></tr>`;
}

function limpiarFiltros() {
  document.getElementById('busJugador').value = '';
  document.getElementById('busPartido').value = '';
  document.getElementById('tabla').innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="icon">⚽</div><p>Pulsa Buscar para cargar las relaciones</p></div></td></tr>`;
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
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function eliminarRelacion(j, p) {
  if (!confirm(`¿Eliminar la relación Jugador ${j} — Partido ${p}?`)) return;
  try {
    const resp = await fetch(`http://localhost:8080/eliminarJugadorPartido?JUGADOR_id_jugador=${j}&PARTIDO_id_partido=${p}`);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Relación eliminada', 'success');
    limpiarFiltros();
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

function cerrarModales() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) cerrarModales();
  if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) cerrarModales();
  if (e.target.classList.contains('btn-outline') && e.target.closest('.modal-footer')) cerrarModales();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !document.querySelector('.modal-overlay.open')) buscarRelaciones();
});