// ── Sesión ───────────────────────────────────────────────
(function initSesion() {
  const rol = sessionStorage.getItem('rol');
  if (!rol) { window.location.href = 'login.html'; return; }
  if (rol === 'admin') document.body.classList.add('is-admin');
  renderNavUser(rol, sessionStorage.getItem('usuario') || '');
  if (rol !== 'admin') {
    document.querySelectorAll('th.admin-only').forEach(th => th.style.display = 'none');
  }
})();

function renderNavUser(rol, nombre) {
  const right = document.querySelector('.nav-right');
  if (!right) return;
  right.innerHTML = `
    <span class="nav-role-badge ${rol}"><span class="dot"></span>${nombre} · ${rol === 'admin' ? 'Administrador' : 'Usuario'}</span>
    <button class="nav-logout" onclick="logout()">
      <svg viewBox="0 0 24 24" style="width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
      </svg>Salir
    </button>`;
}

function logout() { sessionStorage.clear(); window.location.href = 'login.html'; }

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.className = 'toast ' + type;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// Cache de equipos (nombre → id)
let equiposCache = null;

async function cargarEquipos() {
  if (equiposCache) return equiposCache;
  try {
    const resp = await fetch('http://localhost:8080/busquedaEquipos');
    equiposCache = await resp.json();
  } catch(_) { equiposCache = []; }
  return equiposCache;
}

// ── Buscar ───────────────────────────────────────────────
async function buscarJugadores() {
  const nombre = document.getElementById('busNombre').value.trim();
  const equipoNombre = document.getElementById('busEquipoNombre').value.trim();

  document.getElementById('tabla').innerHTML = `
    <tr><td colspan="8"><div class="empty-state"><div class="icon">⏳</div><p>Cargando...</p></div></td></tr>`;

  try {
    let equipoId = null;
    if (equipoNombre) {
      // Buscar equipo por nombre (descripcion o categoria+grupo)
      const equipos = await cargarEquipos();
      const match = equipos.find(eq =>
        (eq.descripcion || '').toLowerCase().includes(equipoNombre.toLowerCase()) ||
        (`${eq.categoria} ${eq.grupo}`).toLowerCase().includes(equipoNombre.toLowerCase()) ||
        eq.codigo.toLowerCase().includes(equipoNombre.toLowerCase())
      );
      if (match) {
        equipoId = match.id_equipo;
      } else {
        // No se encontró equipo
        document.getElementById('tabla').innerHTML = `
          <tr><td colspan="8"><div class="empty-state"><div class="icon">⚽</div><p>No se encontró ningún equipo con ese nombre</p></div></td></tr>`;
        return;
      }
    }

    let url = 'http://localhost:8080/busquedaJugadores?';
    if (nombre) url += `nombre=${encodeURIComponent(nombre)}&`;
    if (equipoId !== null) url += `EQUIPO_id_equipo=${equipoId}`;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(await resp.text());
    const jugadores = await resp.json();

    // Enriquecer con nombre del equipo
    const equipos = await cargarEquipos();
    const equipoMap = {};
    equipos.forEach(eq => equipoMap[eq.id_equipo] = `${eq.categoria} ${eq.grupo}`);

    renderTabla(jugadores, equipoMap);
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
    document.getElementById('tabla').innerHTML = `
      <tr><td colspan="8"><div class="empty-state"><div class="icon">⚠️</div><p>Error al cargar datos</p></div></td></tr>`;
  }
}

function renderTabla(jugadores, equipoMap) {
  const tbody = document.getElementById('tabla');
  const esAdmin = document.body.classList.contains('is-admin');
  if (!jugadores.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="icon">⚽</div><p>No se encontraron jugadores</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = jugadores.map(j => `
    <tr>
      <td>${j.nombre}</td>
      <td>${equipoMap && equipoMap[j.eQUIPO_id_equipo] ? equipoMap[j.eQUIPO_id_equipo] : (j.eQUIPO_id_equipo || '—')}</td>
      <td>${j.fecha_nacimiento || '—'}</td>
      <td>${j.posicion || '—'}</td>
      <td>${j.dorsal ?? '—'}</td>
      <td>${j.score != null ? j.score.toFixed(2) : '—'}</td>
      <td><span class="badge ${j.activo ? 'badge-green' : 'badge-red'}">${j.activo ? 'Activo' : 'Inactivo'}</span></td>
      ${esAdmin ? `<td>
        <div class="td-actions">
          <button class="btn btn-icon btn-outline" title="Modificar"
            onclick="abrirModalModificar(${j.id_jugador},${j.eQUIPO_id_equipo},'${esc(j.nombre)}','${j.fecha_nacimiento}','${esc(j.posicion||'')}',${j.activo},${j.dorsal??'null'},${j.score??'null'})">
            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-icon btn-danger" title="Eliminar" onclick="eliminarJugador(${j.id_jugador})">
            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>` : ''}
    </tr>`).join('');
}

function esc(str) { return String(str).replace(/'/g, "\\'"); }

function limpiarFiltros() {
  document.getElementById('busNombre').value = '';
  document.getElementById('busEquipoNombre').value = '';
  document.getElementById('tabla').innerHTML = `
    <tr><td colspan="8"><div class="empty-state"><div class="icon">⚽</div><p>Pulsa Buscar para cargar los jugadores</p></div></td></tr>`;
}

// ── Modal Crear ──────────────────────────────────────────
function abrirModalCrear() {
  ['cNombre','cEquipo','cFecha','cPosicion','cDorsal','cScore'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('cActivo').value = 'true';
  document.getElementById('modalCrear').classList.add('open');
}

async function crearJugador() {
  const nombre = document.getElementById('cNombre').value.trim();
  const equipo = document.getElementById('cEquipo').value.trim();
  const fecha = document.getElementById('cFecha').value;
  const posicion = document.getElementById('cPosicion').value.trim();
  const dorsal = document.getElementById('cDorsal').value.trim();
  const score = document.getElementById('cScore').value.trim();
  const activo = document.getElementById('cActivo').value;

  if (!nombre || !equipo || !fecha) { showToast('Rellena los campos obligatorios', 'error'); return; }

  let url = `http://localhost:8080/crearJugador?EQUIPO_id_equipo=${equipo}&nombre=${encodeURIComponent(nombre)}&fecha_nacimiento=${fecha}&activo=${activo}`;
  if (posicion) url += `&posicion=${encodeURIComponent(posicion)}`;
  if (dorsal) url += `&dorsal=${dorsal}`;
  if (score) url += `&score=${score}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Jugador creado correctamente', 'success');
    cerrarModales(); buscarJugadores();
  } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

// ── Modal Modificar ──────────────────────────────────────
function abrirModalModificar(id, equipo, nombre, fecha, posicion, activo, dorsal, score) {
  document.getElementById('mId').value = id;
  document.getElementById('mNombre').value = nombre;
  document.getElementById('mEquipo').value = equipo;
  document.getElementById('mFecha').value = fecha;
  document.getElementById('mPosicion').value = posicion;
  document.getElementById('mActivo').value = String(activo);
  document.getElementById('mDorsal').value = dorsal !== null ? dorsal : '';
  document.getElementById('mScore').value = score !== null ? score : '';
  document.getElementById('modalModificar').classList.add('open');
}

async function ejecutarModificar() {
  const id = document.getElementById('mId').value;
  const nombre = document.getElementById('mNombre').value.trim();
  const equipo = document.getElementById('mEquipo').value.trim();
  const fecha = document.getElementById('mFecha').value;
  const posicion = document.getElementById('mPosicion').value.trim();
  const dorsal = document.getElementById('mDorsal').value.trim();
  const score = document.getElementById('mScore').value.trim();
  const activo = document.getElementById('mActivo').value;

  if (!nombre || !equipo || !fecha) { showToast('Rellena los campos obligatorios', 'error'); return; }

  let url = `http://localhost:8080/modificarJugador?id_jugador=${id}&EQUIPO_id_equipo=${equipo}&nombre=${encodeURIComponent(nombre)}&fecha_nacimiento=${fecha}&activo=${activo}`;
  if (posicion) url += `&posicion=${encodeURIComponent(posicion)}`;
  if (dorsal) url += `&dorsal=${dorsal}`;
  if (score) url += `&score=${score}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Jugador modificado', 'success');
    cerrarModales(); buscarJugadores();
  } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

// ── Eliminar ─────────────────────────────────────────────
async function eliminarJugador(id) {
  if (!confirm('¿Eliminar este jugador? Se borrarán también sus fichas médicas y participaciones en partidos.')) return;
  try {
    const resp = await fetch(`http://localhost:8080/eliminarJugador?id_jugador=${id}`);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Jugador eliminado', 'success');
    buscarJugadores();
  } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

// ── Cerrar modales ───────────────────────────────────────
function cerrarModales() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) cerrarModales();
  if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) cerrarModales();
  if (e.target.classList.contains('btn-outline') && e.target.closest('.modal-footer')) cerrarModales();
});

// Enter para buscar
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !document.querySelector('.modal-overlay.open')) buscarJugadores();
});