// ── Sesión ───────────────────────────────────────────────
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
  right.innerHTML = `
    <span class="nav-role-badge ${rol}"><span class="dot"></span>${nombre} · Administrador</span>
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

// Cache jugadores para mostrar nombres
let jugadoresCache = null;
async function cargarJugadores() {
  if (jugadoresCache) return jugadoresCache;
  try {
    const resp = await fetch('http://localhost:8080/busquedaJugadores');
    jugadoresCache = await resp.json();
  } catch(_) { jugadoresCache = []; }
  return jugadoresCache;
}

async function buscarFichas() {
  const jugadorNombre = document.getElementById('busJugadorNombre').value.trim();
  const apto = document.getElementById('busApto').value;

  document.getElementById('tabla').innerHTML = `
    <tr><td colspan="7"><div class="empty-state"><div class="icon">⏳</div><p>Cargando...</p></div></td></tr>`;

  try {
    let jugadorId = null;
    const jugadores = await cargarJugadores();
    const jugadorMap = {};
    jugadores.forEach(j => jugadorMap[j.id_jugador] = j.nombre);

    if (jugadorNombre) {
      // Buscar jugador por nombre
      const match = jugadores.find(j =>
        j.nombre.toLowerCase().includes(jugadorNombre.toLowerCase())
      );
      if (match) {
        jugadorId = match.id_jugador;
      } else {
        document.getElementById('tabla').innerHTML = `
          <tr><td colspan="7"><div class="empty-state"><div class="icon">🩺</div><p>No se encontró ningún jugador con ese nombre</p></div></td></tr>`;
        return;
      }
    }

    let url = 'http://localhost:8080/busquedaFichasMedicas?';
    if (jugadorId !== null) url += `JUGADOR_id_jugador=${jugadorId}&`;
    if (apto !== '') url += `apto=${apto}`;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(await resp.text());
    renderTabla(await resp.json(), jugadorMap);
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
    document.getElementById('tabla').innerHTML = `
      <tr><td colspan="7"><div class="empty-state"><div class="icon">⚠️</div><p>Error al cargar datos</p></div></td></tr>`;
  }
}

function renderTabla(fichas, jugadorMap) {
  const tbody = document.getElementById('tabla');
  if (!fichas.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="icon">🩺</div><p>No se encontraron fichas médicas</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = fichas.map(f => `
    <tr>
      <td>${jugadorMap && jugadorMap[f.jUGADOR_id_jugador] ? jugadorMap[f.jUGADOR_id_jugador] : (f.jUGADOR_id_jugador || '—')}</td>
      <td>${f.codigo}</td>
      <td>${f.descripcion || '—'}</td>
      <td>${f.grupo_sanguineo || '—'}</td>
      <td>${f.alergias || '—'}</td>
      <td><span class="badge ${f.apto ? 'badge-green' : 'badge-red'}">${f.apto ? 'Apto' : 'No apto'}</span></td>
      <td>
        <div class="td-actions">
          <button class="btn btn-icon btn-outline" title="Modificar"
            onclick="abrirModalModificar(${f.id_ficha},'${esc(f.descripcion||'')}','${esc(f.grupo_sanguineo||'')}','${esc(f.alergias||'')}',${f.apto})">
            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-icon btn-danger" title="Eliminar" onclick="eliminarFicha(${f.id_ficha})">
            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

function esc(str) { return String(str).replace(/'/g, "\\'"); }

function limpiarFiltros() {
  document.getElementById('busJugadorNombre').value = '';
  document.getElementById('busApto').value = '';
  document.getElementById('tabla').innerHTML = `
    <tr><td colspan="7"><div class="empty-state"><div class="icon">🩺</div><p>Pulsa Buscar para cargar las fichas médicas</p></div></td></tr>`;
}

function abrirModalCrear() {
  ['cJugador','cCodigo','cDescripcion','cGrupo','cAlergias'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('cApto').value = 'true';
  document.getElementById('modalCrear').classList.add('open');
}

async function crearFicha() {
  const jugador = document.getElementById('cJugador').value.trim();
  const codigo = document.getElementById('cCodigo').value.trim();
  const descripcion = document.getElementById('cDescripcion').value.trim();
  const grupo = document.getElementById('cGrupo').value.trim();
  const alergias = document.getElementById('cAlergias').value.trim();
  const apto = document.getElementById('cApto').value;

  if (!jugador || !codigo) { showToast('Rellena los campos obligatorios', 'error'); return; }

  let url = `http://localhost:8080/crearFichaMedica?JUGADOR_id_jugador=${jugador}&codigo=${encodeURIComponent(codigo)}&apto=${apto}`;
  if (descripcion) url += `&descripcion=${encodeURIComponent(descripcion)}`;
  if (grupo) url += `&grupo_sanguineo=${encodeURIComponent(grupo)}`;
  if (alergias) url += `&alergias=${encodeURIComponent(alergias)}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Ficha creada', 'success');
    cerrarModales(); buscarFichas();
  } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

function abrirModalModificar(id, descripcion, grupo, alergias, apto) {
  document.getElementById('mId').value = id;
  document.getElementById('mDescripcion').value = descripcion;
  document.getElementById('mGrupo').value = grupo;
  document.getElementById('mAlergias').value = alergias;
  document.getElementById('mApto').value = String(apto);
  document.getElementById('modalModificar').classList.add('open');
}

async function ejecutarModificar() {
  const id = document.getElementById('mId').value;
  const descripcion = document.getElementById('mDescripcion').value.trim();
  const grupo = document.getElementById('mGrupo').value.trim();
  const alergias = document.getElementById('mAlergias').value.trim();
  const apto = document.getElementById('mApto').value;

  let url = `http://localhost:8080/modificarFichaMedica?id_ficha_medica=${id}&apto=${apto}`;
  if (descripcion) url += `&descripcion=${encodeURIComponent(descripcion)}`;
  if (grupo) url += `&grupo_sanguineo=${encodeURIComponent(grupo)}`;
  if (alergias) url += `&alergias=${encodeURIComponent(alergias)}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Ficha modificada', 'success');
    cerrarModales(); buscarFichas();
  } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

async function eliminarFicha(id) {
  if (!confirm('¿Eliminar esta ficha médica?')) return;
  try {
    const resp = await fetch(`http://localhost:8080/eliminarFichaMedica?id_ficha_medica=${id}`);
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Ficha eliminada', 'success');
    buscarFichas();
  } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

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
  if (e.key === 'Enter' && !document.querySelector('.modal-overlay.open')) buscarFichas();
});